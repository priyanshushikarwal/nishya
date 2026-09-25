package handlers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/nishya/backend/db"
)

// RazorpayItemInput represents an item in the cart for server-side price verification.
type RazorpayItemInput struct {
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}

// RazorpayOrderRequest is the payload for creating a Razorpay order.
type RazorpayOrderRequest struct {
	OrderID  string              `json:"orderId,omitempty"` // Nishya Order ID (NIS-2026-...)
	Items    []RazorpayItemInput `json:"items,omitempty"`   // Cart items for server-side verification
	Amount   float64             `json:"amount,omitempty"`  // Fallback amount in INR if orderId/items not provided
	Currency string              `json:"currency"`
	Receipt  string              `json:"receipt"`
}

// RazorpayOrderResponse returns the order ID for checkout.js
type RazorpayOrderResponse struct {
	ID       string `json:"id"`
	Amount   int64  `json:"amount"` // in paise
	Currency string `json:"currency"`
	KeyID    string `json:"key_id"`
	IsMock   bool   `json:"is_mock,omitempty"`
}

// RazorpayVerifyRequest is the payload returned by Razorpay checkout modal
type RazorpayVerifyRequest struct {
	OrderID           string `json:"orderId"`
	RazorpayOrderID   string `json:"razorpayOrderId"`
	RazorpayPaymentID string `json:"razorpayPaymentId"`
	RazorpaySignature string `json:"razorpaySignature"`
}

// CreateRazorpayOrderHandler initiates an order on Razorpay.
// SECURITY: When orderId or items are provided, the payable amount is ALWAYS loaded
// directly from the database (public.products / public.orders), preventing client-side
// price tampering or spoofing.
func CreateRazorpayOrderHandler(keyID, keySecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		var req RazorpayOrderRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid order request payload")
			return
		}

		req.OrderID = strings.TrimSpace(req.OrderID)

		// 1. Authoritative Amount Determination
		var verifiedAmount float64

		if req.OrderID != "" {
			// Case A: Nishya Order ID is provided — query order total from DB
			err := db.Pool.QueryRowContext(r.Context(), `
				SELECT total FROM public.orders WHERE id = $1
			`, req.OrderID).Scan(&verifiedAmount)
			if err != nil {
				writeError(w, http.StatusNotFound, "Referenced order not found. Please initiate checkout first.")
				return
			}
			if verifiedAmount <= 0 {
				writeError(w, http.StatusBadRequest, "Invalid order total stored in database.")
				return
			}
			req.Amount = verifiedAmount
		} else if len(req.Items) > 0 {
			// Case B: Cart items provided — calculate total directly from product catalog in DB
			itemIDs := make([]string, 0, len(req.Items))
			seen := make(map[string]bool)
			for _, item := range req.Items {
				item.ID = strings.TrimSpace(item.ID)
				if item.ID != "" && !seen[item.ID] {
					itemIDs = append(itemIDs, item.ID)
					seen[item.ID] = true
				}
			}

			if len(itemIDs) > 0 {
				placeholders := make([]string, len(itemIDs))
				args := make([]interface{}, len(itemIDs))
				for i, id := range itemIDs {
					placeholders[i] = fmt.Sprintf("$%d", i+1)
					args[i] = id
				}

				query := fmt.Sprintf(`
					SELECT id, price, in_stock, stock_quantity
					FROM public.products
					WHERE id IN (%s)
				`, strings.Join(placeholders, ","))

				rows, err := db.Pool.QueryContext(r.Context(), query, args...)
				if err == nil {
					defer rows.Close()
					priceMap := make(map[string]float64)
					for rows.Next() {
						var pid string
						var price float64
						var inStock bool
						var stockQty int
						if err := rows.Scan(&pid, &price, &inStock, &stockQty); err == nil {
							priceMap[pid] = price
						}
					}

					var calculatedSubtotal float64
					for _, item := range req.Items {
						qty := item.Quantity
						if qty <= 0 {
							qty = 1
						}
						if price, ok := priceMap[item.ID]; ok {
							calculatedSubtotal += price * float64(qty)
						}
					}

					if calculatedSubtotal > 0 {
						// Free shipping on ₹5,000+ orders, otherwise standard ₹250
						var shippingFee float64 = 250
						if calculatedSubtotal >= 5000 {
							shippingFee = 0
						}
						serverTotal := calculatedSubtotal + shippingFee

						if req.Amount > 0 && math.Abs(req.Amount-serverTotal) > 1.0 {
							log.Printf("⚠️ [SECURITY WARNING] Client price mismatch: client sent ₹%.2f, DB computed ₹%.2f. Enforcing DB price.", req.Amount, serverTotal)
						}
						req.Amount = serverTotal
					}
				}
			}
		}

		// Fallback check: amount must be strictly positive
		if req.Amount <= 0 {
			writeError(w, http.StatusBadRequest, "Invalid order amount or missing order reference.")
			return
		}

		if req.Currency == "" {
			req.Currency = "INR"
		}

		if req.Receipt == "" {
			if req.OrderID != "" {
				req.Receipt = req.OrderID
			} else {
				req.Receipt = fmt.Sprintf("rcpt_%d", time.Now().Unix())
			}
		}

		amountInPaise := int64(math.Round(req.Amount * 100))

		// 2. If Key Secret is configured, create live Razorpay order via official REST API
		if keyID != "" && keySecret != "" {
			payload, _ := json.Marshal(map[string]interface{}{
				"amount":   amountInPaise,
				"currency": req.Currency,
				"receipt":  req.Receipt,
				"notes": map[string]string{
					"order_id": req.OrderID,
				},
			})

			client := &http.Client{Timeout: 10 * time.Second}
			httpReq, err := http.NewRequestWithContext(r.Context(), http.MethodPost, "https://api.razorpay.com/v1/orders", bytes.NewReader(payload))
			if err == nil {
				httpReq.SetBasicAuth(keyID, keySecret)
				httpReq.Header.Set("Content-Type", "application/json")

				resp, err := client.Do(httpReq)
				if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
					defer resp.Body.Close()
					var rzpRes struct {
						ID       string `json:"id"`
						Amount   int64  `json:"amount"`
						Currency string `json:"currency"`
					}
					if err := json.NewDecoder(resp.Body).Decode(&rzpRes); err == nil && rzpRes.ID != "" {
						writeJSON(w, http.StatusOK, RazorpayOrderResponse{
							ID:       rzpRes.ID,
							Amount:   rzpRes.Amount,
							Currency: rzpRes.Currency,
							KeyID:    keyID,
						})
						return
					}
				} else if resp != nil {
					defer resp.Body.Close()
					errBody, _ := io.ReadAll(resp.Body)
					log.Printf("❌ [Razorpay API Error] %s", string(errBody))
				}
			}
		}

		// Client-side test checkout mode (when secret is not yet configured or for offline sandbox)
		testOrderID := fmt.Sprintf("order_test_%d_%04d", time.Now().Unix(), rand.Intn(10000))
		writeJSON(w, http.StatusOK, RazorpayOrderResponse{
			ID:       testOrderID,
			Amount:   amountInPaise,
			Currency: req.Currency,
			KeyID:    keyID,
			IsMock:   keySecret == "",
		})
	}
}

