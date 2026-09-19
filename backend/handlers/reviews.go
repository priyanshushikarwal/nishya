package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// ReviewsHandler handles /api/reviews requests.
func ReviewsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetReviews(w, r)
	case http.MethodPost:
		handleSubmitReview(w, r)
	case http.MethodPatch:
		handleUpdateReviewStatus(w, r)
	case http.MethodDelete:
		handleDeleteReview(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func handleGetReviews(w http.ResponseWriter, r *http.Request) {
	productID := r.URL.Query().Get("product_id")

	var rows *sql.Rows
	var err error

	if productID != "" {
		rows, err = db.Pool.QueryContext(r.Context(), `
			SELECT id, product_id, author_name, rating, review_title, review_text, status, created_at
			FROM public.reviews
			WHERE product_id = $1 AND status = 'approved'
			ORDER BY created_at DESC
		`, productID)
	} else {
		// Admin: get all reviews
		rows, err = db.Pool.QueryContext(r.Context(), `
			SELECT id, product_id, author_name, rating, review_title, review_text, status, created_at
			FROM public.reviews
			ORDER BY created_at DESC
		`)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}
	defer rows.Close()

	reviews := make([]models.Review, 0)
	for rows.Next() {
		var rev models.Review
		if err := rows.Scan(
			&rev.ID, &rev.ProductID, &rev.AuthorName, &rev.Rating,
			&rev.ReviewTitle, &rev.ReviewText, &rev.Status, &rev.CreatedAt,
		); err != nil {
			continue
		}
		reviews = append(reviews, rev)
	}

	writeJSON(w, http.StatusOK, reviews)
}

func handleSubmitReview(w http.ResponseWriter, r *http.Request) {
	var req models.ReviewSubmission
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	// Validation
	req.AuthorName = strings.TrimSpace(req.AuthorName)
	req.ReviewText = strings.TrimSpace(req.ReviewText)
	req.ProductID = strings.TrimSpace(req.ProductID)

	if req.ProductID == "" {
		writeError(w, http.StatusBadRequest, "Product ID is required")
		return
	}
	if req.AuthorName == "" || len(req.AuthorName) > 100 {
		writeError(w, http.StatusBadRequest, "Author name is required (max 100 chars)")
		return
	}
	if req.Rating < 1 || req.Rating > 5 {
		writeError(w, http.StatusBadRequest, "Rating must be between 1 and 5")
		return
	}
	if req.ReviewText == "" || len(req.ReviewText) > 2000 {
		writeError(w, http.StatusBadRequest, "Review text is required (max 2000 chars)")
		return
	}

	var reviewTitle *string
	if req.ReviewTitle != "" {
		t := req.ReviewTitle
		if len(t) > 200 {
			t = t[:200]
		}
		reviewTitle = &t
	}

	var reviewID string
	err := db.Pool.QueryRowContext(r.Context(), `
		INSERT INTO public.reviews (product_id, author_name, rating, review_title, review_text, status)
		VALUES ($1, $2, $3, $4, $5, 'pending')
		RETURNING id
	`, req.ProductID, req.AuthorName, req.Rating, reviewTitle, req.ReviewText).Scan(&reviewID)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to submit review: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"id":      reviewID,
	})
}

func handleUpdateReviewStatus(w http.ResponseWriter, r *http.Request) {
	// URL: /api/reviews/{id}
	path := strings.TrimPrefix(r.URL.Path, "/api/reviews/")
	reviewID := strings.TrimSuffix(path, "/")
	if reviewID == "" {
		writeError(w, http.StatusBadRequest, "Review ID is required")
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	validStatuses := map[string]bool{"pending": true, "approved": true, "rejected": true}
	if !validStatuses[body.Status] {
		writeError(w, http.StatusBadRequest, "Invalid review status. Use: pending, approved, rejected")
		return
	}

	result, err := db.Pool.ExecContext(r.Context(), `
		UPDATE public.reviews SET status = $1 WHERE id = $2
	`, body.Status, reviewID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update review status")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "Review not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"id":      reviewID,
		"status":  body.Status,
	})
}

func handleDeleteReview(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		// Try path parameter: /api/reviews/{id}
		path := strings.TrimPrefix(r.URL.Path, "/api/reviews/")
		id = strings.TrimSuffix(path, "/")
	}
	if id == "" {
		writeError(w, http.StatusBadRequest, "Review ID is required")
		return
	}

	result, err := db.Pool.ExecContext(r.Context(), `DELETE FROM public.reviews WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete review")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "Review not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success":   true,
		"deletedId": id,
	})
}
