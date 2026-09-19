package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// CategoriesHandler handles /api/categories requests.
func CategoriesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetCategories(w, r)
	case http.MethodPost:
		handleUpsertCategory(w, r)
	case http.MethodDelete:
		handleDeleteCategory(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func handleGetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, name, slug, description, image, sort_order, is_visible, created_at
		FROM public.categories
		WHERE is_visible = true
		ORDER BY sort_order ASC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	defer rows.Close()

	categories := make([]models.Category, 0)
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Slug, &c.Description,
			&c.Image, &c.SortOrder, &c.IsVisible, &c.CreatedAt,
		); err != nil {
			continue
		}
		categories = append(categories, c)
	}

	writeJSON(w, http.StatusOK, categories)
}

func handleUpsertCategory(w http.ResponseWriter, r *http.Request) {
	var cat struct {
		ID          string  `json:"id,omitempty"`
		Name        string  `json:"name"`
		Slug        string  `json:"slug"`
		Description *string `json:"description"`
		Image       *string `json:"image"`
		SortOrder   int     `json:"sort_order"`
		IsVisible   *bool   `json:"is_visible"`
	}

	if err := json.NewDecoder(r.Body).Decode(&cat); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	cat.Name = strings.TrimSpace(cat.Name)
	cat.Slug = strings.TrimSpace(cat.Slug)

	if cat.Name == "" {
		writeError(w, http.StatusBadRequest, "Category name is required")
		return
	}
	if cat.Slug == "" || !slugRegex.MatchString(cat.Slug) {
		writeError(w, http.StatusBadRequest, "Invalid category slug")
		return
	}

	isVisible := true
	if cat.IsVisible != nil {
		isVisible = *cat.IsVisible
	}

	if cat.ID != "" {
		// Update existing
		_, err := db.Pool.ExecContext(r.Context(), `
			UPDATE public.categories
			SET name = $1, slug = $2, description = $3, image = $4, sort_order = $5, is_visible = $6
			WHERE id = $7
		`, cat.Name, cat.Slug, cat.Description, cat.Image, cat.SortOrder, isVisible, cat.ID)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to update category: "+err.Error())
			return
		}
	} else {
		// Insert new
		var newID string
		err := db.Pool.QueryRowContext(r.Context(), `
			INSERT INTO public.categories (name, slug, description, image, sort_order, is_visible)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`, cat.Name, cat.Slug, cat.Description, cat.Image, cat.SortOrder, isVisible).Scan(&newID)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to create category: "+err.Error())
			return
		}
		cat.ID = newID
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success":  true,
		"category": cat,
	})
}

func handleDeleteCategory(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		// Try path: /api/categories/{id}
		path := strings.TrimPrefix(r.URL.Path, "/api/categories/")
		id = strings.TrimSuffix(path, "/")
	}
	if id == "" {
		writeError(w, http.StatusBadRequest, "Category ID is required")
		return
	}

	result, err := db.Pool.ExecContext(r.Context(), `DELETE FROM public.categories WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete category")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "Category not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success":   true,
		"deletedId": id,
	})
}
