package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/nishya/backend/db"
	"github.com/nishya/backend/models"
)

// CMSHandler handles all /api/cms requests.
func CMSHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetCMS(w, r)
	case http.MethodPost:
		handlePostCMS(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func handleGetCMS(w http.ResponseWriter, r *http.Request) {
	contentType := r.URL.Query().Get("type")

	if contentType == "campaigns" {
		handleGetCampaigns(w, r)
		return
	}

	// Default: sections
	handleGetSections(w, r)
}

func handleGetCampaigns(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, title, subtitle, description, cta_text, cta_url,
		       desktop_image, mobile_image, sort_order, is_active, created_at
		FROM public.hero_campaigns
		ORDER BY sort_order ASC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch campaigns")
		return
	}
	defer rows.Close()

	campaigns := make([]models.HeroCampaign, 0)
	for rows.Next() {
		var c models.HeroCampaign
		err := rows.Scan(
			&c.ID, &c.Title, &c.Subtitle, &c.Description,
			&c.CTAText, &c.CTAURL, &c.DesktopImage, &c.MobileImage,
			&c.SortOrder, &c.IsActive, &c.CreatedAt,
		)
		if err != nil {
			continue
		}
		campaigns = append(campaigns, c)
	}

	writeJSON(w, http.StatusOK, campaigns)
}

func handleGetSections(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Pool.QueryContext(r.Context(), `
		SELECT id, title, subtitle, content, sort_order, is_visible, updated_at
		FROM public.homepage_sections
		ORDER BY sort_order ASC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch homepage sections")
		return
	}
	defer rows.Close()

	sections := make([]models.HomepageSection, 0)
	for rows.Next() {
		var s models.HomepageSection
		err := rows.Scan(
			&s.ID, &s.Title, &s.Subtitle, &s.Content,
			&s.SortOrder, &s.IsVisible, &s.UpdatedAt,
		)
		if err != nil {
			continue
		}
		sections = append(sections, s)
	}

	writeJSON(w, http.StatusOK, sections)
}

func handlePostCMS(w http.ResponseWriter, r *http.Request) {
	var req models.CMSUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	switch req.Type {
	case "sections":
		handleUpsertSections(w, r, req.Data)
	case "campaigns":
		handleUpsertCampaigns(w, r, req.Data)
	default:
		writeError(w, http.StatusBadRequest, "Invalid type specified. Use 'sections' or 'campaigns'.")
	}
}

func handleUpsertSections(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	var sections []struct {
		ID        string          `json:"id"`
		Title     string          `json:"title"`
		Subtitle  *string         `json:"subtitle"`
		Content   json.RawMessage `json:"content"`
		SortOrder int             `json:"sort_order"`
		IsVisible bool            `json:"is_visible"`
	}

	if err := json.Unmarshal(data, &sections); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid data format (array required)")
		return
	}

	for _, sec := range sections {
		if sec.ID == "" || sec.Title == "" {
			continue
		}

		content := defaultJSON(sec.Content, `{}`)

		// Truncate for safety
		title := sec.Title
		if len(title) > 200 {
			title = title[:200]
		}

		var subtitle *string
		if sec.Subtitle != nil {
			s := *sec.Subtitle
			if len(s) > 300 {
				s = s[:300]
			}
			subtitle = &s
		}

		_, err := db.Pool.ExecContext(r.Context(), `
			INSERT INTO public.homepage_sections (id, title, subtitle, content, sort_order, is_visible, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				subtitle = EXCLUDED.subtitle,
				content = EXCLUDED.content,
				sort_order = EXCLUDED.sort_order,
				is_visible = EXCLUDED.is_visible,
				updated_at = NOW()
		`, sec.ID, title, subtitle, content, sec.SortOrder, sec.IsVisible)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to save section: "+err.Error())
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"count":   len(sections),
	})
}

func handleUpsertCampaigns(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	var campaigns []struct {
		ID           string  `json:"id"`
		Title        string  `json:"title"`
		Subtitle     *string `json:"subtitle"`
		Description  *string `json:"description"`
		CTAText      string  `json:"cta_text"`
		CTAURL       string  `json:"cta_url"`
		DesktopImage string  `json:"desktop_image"`
		MobileImage  *string `json:"mobile_image"`
		SortOrder    int     `json:"sort_order"`
		IsActive     *bool   `json:"is_active"`
	}

	if err := json.Unmarshal(data, &campaigns); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid data format (array required)")
		return
	}

	for _, c := range campaigns {
		if c.Title == "" || c.DesktopImage == "" {
			continue
		}

		// Truncate and apply defaults
		title := c.Title
		if len(title) > 200 {
			title = title[:200]
		}
		ctaText := c.CTAText
		if ctaText == "" {
			ctaText = "SHOP NOW"
		} else if len(ctaText) > 50 {
			ctaText = ctaText[:50]
		}
		ctaURL := c.CTAURL
		if ctaURL == "" {
			ctaURL = "/products"
		} else if len(ctaURL) > 255 {
			ctaURL = ctaURL[:255]
		}

		isActive := true
		if c.IsActive != nil {
			isActive = *c.IsActive
		}

		var subtitle *string
		if c.Subtitle != nil {
			s := *c.Subtitle
			if len(s) > 300 {
				s = s[:300]
			}
			subtitle = &s
		}

		var description *string
		if c.Description != nil {
			s := *c.Description
			if len(s) > 500 {
				s = s[:500]
			}
			description = &s
		}

		_, err := db.Pool.ExecContext(r.Context(), `
			INSERT INTO public.hero_campaigns (id, title, subtitle, description, cta_text, cta_url,
			            desktop_image, mobile_image, sort_order, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				subtitle = EXCLUDED.subtitle,
				description = EXCLUDED.description,
				cta_text = EXCLUDED.cta_text,
				cta_url = EXCLUDED.cta_url,
				desktop_image = EXCLUDED.desktop_image,
				mobile_image = EXCLUDED.mobile_image,
				sort_order = EXCLUDED.sort_order,
				is_active = EXCLUDED.is_active
		`, c.ID, title, subtitle, description, ctaText, ctaURL,
			c.DesktopImage, c.MobileImage, c.SortOrder, isActive)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to save campaign: "+err.Error())
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"count":   len(campaigns),
	})
}
