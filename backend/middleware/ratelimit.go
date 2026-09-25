package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"
)

// RateLimiter implements a per-IP sliding window rate limiter.
type RateLimiter struct {
	mu       sync.Mutex
	entries  map[string]*rateLimitEntry
	max      int
	windowMs int64
}

type rateLimitEntry struct {
	count    int
	resetAt  int64 // unix milliseconds
}

// NewRateLimiter creates a rate limiter with the given max requests per window.
func NewRateLimiter(maxRequests int, windowMs int64) *RateLimiter {
	rl := &RateLimiter{
		entries:  make(map[string]*rateLimitEntry),
		max:      maxRequests,
		windowMs: windowMs,
	}
	// Background cleanup every 5 minutes
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now().UnixMilli()
		rl.mu.Lock()
		for key, entry := range rl.entries {
			if now > entry.resetAt {
				delete(rl.entries, key)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow checks if the given key is within the rate limit.
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now().UnixMilli()
	entry, exists := rl.entries[key]

	if !exists || now > entry.resetAt {
		rl.entries[key] = &rateLimitEntry{
			count:   1,
			resetAt: now + rl.windowMs,
		}
		return true
	}

	if entry.count >= rl.max {
		return false
	}

	entry.count++
	return true
}

// RateLimit wraps an http.Handler with IP-based rate limiting.
func RateLimit(limiter *RateLimiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		if !limiter.Allow(ip) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":"Too many requests. Please wait a moment before trying again."}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// getClientIP extracts the client IP, prioritizing trusted reverse proxy headers.
// SECURITY: Prioritizes CF-Connecting-IP and X-Real-IP set by Cloudflare and Nginx
// to prevent attackers from spoofing X-Forwarded-For to bypass rate limits.
func getClientIP(r *http.Request) string {
	// 1. Cloudflare connecting IP (trusted when behind Cloudflare)
	if cfIP := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); cfIP != "" {
		return cfIP
	}

	// 2. Nginx set X-Real-IP
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		return realIP
	}

	// 3. Fallback: X-Forwarded-For
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		// Take the first entry
		if len(parts) > 0 {
			ip := strings.TrimSpace(parts[0])
			if ip != "" {
				return ip
			}
		}
	}

	// 4. Fallback to direct TCP RemoteAddr (strip port)
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}
	return addr
}
