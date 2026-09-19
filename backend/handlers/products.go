package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// ProductsHandler handles all /api/products requests.
func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetProducts(w, r)
	case http.MethodPost:
		handleUpsertProduct(w, r)
	case http.MethodDelete:
		handleDeleteProduct(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func handleGetProducts(w http.ResponseWriter, r *http.Request) {
	// Check if requesting a specific product by slug
	slug := r.URL.Query().Get("slug")
	if slug != "" {
		handleGetProductBySlug(w, r, slug)
		return
	}

	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, name, slug, tagline, price, original_price, image, secondary_image,
		       gallery, category, badge, description, story, details, care,
		       material, dimensions, weight, closure, interior, strap, lining,
		       sku, origin, color, colors, rating, review_count, in_stock,
		       stock_quantity, featured, status, created_at, updated_at
		FROM public.products
		WHERE status = 'published'
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

func handleGetProductBySlug(w http.ResponseWriter, r *http.Request, slug string) {
	var p models.Product
	err := db.Pool.QueryRowContext(r.Context(), `
		SELECT id, name, slug, tagline, price, original_price, image, secondary_image,
		       gallery, category, badge, description, story, details, care,
		       material, dimensions, weight, closure, interior, strap, lining,
		       sku, origin, color, colors, rating, review_count, in_stock,
		       stock_quantity, featured, status, created_at, updated_at
		FROM public.products
		WHERE slug = $1
	`, slug).Scan(
		&p.ID, &p.Name, &p.Slug, &p.Tagline, &p.Price, &p.OriginalPrice,
		&p.Image, &p.SecondaryImage, &p.Gallery, &p.Category, &p.Badge,
		&p.Description, &p.Story, &p.Details, &p.Care, &p.Material,
		&p.Dimensions, &p.Weight, &p.Closure, &p.Interior, &p.Strap,
		&p.Lining, &p.SKU, &p.Origin, &p.Color, &p.Colors, &p.Rating,
		&p.ReviewCount, &p.InStock, &p.StockQuantity, &p.Featured,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to fetch product")
		return
	}

	writeJSON(w, http.StatusOK, p)
}

var slugRegex = regexp.MustCompile(`^[a-z0-9\-_]+$`)

func handleUpsertProduct(w http.ResponseWriter, r *http.Request) {
	var req models.ProductUpsertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	// Validation — same rules as the existing Node implementation
	if req.ID == "" || len(req.ID) > 100 {
		writeError(w, http.StatusBadRequest, "Invalid or missing product ID")
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" || len(req.Name) > 250 {
		writeError(w, http.StatusBadRequest, "Invalid product name")
		return
	}
	req.Slug = strings.TrimSpace(req.Slug)
	if !slugRegex.MatchString(req.Slug) {
		writeError(w, http.StatusBadRequest, "Invalid product slug (must be lowercase letters, numbers, and hyphens)")
		return
	}
	if req.Price < 0 || req.Price > 10000000 {
		writeError(w, http.StatusBadRequest, "Price must be a valid non-negative number")
		return
	}
	req.Image = strings.TrimSpace(req.Image)
	if req.Image == "" {
		writeError(w, http.StatusBadRequest, "Product primary image is required")
		return
	}
	req.Category = strings.TrimSpace(req.Category)
	if req.Category == "" {
		writeError(w, http.StatusBadRequest, "Product category is required")
		return
	}

	// Default values
	gallery := defaultJSON(req.Gallery, `[]`)
	details := defaultJSON(req.Details, `[]`)
	care := defaultJSON(req.Care, `[]`)
	colors := defaultJSON(req.Colors, `[]`)

	status := "published"
	if req.Status != nil {
		status = *req.Status
	}

	rating := 5.0
	if req.Rating != nil {
		rating = *req.Rating
		if rating < 1 {
			rating = 1
		}
		if rating > 5 {
			rating = 5
		}
	}

	reviewCount := 0
	if req.ReviewCount != nil {
		reviewCount = *req.ReviewCount
		if reviewCount < 0 {
			reviewCount = 0
		}
	}

	inStock := true
	if req.InStock != nil {
		inStock = *req.InStock
	}

	featured := false
	if req.Featured != nil {
		featured = *req.Featured
	}

	stockQuantity := 25
	if req.StockQuantity != nil {
		stockQuantity = *req.StockQuantity
	}

	now := time.Now().UTC()

	_, err := db.Pool.ExecContext(r.Context(), `
		INSERT INTO public.products (
			id, name, slug, tagline, price, original_price, image, secondary_image,
			gallery, category, badge, description, story, details, care,
			material, dimensions, weight, closure, interior, strap, lining,
			sku, origin, color, colors, rating, review_count, in_stock,
			stock_quantity, featured, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14, $15,
			$16, $17, $18, $19, $20, $21, $22,
			$23, $24, $25, $26, $27, $28, $29,
			$30, $31, $32, $33, $34
		)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			slug = EXCLUDED.slug,
			tagline = EXCLUDED.tagline,
			price = EXCLUDED.price,
			original_price = EXCLUDED.original_price,
			image = EXCLUDED.image,
			secondary_image = EXCLUDED.secondary_image,
			gallery = EXCLUDED.gallery,
			category = EXCLUDED.category,
			badge = EXCLUDED.badge,
			description = EXCLUDED.description,
			story = EXCLUDED.story,
			details = EXCLUDED.details,
			care = EXCLUDED.care,
			material = EXCLUDED.material,
			dimensions = EXCLUDED.dimensions,
			weight = EXCLUDED.weight,
			closure = EXCLUDED.closure,
			interior = EXCLUDED.interior,
			strap = EXCLUDED.strap,
			lining = EXCLUDED.lining,
			sku = EXCLUDED.sku,
			origin = EXCLUDED.origin,
			color = EXCLUDED.color,
			colors = EXCLUDED.colors,
			rating = EXCLUDED.rating,
			review_count = EXCLUDED.review_count,
			in_stock = EXCLUDED.in_stock,
			stock_quantity = EXCLUDED.stock_quantity,
			featured = EXCLUDED.featured,
			status = EXCLUDED.status,
			updated_at = EXCLUDED.updated_at
	`,
		req.ID, req.Name, req.Slug, req.Tagline, req.Price, req.OriginalPrice,
		req.Image, req.SecondaryImage, gallery, req.Category, req.Badge,
		req.Description, req.Story, details, care, req.Material,
		req.Dimensions, req.Weight, req.Closure, req.Interior, req.Strap,
		req.Lining, req.SKU, req.Origin, req.Color, colors,
		rating, reviewCount, inStock, stockQuantity, featured, status, now, now,
	)

	if err != nil {
		writeError(w, http.StatusBadRequest, "Failed to persist product: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"product": req,
	})
}

func handleDeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Missing or invalid product id")
		return
	}

	_, err := db.Pool.ExecContext(r.Context(), `DELETE FROM public.products WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Database deletion failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success":   true,
		"deletedId": id,
	})
}