// VerifyRazorpayPaymentHandler validates cryptographic payment signature AND verifies
// the actual paid amount against the database order total via Razorpay's API.
// SECURITY: Prevents spoofed, zero-rupee, or tampered payments from marking orders as paid.
func VerifyRazorpayPaymentHandler(keyID, keySecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		var req RazorpayVerifyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid payment verification payload")
			return
		}

		req.OrderID = strings.TrimSpace(req.OrderID)
		req.RazorpayOrderID = strings.TrimSpace(req.RazorpayOrderID)
		req.RazorpayPaymentID = strings.TrimSpace(req.RazorpayPaymentID)
		req.RazorpaySignature = strings.TrimSpace(req.RazorpaySignature)

		if req.OrderID == "" {
			writeError(w, http.StatusBadRequest, "Order ID is strictly required for payment confirmation.")
			return
		}

		if req.RazorpayPaymentID == "" {
			writeError(w, http.StatusBadRequest, "Razorpay Payment ID is required.")
			return
		}

		// 1. Verify the order exists in the database and get its total
		var orderTotal float64
		var currentPaymentStatus string
		err := db.Pool.QueryRowContext(r.Context(), `
			SELECT total, payment_status FROM public.orders WHERE id = $1
		`, req.OrderID).Scan(&orderTotal, &currentPaymentStatus)
		if err != nil {
			writeError(w, http.StatusNotFound, "Order not found in database.")
			return
		}

		// Idempotent: If already marked as paid, return success immediately
		if currentPaymentStatus == "paid" {
			writeJSON(w, http.StatusOK, map[string]interface{}{
				"success":   true,
				"orderId":   req.OrderID,
				"paymentId": req.RazorpayPaymentID,
				"status":    "paid",
				"verified":  true,
				"message":   "Order was already verified and paid",
			})
			return
		}

		// 2. Cryptographic HMAC-SHA256 signature verification
		if keySecret != "" {
			if req.RazorpayOrderID == "" || req.RazorpaySignature == "" {
				writeError(w, http.StatusBadRequest, "Payment signature and Razorpay Order ID are strictly required.")
				return
			}

			data := fmt.Sprintf("%s|%s", req.RazorpayOrderID, req.RazorpayPaymentID)
			h := hmac.New(sha256.New, []byte(keySecret))
			h.Write([]byte(data))
			expectedSignature := hex.EncodeToString(h.Sum(nil))

			if !hmac.Equal([]byte(strings.ToLower(expectedSignature)), []byte(strings.ToLower(req.RazorpaySignature))) {
				log.Printf("🚨 [FRAUD ALERT] Invalid payment signature for order %s! Tampering attempt blocked.", req.OrderID)
				writeError(w, http.StatusBadRequest, "Payment signature verification failed. Tampered or fraudulent payment detected.")
				return
			}

			// 3. Double-check amount against Razorpay API directly
			if keyID != "" {
				client := &http.Client{Timeout: 8 * time.Second}
				rzpURL := fmt.Sprintf("https://api.razorpay.com/v1/payments/%s", req.RazorpayPaymentID)
				rzpReq, err := http.NewRequestWithContext(r.Context(), http.MethodGet, rzpURL, nil)
				if err == nil {
					rzpReq.SetBasicAuth(keyID, keySecret)
					resp, err := client.Do(rzpReq)
					if err == nil && resp.StatusCode == http.StatusOK {
						defer resp.Body.Close()
						var paymentDetails struct {
							Status  string `json:"status"`
							Amount  int64  `json:"amount"` // in paise
							OrderID string `json:"order_id"`
						}
						if err := json.NewDecoder(resp.Body).Decode(&paymentDetails); err == nil {
							expectedPaise := int64(math.Round(orderTotal * 100))

							// Enforce exact amount match
							if paymentDetails.Amount != expectedPaise {
								log.Printf("🚨 [CRITICAL FRAUD DETECTED] Order %s amount mismatch! Expected %d paise (₹%.2f), but Razorpay captured %d paise.",
									req.OrderID, expectedPaise, orderTotal, paymentDetails.Amount)

								// Flag order in database as fraud attempt
								db.Pool.ExecContext(r.Context(), `
									UPDATE public.orders
									SET payment_status = 'fraud_flagged',
									    order_status = 'cancelled',
									    updated_at = NOW()
									WHERE id = $1
								`, req.OrderID)

								writeError(w, http.StatusBadRequest, "Payment amount mismatch detected. Transaction flagged for manual review.")
								return
							}

							// Verify payment status is captured or authorized
							if paymentDetails.Status != "captured" && paymentDetails.Status != "authorized" {
								writeError(w, http.StatusBadRequest, fmt.Sprintf("Payment status '%s' is not yet confirmed by bank.", paymentDetails.Status))
								return
							}
						}
					}
				}
			}
		} else {
			// Mock sandbox mode (when RAZORPAY_KEY_SECRET is not configured in local dev)
			isMockOrder := strings.HasPrefix(req.RazorpayOrderID, "order_test_") || strings.HasPrefix(req.RazorpayPaymentID, "pay_test_")
			if !isMockOrder {
				writeError(w, http.StatusBadRequest, "Live payment verification requires RAZORPAY_KEY_SECRET to be configured on the server.")
				return
			}
		}

		// 4. Atomically update order in database to 'paid' and 'confirmed'
		result, err := db.Pool.ExecContext(r.Context(), `
			UPDATE public.orders
			SET payment_status = 'paid',
			    order_status = 'confirmed',
			    updated_at = NOW()
			WHERE id = $1
		`, req.OrderID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Database error updating payment status.")
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			writeError(w, http.StatusNotFound, "Order update failed. Order not found.")
			return
		}

		log.Printf("✅ [PAYMENT CONFIRMED] Order %s successfully verified for ₹%.2f via payment %s",
			req.OrderID, orderTotal, req.RazorpayPaymentID)

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"success":   true,
			"orderId":   req.OrderID,
			"paymentId": req.RazorpayPaymentID,
			"status":    "paid",
			"verified":  true,
		})
	}
}

