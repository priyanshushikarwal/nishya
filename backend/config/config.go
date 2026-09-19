package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds all environment-driven configuration for the Nishya Go backend.
type Config struct {
	Port                 int
	DatabaseURL          string
	SupabaseJWTSecret    string
	SupabaseURL          string
	SupabaseServiceKey   string
	CORSOrigin           string
	RazorpayKeyID        string
	RazorpayKeySecret    string
}

func loadEnvFile(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.Trim(strings.TrimSpace(parts[1]), `"'`+"\r")
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
	}
}

// Load reads configuration from environment variables with sensible defaults.
func Load() (*Config, error) {
	loadEnvFile(".env")
	loadEnvFile("../.env.local")
	loadEnvFile("../.env")

	port := 8080
	if p := os.Getenv("PORT"); p != "" {
		parsed, err := strconv.Atoi(p)
		if err == nil && parsed > 0 {
			port = parsed
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	}
	if jwtSecret == "" {
		jwtSecret = "nishya-local-dev-jwt-secret"
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000"
	}

	razorpayKeyID := os.Getenv("RAZORPAY_KEY_ID")
	if razorpayKeyID == "" {
		razorpayKeyID = os.Getenv("NEXT_PUBLIC_RAZORPAY_KEY_ID")
	}
	razorpayKeySecret := os.Getenv("RAZORPAY_KEY_SECRET")

	return &Config{
		Port:               port,
		DatabaseURL:        dbURL,
		SupabaseJWTSecret:  jwtSecret,
		SupabaseURL:        supabaseURL,
		SupabaseServiceKey: serviceKey,
		CORSOrigin:         corsOrigin,
		RazorpayKeyID:      razorpayKeyID,
		RazorpayKeySecret:  razorpayKeySecret,
	}, nil
}

// Addr returns the listen address string (e.g. ":8080").
func (c *Config) Addr() string {
	return fmt.Sprintf(":%d", c.Port)
}
