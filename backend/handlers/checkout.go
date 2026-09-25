package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// CheckoutHandler handles POST /api/checkout requests.
func CheckoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Idempotency key check
	idempotencyKey := r.Header.Get("X-Idempotency-Key")
	if idempotencyKey == "" {
		idempotencyKey = r.Header.Get("Idempotency-Key")
	}

	if idempotencyKey != "" {
		var existingOrder models.Order
		err := db.Pool.QueryRowContext(r.Context(), `
			SELECT id, customer_name, customer_email, subtotal, shipping_fee, total
			FROM public.orders WHERE idempotency_key = $1
		`, idempotencyKey).Scan(
			&existingOrder.ID, &existingOrder.CustomerName,
			&existingOrder.CustomerEmail, &existingOrder.Subtotal,
			&existingOrder.ShippingFee, &existingOrder.Total,
		)
		if err == nil {
			writeJSON(w, http.StatusOK, models.CheckoutResponse{
				Success:            true,
				OrderID:            existingOrder.ID,
				Subtotal:           existingOrder.Subtotal,
				ShippingFee:        existingOrder.ShippingFee,
				Total:              existingOrder.Total,
				CustomerName:       existingOrder.CustomerName,
				CustomerEmail:      existingOrder.CustomerEmail,
				IsIdempotentReplay: true,
			})
			return
		}
		// If error is anything other than no rows (e.g., column doesn't exist), continue
	}

	var req models.CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid checkout request. Your shopping bag appears empty.")
		return
	}

	if len(req.Items) == 0 {
		writeError(w, http.StatusBadRequest, "Invalid checkout request. Your shopping bag appears empty.")
		return
	}

	// 1. Strict Customer & Address Validation
	name := strings.TrimSpace(req.Customer.Name)
	if len(name) < 2 || len(name) > 100 {
		writeError(w, http.StatusBadRequest, "Please provide a valid full name.")
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Customer.Email))
	if !isValidEmail(email) || len(email) > 150 {
		writeError(w, http.StatusBadRequest, "Please provide a valid email address.")
		return
	}

	phone := strings.TrimSpace(req.Customer.Phone)
	if len(phone) < 7 || len(phone) > 25 {
		writeError(w, http.StatusBadRequest, "Please provide a valid contact telephone number.")
		return
	}

	address := strings.TrimSpace(req.Customer.Address)
	city := strings.TrimSpace(req.Customer.City)
	postalCode := strings.TrimSpace(req.Customer.PostalCode)
	if len(address) < 5 || len(city) < 2 || postalCode == "" {
		writeError(w, http.StatusBadRequest, "Please complete all required shipping address fields.")
		return
	}

	// 2. Batch-fetch products to verify prices server-side
	itemIDs := make([]string, 0, len(req.Items))
	seen := make(map[string]bool)
	for _, item := range req.Items {
		if !seen[item.ID] {
			itemIDs = append(itemIDs, item.ID)
			seen[item.ID] = true
		}
	}

	type catalogProduct struct {
		ID            string
		Name          string
		Price         float64
		Image         string
		InStock       bool
		StockQuantity int
	}
	catalog := make(map[string]catalogProduct)

	// Build a parameterized IN query
	placeholders := make([]string, len(itemIDs))
	args := make([]interface{}, len(itemIDs))
	for i, id := range itemIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT id, name, price, image, in_stock, stock_quantity
		FROM public.products
		WHERE id IN (%s)
	`, strings.Join(placeholders, ","))

	rows, err := db.Pool.QueryContext(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to verify product catalog.")
		return
	}
	defer rows.Close()

	for rows.Next() {
		var p catalogProduct
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Image, &p.InStock, &p.StockQuantity); err != nil {
			continue
		}
		catalog[p.ID] = p
	}

	// 3. Verify each item and compute totals
	var verifiedSubtotal float64
	type verifiedItem struct {
		ProductID     string
		ProductName   string
		Price         float64
		Quantity      int
		SelectedColor string
		Image         string
	}
	var verifiedItems []verifiedItem

	for _, item := range req.Items {
		quantity := item.Quantity
		if quantity <= 0 || quantity > 10 {
			writeError(w, http.StatusBadRequest,
				fmt.Sprintf("Invalid quantity for item %s. Maximum 10 units per creation.", item.ID))
			return
		}

		p, ok := catalog[item.ID]
		if !ok {
			writeError(w, http.StatusBadRequest,
				fmt.Sprintf("Product reference %s could not be verified in the atelier catalog.", item.ID))
			return
		}

		if !p.InStock || p.StockQuantity < quantity {
			writeError(w, http.StatusConflict,
				fmt.Sprintf("\"%s\" does not have sufficient stock for this order quantity.", p.Name))
			return
		}

		verifiedSubtotal += p.Price * float64(quantity)

		selectedColor := item.SelectedColor
		if len(selectedColor) > 50 {
			selectedColor = selectedColor[:50]
		}

		verifiedItems = append(verifiedItems, verifiedItem{
			ProductID:     p.ID,
			ProductName:   p.Name,
			Price:         p.Price,
			Quantity:      quantity,
			SelectedColor: selectedColor,
			Image:         p.Image,
		})
	}

	// 4. Calculate financial totals
	isFreeShipping := verifiedSubtotal >= 5000
	shippingFee := 250.0
	if isFreeShipping {
		shippingFee = 0
	}
	grandTotal := verifiedSubtotal + shippingFee

	// 5. Generate unique, cryptographically secure order ID
	// Prevents order enumeration and primary key collisions
	orderSuffixBytes := make([]byte, 4)
	var orderID string
	if _, err := rand.Read(orderSuffixBytes); err == nil {
		orderID = fmt.Sprintf("NIS-2026-%X", orderSuffixBytes)
	} else {
		orderID = fmt.Sprintf("NIS-2026-%d", time.Now().UnixNano()%900000+100000)
	}

	// 6. Build shipping address JSON
	shippingAddr, _ := json.Marshal(map[string]string{
		"address":       address,
		"city":          city,
		"state":         req.Customer.State,
		"postalCode":    postalCode,
		"paymentMethod": req.Customer.PaymentMethod,
	})

	// 7. Payment status based on payment method
	// Cash on Delivery (COD): Order is confirmed upon placement, payment remains pending until delivery.
	// Online Payment (Card / UPI / Razorpay): Both payment and order status remain pending until
	// cryptographically verified via /api/payment/razorpay/verify.
	// SECURITY: Never trust client-supplied paymentId alone to mark an order as 'paid'.
	isCOD := strings.EqualFold(strings.TrimSpace(req.Customer.PaymentMethod), "cod")
	paymentStatus := "pending"
	orderStatus := "pending"
	if isCOD {
		orderStatus = "confirmed"
	}

	// Insert order (try with idempotency key first, then without)
	var insertErr error
	if idempotencyKey != "" {
		_, insertErr = db.Pool.ExecContext(r.Context(), `
			INSERT INTO public.orders (
				id, customer_name, customer_email, customer_phone,
				shipping_address, subtotal, shipping_fee, total,
				payment_status, order_status, idempotency_key, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
		`, orderID, name, email, ptrStr(phone),
			shippingAddr, verifiedSubtotal, shippingFee, grandTotal, paymentStatus, orderStatus, idempotencyKey)

		if insertErr != nil {
			// Fallback: try without idempotency_key column (may not exist yet)
			_, insertErr = db.Pool.ExecContext(r.Context(), `
				INSERT INTO public.orders (
					id, customer_name, customer_email, customer_phone,
					shipping_address, subtotal, shipping_fee, total,
					payment_status, order_status, created_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
			`, orderID, name, email, ptrStr(phone),
				shippingAddr, verifiedSubtotal, shippingFee, grandTotal, paymentStatus, orderStatus)
		}
	} else {
		_, insertErr = db.Pool.ExecContext(r.Context(), `
			INSERT INTO public.orders (
				id, customer_name, customer_email, customer_phone,
				shipping_address, subtotal, shipping_fee, total,
				payment_status, order_status, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
		`, orderID, name, email, ptrStr(phone),
			shippingAddr, verifiedSubtotal, shippingFee, grandTotal, paymentStatus, orderStatus)
	}

	if insertErr != nil {
		writeError(w, http.StatusInternalServerError, "Database transaction failed under current load. Please try again.")
		return
	}

	// 8. Insert order items in batch
	for _, item := range verifiedItems {
		_, err := db.Pool.ExecContext(r.Context(), `
			INSERT INTO public.order_items (
				order_id, product_id, product_name, price, quantity, selected_color, image
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, orderID, item.ProductID, item.ProductName, item.Price,
			item.Quantity, ptrStr(item.SelectedColor), item.Image)
		if err != nil {
			// Log but don't fail the order
			continue
		}
	}

	// 9. Decrement inventory ONLY for confirmed orders (e.g. COD)
	// SECURITY: For online payment orders (card / upi), do NOT decrement inventory
	// until payment is cryptographically verified (in VerifyRazorpayPaymentHandler / Webhook).
	// This prevents "Inventory Exhaustion / Denial of Inventory" attacks where
	// an attacker creates fake pending orders to wipe out stock without paying.
	if isCOD {
		for _, item := range verifiedItems {
			db.Pool.ExecContext(r.Context(), `
				UPDATE public.products
				SET stock_quantity = GREATEST(0, stock_quantity - $1),
				    in_stock = (stock_quantity - $1 > 0),
				    updated_at = NOW()
				WHERE id = $2 AND stock_quantity >= $1
			`, item.Quantity, item.ProductID)
		}
	}

	writeJSON(w, http.StatusOK, models.CheckoutResponse{
		Success:       true,
		OrderID:       orderID,
		Subtotal:      verifiedSubtotal,
		ShippingFee:   shippingFee,
		Total:         grandTotal,
		CustomerName:  name,
		CustomerEmail: email,
		Destination:   fmt.Sprintf("%s, %s - %s", address, city, postalCode),
		PaymentStatus: paymentStatus,
		PaymentID:     req.PaymentID,
	})
}

// isValidEmail performs a basic email format check.
func isValidEmail(email string) bool {
	if email == "" {
		return false
	}
	parts := strings.SplitN(email, "@", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return false
	}
	if !strings.Contains(parts[1], ".") {
		return false
	}
	return true
}

// hashCode provides a simple string hash for order ID generation.
func hashCode(s string) int64 {
	var h int64
	for _, c := range s {
		h = 31*h + int64(c)
	}
	return h
}

// AdminGetAllProducts returns all products (including non-published) for admin use.
func AdminGetAllProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, name, slug, tagline, price, original_price, image, secondary_image,
		       gallery, category, badge, description, story, details, care,
		       material, dimensions, weight, closure, interior, strap, lining,
		       sku, origin, color, colors, rating, review_count, in_stock,
		       stock_quantity, featured, status, created_at, updated_at
		FROM public.products
		ORDER BY created_at DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch products")
		return
	}
	defer rows.Close()

	products := make([]models.Product, 0)
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Slug, &p.Tagline, &p.Price, &p.OriginalPrice,
			&p.Image, &p.SecondaryImage, &p.Gallery, &p.Category, &p.Badge,
			&p.Description, &p.Story, &p.Details, &p.Care, &p.Material,
			&p.Dimensions, &p.Weight, &p.Closure, &p.Interior, &p.Strap,
			&p.Lining, &p.SKU, &p.Origin, &p.Color, &p.Colors, &p.Rating,
			&p.ReviewCount, &p.InStock, &p.StockQuantity, &p.Featured,
			&p.Status, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			continue
		}
		products = append(products, p)
	}

	writeJSON(w, http.StatusOK, products)
}

