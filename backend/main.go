package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/cors"

	"github.com/nishya/backend/config"
	"github.com/nishya/backend/db"
	"github.com/nishya/backend/handlers"
	"github.com/nishya/backend/middleware"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Configuration error: %v", err)
	}

	// Connect to PostgreSQL
	log.Println("🔌 Connecting to PostgreSQL...")
	if err := db.Connect(cfg.DatabaseURL); err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	defer db.Close()
	log.Println("✅ Connected to PostgreSQL")

	// Create rate limiters (matching existing Node limits)
	publicLimiter := middleware.NewRateLimiter(60, 60000)       // 60 req/min
	adminWriteLimiter := middleware.NewRateLimiter(20, 60000)    // 20 req/min
	adminDeleteLimiter := middleware.NewRateLimiter(10, 60000)   // 10 req/min
	checkoutLimiter := middleware.NewRateLimiter(60, 60000)      // 60 req/min

	// Build router
	mux := http.NewServeMux()

	// ─────────────────────────────────────────────────────────────
	// PUBLIC ENDPOINTS (no auth required)
	// ─────────────────────────────────────────────────────────────

	// Products — public read
	mux.Handle("/api/products", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				handlers.ProductsHandler(w, r)
			case http.MethodPost:
				// Admin write — requires auth
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.ProductsHandler)),
				).ServeHTTP(w, r)
			case http.MethodDelete:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminDeleteLimiter,
						http.HandlerFunc(handlers.ProductsHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))

	// CMS — public read, admin write
	mux.Handle("/api/cms", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				handlers.CMSHandler(w, r)
			case http.MethodPost:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.CMSHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))

	// Checkout — public (rate limited)
	mux.Handle("/api/checkout", middleware.RateLimit(checkoutLimiter,
		http.HandlerFunc(handlers.CheckoutHandler),
	))

	// Razorpay Payment Endpoints — public (rate limited)
	mux.Handle("/api/payment/razorpay/create-order", middleware.RateLimit(checkoutLimiter,
		handlers.CreateRazorpayOrderHandler(cfg.RazorpayKeyID, cfg.RazorpayKeySecret),
	))
	mux.Handle("/api/payment/razorpay/verify", middleware.RateLimit(checkoutLimiter,
		handlers.VerifyRazorpayPaymentHandler(cfg.RazorpayKeySecret),
	))

	// Categories — public read, admin write
	mux.Handle("/api/categories", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				handlers.CategoriesHandler(w, r)
			case http.MethodPost, http.MethodDelete:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.CategoriesHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))
	// Category path-based delete
	mux.Handle("/api/categories/", middleware.RequireAdmin(cfg.SupabaseJWTSecret,
		middleware.RateLimit(adminDeleteLimiter,
			http.HandlerFunc(handlers.CategoriesHandler)),
	))

	// Reviews — public read+submit, admin moderate
	mux.Handle("/api/reviews", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet, http.MethodPost:
				handlers.ReviewsHandler(w, r)
			case http.MethodPatch, http.MethodDelete:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.ReviewsHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))
	// Review path-based operations (PATCH/DELETE /api/reviews/{id})
	mux.Handle("/api/reviews/", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodPatch, http.MethodDelete:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.ReviewsHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))

	// Settings — public read, admin write
	mux.Handle("/api/settings", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				handlers.SettingsHandler(w, r)
			case http.MethodPut:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.SettingsHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))
	// Settings path-based PUT (/api/settings/{key})
	mux.Handle("/api/settings/", middleware.RateLimit(publicLimiter,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				handlers.SettingsHandler(w, r)
			case http.MethodPut:
				middleware.RequireAdmin(cfg.SupabaseJWTSecret,
					middleware.RateLimit(adminWriteLimiter,
						http.HandlerFunc(handlers.SettingsHandler)),
				).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		}),
	))

	// ─────────────────────────────────────────────────────────────
	// ADMIN-ONLY ENDPOINTS
	// ─────────────────────────────────────────────────────────────

	// Orders — admin only
	mux.Handle("/api/orders", middleware.RequireAdmin(cfg.SupabaseJWTSecret,
		middleware.RateLimit(publicLimiter,
			http.HandlerFunc(handlers.OrdersHandler)),
	))
	// Order status update: /api/orders/{id}/status
	mux.Handle("/api/orders/", middleware.RequireAdmin(cfg.SupabaseJWTSecret,
		middleware.RateLimit(adminWriteLimiter,
			http.HandlerFunc(handlers.OrdersHandler)),
	))

	// Admin products (all statuses)
	mux.Handle("/api/admin/products", middleware.RequireAdmin(cfg.SupabaseJWTSecret,
		middleware.RateLimit(publicLimiter,
			http.HandlerFunc(handlers.AdminGetAllProducts)),
	))

	// Media upload — admin only
	mux.Handle("/api/media/upload", middleware.RequireAdmin(cfg.SupabaseJWTSecret,
		middleware.RateLimit(adminWriteLimiter,
			handlers.MediaUploadHandler(cfg.SupabaseURL, cfg.SupabaseServiceKey)),
	))

	// Health check
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"nishya-api"}`))
	})

	// ─────────────────────────────────────────────────────────────
	// CORS & SERVER
	// ─────────────────────────────────────────────────────────────

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           86400,
	}).Handler(mux)

	server := &http.Server{
		Addr:    cfg.Addr(),
		Handler: corsHandler,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("🛑 Shutting down server...")
		server.Close()
	}()

	log.Printf("🚀 Nishya API server starting on %s", cfg.Addr())
	log.Printf("📋 CORS allowed origin: %s", cfg.CORSOrigin)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("❌ Server error: %v", err)
	}
	log.Println("✅ Server stopped gracefully")
}
