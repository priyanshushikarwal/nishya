package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

// NullString is a helper that serializes sql.NullString to JSON as string|null.
type NullString struct {
	sql.NullString
}

func (ns NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

func (ns *NullString) UnmarshalJSON(data []byte) error {
	var s *string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	if s != nil {
		ns.Valid = true
		ns.String = *s
	} else {
		ns.Valid = false
	}
	return nil
}

// NullFloat64 is a helper that serializes sql.NullFloat64 to JSON as number|null.
type NullFloat64 struct {
	sql.NullFloat64
}

func (nf NullFloat64) MarshalJSON() ([]byte, error) {
	if !nf.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(nf.Float64)
}

func (nf *NullFloat64) UnmarshalJSON(data []byte) error {
	var f *float64
	if err := json.Unmarshal(data, &f); err != nil {
		return err
	}
	if f != nil {
		nf.Valid = true
		nf.Float64 = *f
	} else {
		nf.Valid = false
	}
	return nil
}

// Product matches the public.products table schema.
type Product struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Slug           string          `json:"slug"`
	Tagline        *string         `json:"tagline,omitempty"`
	Price          float64         `json:"price"`
	OriginalPrice  *float64        `json:"original_price,omitempty"`
	Image          string          `json:"image"`
	SecondaryImage *string         `json:"secondary_image,omitempty"`
	Gallery        json.RawMessage `json:"gallery"`
	Category       string          `json:"category"`
	Badge          *string         `json:"badge,omitempty"`
	Description    string          `json:"description"`
	Story          *string         `json:"story,omitempty"`
	Details        json.RawMessage `json:"details"`
	Care           json.RawMessage `json:"care"`
	Material       *string         `json:"material,omitempty"`
	Dimensions     *string         `json:"dimensions,omitempty"`
	Weight         *string         `json:"weight,omitempty"`
	Closure        *string         `json:"closure,omitempty"`
	Interior       *string         `json:"interior,omitempty"`
	Strap          *string         `json:"strap,omitempty"`
	Lining         *string         `json:"lining,omitempty"`
	SKU            *string         `json:"sku,omitempty"`
	Origin         *string         `json:"origin,omitempty"`
	Color          *string         `json:"color,omitempty"`
	Colors         json.RawMessage `json:"colors"`
	Rating         float64         `json:"rating"`
	ReviewCount    int             `json:"review_count"`
	InStock        bool            `json:"in_stock"`
	StockQuantity  int             `json:"stock_quantity"`
	Featured       bool            `json:"featured"`
	Status         string          `json:"status"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// Category matches the public.categories table schema.
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description,omitempty"`
	Image       *string   `json:"image,omitempty"`
	SortOrder   int       `json:"sort_order"`
	IsVisible   bool      `json:"is_visible"`
	CreatedAt   time.Time `json:"created_at"`
}

// HeroCampaign matches the public.hero_campaigns table schema.
type HeroCampaign struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Subtitle     *string   `json:"subtitle,omitempty"`
	Description  *string   `json:"description,omitempty"`
	CTAText      string    `json:"cta_text"`
	CTAURL       string    `json:"cta_url"`
	DesktopImage string    `json:"desktop_image"`
	MobileImage  *string   `json:"mobile_image,omitempty"`
	SortOrder    int       `json:"sort_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

// HomepageSection matches the public.homepage_sections table schema.
type HomepageSection struct {
	ID        string          `json:"id"`
	Title     string          `json:"title"`
	Subtitle  *string         `json:"subtitle,omitempty"`
	Content   json.RawMessage `json:"content"`
	SortOrder int             `json:"sort_order"`
	IsVisible bool            `json:"is_visible"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// Order matches the public.orders table schema.