// AdminGetOrderDetail returns a single order with its items.
func AdminGetOrderDetail(w http.ResponseWriter, r *http.Request) {
	orderID := r.URL.Query().Get("id")
	if orderID == "" {
		writeError(w, http.StatusBadRequest, "Order ID is required")
		return
	}

	var order models.Order
	err := db.Pool.QueryRowContext(r.Context(), `
		SELECT id, customer_name, customer_email, customer_phone,
		       shipping_address, subtotal, shipping_fee, total,
		       payment_status, order_status, created_at
		FROM public.orders WHERE id = $1
	`, orderID).Scan(
		&order.ID, &order.CustomerName, &order.CustomerEmail, &order.CustomerPhone,
		&order.ShippingAddress, &order.Subtotal, &order.ShippingFee, &order.Total,
		&order.PaymentStatus, &order.OrderStatus, &order.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Order not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to fetch order")
		return
	}

	// Fetch order items
	itemRows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, order_id, product_id, product_name, price, quantity, selected_color, image
		FROM public.order_items WHERE order_id = $1
	`, orderID)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"order": order,
			"items": []models.OrderItem{},
		})
		return
	}
	defer itemRows.Close()

	items := make([]models.OrderItem, 0)
	for itemRows.Next() {
		var item models.OrderItem
		if err := itemRows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.ProductName,
			&item.Price, &item.Quantity, &item.SelectedColor, &item.Image,
		); err != nil {
			continue
		}
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"order": order,
		"items": items,
	})
}
