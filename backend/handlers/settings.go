package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// SettingsHandler handles /api/settings requests.
func SettingsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetSettings(w, r)
	case http.MethodPut:
		handleUpdateSetting(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

var allowedPublicSettings = map[string]bool{
	"brand":        true,
	"announcement": true,
	"shipping":     true,
	"seo":          true,
}

func handleGetSettings(w http.ResponseWriter, r *http.Request) {
	// Optional: get a specific key
	key := strings.TrimSpace(r.URL.Query().Get("key"))

	if key != "" {
		if !allowedPublicSettings[key] {
			writeError(w, http.StatusForbidden, "Access to requested configuration is restricted.")
			return
		}

		var setting models.StoreSetting
		err := db.Pool.QueryRowContext(r.Context(), `
			SELECT key, value, updated_at FROM public.store_settings WHERE key = $1
		`, key).Scan(&setting.Key, &setting.Value, &setting.UpdatedAt)

		if err != nil {
			writeError(w, http.StatusNotFound, "Setting not found")
			return
		}
		writeJSON(w, http.StatusOK, setting)
		return
	}

	// Return public settings only
	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT key, value, updated_at
		FROM public.store_settings
		WHERE key IN ('brand', 'announcement', 'shipping', 'seo')
		ORDER BY key
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch settings")
		return
	}
	defer rows.Close()

	settings := make([]models.StoreSetting, 0)
	for rows.Next() {
		var s models.StoreSetting
		if err := rows.Scan(&s.Key, &s.Value, &s.UpdatedAt); err != nil {
			continue
		}
		settings = append(settings, s)
	}

	writeJSON(w, http.StatusOK, settings)
}

func handleUpdateSetting(w http.ResponseWriter, r *http.Request) {
	// URL: /api/settings/{key}
	path := strings.TrimPrefix(r.URL.Path, "/api/settings/")
	key := strings.TrimSuffix(path, "/")

	if key == "" {
		writeError(w, http.StatusBadRequest, "Setting key is required in URL path")
		return
	}

	var body struct {
		Value json.RawMessage `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if body.Value == nil || len(body.Value) == 0 {
		writeError(w, http.StatusBadRequest, "Setting value is required")
		return
	}

	_, err := db.Pool.ExecContext(r.Context(), `
		INSERT INTO public.store_settings (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE SET
			value = EXCLUDED.value,
			updated_at = NOW()
	`, key, body.Value)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update setting: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"key":     key,
	})
}
