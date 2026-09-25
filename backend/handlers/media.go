package handlers

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"
)

// MaxUploadSize is 5MB
const MaxUploadSize = 5 * 1024 * 1024

var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
}

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

// MediaUploadHandler handles POST /api/media/upload
// Proxies file uploads to Supabase Storage using the service role key.
func MediaUploadHandler(supabaseURL, serviceKey string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		// Limit request body size
		r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize+1024) // Extra buffer for multipart headers

		if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
			writeError(w, http.StatusBadRequest, "File exceeds the 5MB size limit for media assets.")
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, http.StatusBadRequest, "No file provided in request")
			return
		}
		defer file.Close()

		// Validate file size
		if header.Size > MaxUploadSize {
			writeError(w, http.StatusBadRequest, "File exceeds the 5MB size limit for media assets.")
			return
		}

		// Validate extension
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			writeError(w, http.StatusBadRequest, "Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.")
			return
		}

		// Read file contents
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to read uploaded file")
			return
		}

		// SECURITY: Verify magic bytes directly from content (CWE-434: File Upload Content Spoofing)
		sniffLen := 512
		if len(fileBytes) < sniffLen {
			sniffLen = len(fileBytes)
		}
		detectedType := http.DetectContentType(fileBytes[:sniffLen])

		isWebP := len(fileBytes) >= 12 && string(fileBytes[:4]) == "RIFF" && string(fileBytes[8:12]) == "WEBP"
		isValidImage := detectedType == "image/jpeg" || detectedType == "image/png" || isWebP

		if !isValidImage {
			writeError(w, http.StatusBadRequest, "File content is not a valid image format. Executable, script, or corrupted files are rejected.")
			return
		}

		// Use verified MIME type
		contentType := detectedType
		if isWebP {
			contentType = "image/webp"
		}

		// Get bucket from form field, default to product-media
		bucket := r.FormValue("bucket")
		if bucket != "cms-media" {
			bucket = "product-media"
		}

		// Generate safe filename
		baseName := strings.TrimSuffix(header.Filename, ext)
		// Sanitize: keep only alphanumeric, hyphens, underscores
		sanitized := sanitizeFilename(baseName)
		if len(sanitized) > 30 {
			sanitized = sanitized[:30]
		}
		fileName := fmt.Sprintf("%d_%s_%s%s",
			time.Now().UnixMilli(), sanitized, randomString(6), ext)

		// If Supabase is configured, upload via Storage REST API
		if supabaseURL != "" && serviceKey != "" {
			publicURL, uploadErr := uploadToSupabaseStorage(supabaseURL, serviceKey, bucket, fileName, fileBytes, contentType)
			if uploadErr != nil {
				writeError(w, http.StatusInternalServerError, "Upload failed: "+uploadErr.Error())
				return
			}

			writeJSON(w, http.StatusOK, map[string]interface{}{
				"url": publicURL,
			})
			return
		}

		writeError(w, http.StatusServiceUnavailable, "Supabase storage is not configured")
	}
}

// uploadToSupabaseStorage uploads a file to Supabase Storage via the REST API.
func uploadToSupabaseStorage(supabaseURL, serviceKey, bucket, filePath string, data []byte, contentType string) (string, error) {
	uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucket, filePath)

	req, err := http.NewRequest(http.MethodPost, uploadURL, bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("failed to create upload request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "false")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("upload request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Supabase storage returned %d: %s", resp.StatusCode, string(body))
	}

	// Construct public URL
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucket, filePath)
	return publicURL, nil
}

// sanitizeFilename removes non-alphanumeric characters except hyphens and underscores.
func sanitizeFilename(name string) string {
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		} else {
			b.WriteRune('_')
		}
	}
	result := b.String()
	if result == "" {
		return "upload"
	}
	return result
}

// randomString generates a simple random alphanumeric string.
func randomString(n int) string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	// Use timestamp nanoseconds for variety (not crypto-safe, but fine for filenames)
	seed := time.Now().UnixNano()
	result := make([]byte, n)
	for i := range result {
		result[i] = chars[(int(seed)+i*31)%len(chars)]
		seed = seed*1103515245 + 12345
	}
	return string(result)
}

// MultipartField helper for creating multipart uploads
type MultipartField struct {
	Name     string
	Filename string
	Content  []byte
}

// CreateMultipartBody creates a multipart form body (unused internally, exported for testing).
func CreateMultipartBody(fields []MultipartField) (*bytes.Buffer, string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	for _, field := range fields {
		if field.Filename != "" {
			part, err := writer.CreateFormFile(field.Name, field.Filename)
			if err != nil {
				return nil, "", err
			}
			part.Write(field.Content)
		} else {
			writer.WriteField(field.Name, string(field.Content))
		}
	}

	err := writer.Close()
	return body, writer.FormDataContentType(), err
}