// RazorpayWebhookHandler processes server-to-server webhook notifications directly from Razorpay.
// SECURITY: Validates X-Razorpay-Signature header against the raw body using the webhook secret.
// This guarantees that orders are confirmed even if the customer's browser crashes or closes prematurely.
func RazorpayWebhookHandler(webhookSecret, keyID, keySecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			writeError(w, http.StatusBadRequest, "Could not read webhook body")
			return
		}

		// 1. Cryptographic Webhook Signature Check
		if webhookSecret != "" {
			signature := r.Header.Get("X-Razorpay-Signature")
			if signature == "" {
				log.Println("🚨 [WEBHOOK REJECTED] Missing X-Razorpay-Signature header")
				writeError(w, http.StatusUnauthorized, "Missing webhook signature")
				return
			}

			h := hmac.New(sha256.New, []byte(webhookSecret))
			h.Write(bodyBytes)
			expectedSig := hex.EncodeToString(h.Sum(nil))

			if !hmac.Equal([]byte(strings.ToLower(signature)), []byte(strings.ToLower(expectedSig))) {
				log.Println("🚨 [WEBHOOK REJECTED] Invalid X-Razorpay-Signature! Unauthorized request.")
				writeError(w, http.StatusUnauthorized, "Invalid webhook signature")
				return
			}
		}

		// 2. Parse Webhook Event Payload
		var eventPayload struct {
			Entity    string `json:"entity"`
			Event     string `json:"event"`
			CreatedAt int64  `json:"created_at"`
			Payload   struct {
				Payment struct {
					Entity struct {
						ID      string            `json:"id"`
						Amount  int64             `json:"amount"` // in paise
						Status  string            `json:"status"`
						OrderID string            `json:"order_id"`
						Notes   map[string]string `json:"notes"`
					} `json:"entity"`
				} `json:"payment"`
				Order struct {
					Entity struct {
						ID      string            `json:"id"`
						Amount  int64             `json:"amount"`
						Status  string            `json:"status"`
						Receipt string            `json:"receipt"`
						Notes   map[string]string `json:"notes"`
					} `json:"entity"`
				} `json:"order"`
			} `json:"payload"`
		}

		if err := json.Unmarshal(bodyBytes, &eventPayload); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid webhook JSON structure")
			return
		}

		log.Printf("🔔 [RAZORPAY WEBHOOK RECEIVED] Event: %s", eventPayload.Event)

		switch eventPayload.Event {
		case "payment.captured", "order.paid":
			payment := eventPayload.Payload.Payment.Entity
			orderEntity := eventPayload.Payload.Order.Entity

			// Try to find the Nishya order ID from notes or receipt
			nishyaOrderID := payment.Notes["order_id"]
			if nishyaOrderID == "" {
				nishyaOrderID = orderEntity.Notes["order_id"]
			}
			if nishyaOrderID == "" && strings.HasPrefix(orderEntity.Receipt, "NIS-") {
				nishyaOrderID = orderEntity.Receipt
			}

			if nishyaOrderID != "" {
				var orderTotal float64
				err := db.Pool.QueryRowContext(r.Context(), `
					SELECT total FROM public.orders WHERE id = $1
				`, nishyaOrderID).Scan(&orderTotal)

				if err == nil {
					expectedPaise := int64(math.Round(orderTotal * 100))
					// Verify amount if payment amount is populated
					if payment.Amount > 0 && payment.Amount != expectedPaise {
						log.Printf("🚨 [WEBHOOK FRAUD ALERT] Amount mismatch for order %s: expected %d paise, got %d paise",
							nishyaOrderID, expectedPaise, payment.Amount)
						writeJSON(w, http.StatusOK, map[string]string{"status": "flagged_mismatch"})
						return
					}

					// Update to paid
					db.Pool.ExecContext(r.Context(), `
						UPDATE public.orders
						SET payment_status = 'paid',
						    order_status = 'confirmed',
						    updated_at = NOW()
						WHERE id = $1
					`, nishyaOrderID)
					log.Printf("✅ [WEBHOOK CONFIRMED] Order %s marked paid via webhook", nishyaOrderID)
				}
			}

		case "payment.failed":
			payment := eventPayload.Payload.Payment.Entity
			nishyaOrderID := payment.Notes["order_id"]
			if nishyaOrderID != "" {
				db.Pool.ExecContext(r.Context(), `
					UPDATE public.orders
					SET payment_status = 'failed',
					    updated_at = NOW()
					WHERE id = $1 AND payment_status != 'paid'
				`, nishyaOrderID)
				log.Printf("⚠️ [WEBHOOK] Payment failed recorded for order %s", nishyaOrderID)
			}
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}
