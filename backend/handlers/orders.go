package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// OrdersHandler handles /api/orders requests.
func OrdersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetOrders(w, r)
	case http.MethodPatch:
		handleUpdateOrderStatus(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func handleGetOrders(w http.ResponseWriter, r *http.Request) {
	// Check if requesting a specific order
	orderID := r.URL.Query().Get("id")
	if orderID != "" {
		AdminGetOrderDetail(w, r)
		return
	}

	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT o.id, o.customer_name, o.customer_email, o.customer_phone,
		       o.subtotal, o.shipping_fee, o.total, o.payment_status,
		       o.order_status, o.created_at,
		       COALESCE((SELECT SUM(oi.quantity) FROM public.order_items oi WHERE oi.order_id = o.id), 0) as items_count
		FROM public.orders o
		ORDER BY o.created_at DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch orders")
		return
	}
	defer rows.Close()

	type OrderWithCount struct {
		models.Order
		ItemsCount int `json:"items_count"`
	}

	orders := make([]map[string]interface{}, 0)
	for rows.Next() {
		var o models.Order
		var itemsCount int
		err := rows.Scan(
			&o.ID, &o.CustomerName, &o.CustomerEmail, &o.CustomerPhone,
			&o.Subtotal, &o.ShippingFee, &o.Total, &o.PaymentStatus,
			&o.OrderStatus, &o.CreatedAt, &itemsCount,
		)
		if err != nil {
			continue
		}
		orders = append(orders, map[string]interface{}{
			"id":             o.ID,
			"customer_name":  o.CustomerName,
			"customer_email": o.CustomerEmail,
			"customer_phone": o.CustomerPhone,
			"subtotal":       o.Subtotal,
			"shipping_fee":   o.ShippingFee,
			"total":          o.Total,
			"payment_status": o.PaymentStatus,
			"order_status":   o.OrderStatus,
			"created_at":     o.CreatedAt,
			"items_count":    itemsCount,
		})
	}

	writeJSON(w, http.StatusOK, orders)
}

func handleUpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	// Extract order ID from URL path: /api/orders/{id}/status
	path := strings.TrimPrefix(r.URL.Path, "/api/orders/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "status" {
		writeError(w, http.StatusBadRequest, "Invalid URL. Use /api/orders/{id}/status")
		return
	}
	orderID := parts[0]

	var req models.OrderStatusUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	validStatuses := map[string]bool{
		"pending": true, "confirmed": true, "processing": true,
		"shipped": true, "delivered": true, "cancelled": true,
	}
	if !validStatuses[req.Status] {
		writeError(w, http.StatusBadRequest, "Invalid order status")
		return
	}

	result, err := db.Pool.ExecContext(r.Context(), `
		UPDATE public.orders SET order_status = $1 WHERE id = $2
	`, req.Status, orderID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update order status")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "Order not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"orderId": orderID,
		"status":  req.Status,
	})
}
