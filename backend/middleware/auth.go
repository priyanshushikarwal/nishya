package middleware

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/nishya/backend/db"
)

type contextKey string

const (
	// UserIDKey is the context key for the authenticated user's UUID.
	UserIDKey contextKey = "user_id"
	// UserEmailKey is the context key for the authenticated user's email.
	UserEmailKey contextKey = "user_email"
	// UserRoleKey is the context key for the authenticated user's role.
	UserRoleKey contextKey = "user_role"
)

// GetUserID extracts the authenticated user ID from the request context.
func GetUserID(r *http.Request) string {
	if v, ok := r.Context().Value(UserIDKey).(string); ok {
		return v
	}
	return ""
}

// GetUserEmail extracts the authenticated user email from the request context.
func GetUserEmail(r *http.Request) string {
	if v, ok := r.Context().Value(UserEmailKey).(string); ok {
		return v
	}
	return ""
}

// RequireAuth is middleware that validates a Supabase JWT from the Authorization header.
// On success, it sets user_id and user_email in the request context.
func RequireAuth(jwtSecret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"Unauthorized. Authentication token is missing."}`, http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			http.Error(w, `{"error":"Unauthorized. Invalid authorization header format."}`, http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, `{"error":"Unauthorized. Authentication token is invalid or expired."}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, `{"error":"Unauthorized. Could not parse token claims."}`, http.StatusUnauthorized)
			return
		}

		// Extract user ID (Supabase uses "sub" claim for user UUID)
		userID, _ := claims["sub"].(string)
		if userID == "" {
			http.Error(w, `{"error":"Unauthorized. Token does not contain a valid user identifier."}`, http.StatusUnauthorized)
			return
		}

		// Extract email from Supabase JWT claims
		email, _ := claims["email"].(string)

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAdmin is middleware that verifies the authenticated user has role='admin' in the profiles table.
// Must be used AFTER RequireAuth.
func RequireAdmin(jwtSecret string, next http.Handler) http.Handler {
	return RequireAuth(jwtSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r)
		if userID == "" {
			http.Error(w, `{"error":"Unauthorized. No user identity found."}`, http.StatusUnauthorized)
			return
		}

		// Query the profiles table to verify admin role
		var role string
		err := db.Pool.QueryRowContext(r.Context(),
			`SELECT role FROM public.profiles WHERE id = $1`, userID,
		).Scan(&role)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, `{"error":"Forbidden. User profile not found."}`, http.StatusForbidden)
				return
			}
			http.Error(w, `{"error":"Internal server error during authorization check."}`, http.StatusInternalServerError)
			return
		}

		if role != "admin" {
			http.Error(w, `{"error":"Forbidden. Administrative privileges are required for this action."}`, http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), UserRoleKey, role)
		next.ServeHTTP(w, r.WithContext(ctx))
	}))
}