type Order struct {
	ID              string          `json:"id"`
	CustomerName    string          `json:"customer_name"`
	CustomerEmail   string          `json:"customer_email"`
	CustomerPhone   *string         `json:"customer_phone,omitempty"`
	ShippingAddress json.RawMessage `json:"shipping_address"`
	Subtotal        float64         `json:"subtotal"`
	ShippingFee     float64         `json:"shipping_fee"`
	Total           float64         `json:"total"`
	PaymentStatus   string          `json:"payment_status"`
	OrderStatus     string          `json:"order_status"`
	IdempotencyKey  *string         `json:"idempotency_key,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
}

// OrderItem matches the public.order_items table schema.
type OrderItem struct {
	ID            string   `json:"id"`
	OrderID       string   `json:"order_id"`
	ProductID     *string  `json:"product_id,omitempty"`
	ProductName   string   `json:"product_name"`
	Price         float64  `json:"price"`
	Quantity      int      `json:"quantity"`
	SelectedColor *string  `json:"selected_color,omitempty"`
	Image         *string  `json:"image,omitempty"`
}

// Review matches the public.reviews table schema.
type Review struct {
	ID          string    `json:"id"`
	ProductID   string    `json:"product_id"`
	AuthorName  string    `json:"author_name"`
	Rating      int       `json:"rating"`
	ReviewTitle *string   `json:"review_title,omitempty"`
	ReviewText  string    `json:"review_text"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

// StoreSetting matches the public.store_settings table schema.
type StoreSetting struct {
	Key       string          `json:"key"`
	Value     json.RawMessage `json:"value"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// Profile matches the public.profiles table schema.
type Profile struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FullName  *string   `json:"full_name,omitempty"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// --- Request/Response DTOs ---

// CheckoutRequest is the expected JSON body for POST /api/checkout.
type CheckoutRequest struct {
	Customer          CheckoutCustomer `json:"customer"`
	Items             []CheckoutItem   `json:"items"`
	PaymentID         string           `json:"paymentId,omitempty"`
	RazorpayOrderID   string           `json:"razorpayOrderId,omitempty"`
	RazorpaySignature string           `json:"razorpaySignature,omitempty"`
}

type CheckoutCustomer struct {
	Name          string `json:"name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	Address       string `json:"address"`
	City          string `json:"city"`
	State         string `json:"state"`
	PostalCode    string `json:"postalCode"`
	PaymentMethod string `json:"paymentMethod"`
}

type CheckoutItem struct {
	ID            string `json:"id"`
	Quantity      int    `json:"quantity"`
	SelectedColor string `json:"selectedColor,omitempty"`
}

// CheckoutResponse is the JSON response for a successful checkout.
type CheckoutResponse struct {
	Success            bool    `json:"success"`
	OrderID            string  `json:"orderId"`
	Subtotal           float64 `json:"subtotal"`
	ShippingFee        float64 `json:"shippingFee"`
	Total              float64 `json:"total"`
	CustomerName       string  `json:"customerName"`
	CustomerEmail      string  `json:"customerEmail"`
	Destination        string  `json:"destination,omitempty"`
	IsIdempotentReplay bool    `json:"isIdempotentReplay,omitempty"`
	PaymentStatus      string  `json:"paymentStatus,omitempty"`
	PaymentID          string  `json:"paymentId,omitempty"`
}

// ProductUpsertRequest is the expected JSON body for POST /api/products.
// Uses the same camelCase field names the frontend sends.
type ProductUpsertRequest struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Slug           string          `json:"slug"`
	Tagline        *string         `json:"tagline,omitempty"`
	Price          float64         `json:"price"`
	OriginalPrice  *float64        `json:"originalPrice,omitempty"`
	Image          string          `json:"image"`
	SecondaryImage *string         `json:"secondaryImage,omitempty"`
	Gallery        json.RawMessage `json:"gallery,omitempty"`
	Category       string          `json:"category"`
	Badge          *string         `json:"badge,omitempty"`
	Description    string          `json:"description"`
	Story          *string         `json:"story,omitempty"`
	Details        json.RawMessage `json:"details,omitempty"`
	Care           json.RawMessage `json:"care,omitempty"`
	Material       *string         `json:"material,omitempty"`
	Dimensions     *string         `json:"dimensions,omitempty"`
	Weight         *string         `json:"weight,omitempty"`
	Closure        *string         `json:"closure,omitempty"`
	Interior       *string         `json:"interior,omitempty"`
	Strap          *string         `json:"strap,omitempty"`
	Lining         *string         `json:"lining,omitempty"`
	SKU            *string         `json:"sku,omitempty"`
	Origin         *string         `json:"origin,omitempty"`
	Color          *string         `json:"color,omitempty"`
	Colors         json.RawMessage `json:"colors,omitempty"`
	Rating         *float64        `json:"rating,omitempty"`
	ReviewCount    *int            `json:"reviewCount,omitempty"`
	InStock        *bool           `json:"inStock,omitempty"`
	StockQuantity  *int            `json:"stockQuantity,omitempty"`
	Featured       *bool           `json:"featured,omitempty"`
	Status         *string         `json:"status,omitempty"`
}

// CMSUpdateRequest is the expected JSON body for POST /api/cms.
type CMSUpdateRequest struct {
	Type string          `json:"type"` // "sections" or "campaigns"
	Data json.RawMessage `json:"data"` // Array of sections or campaigns
}

// OrderStatusUpdate is the expected JSON body for PATCH /api/orders/{id}/status.
type OrderStatusUpdate struct {
	Status string `json:"status"`
}

// ReviewSubmission is the expected JSON body for POST /api/reviews.
type ReviewSubmission struct {
	ProductID   string `json:"product_id"`
	AuthorName  string `json:"author_name"`
	Rating      int    `json:"rating"`
	ReviewTitle string `json:"review_title,omitempty"`
	ReviewText  string `json:"review_text"`
}

// ErrorResponse is the standard error JSON shape.
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse is a generic success JSON shape.
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
}
