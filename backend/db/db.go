package db

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// Pool wraps a *sql.DB with connection pool settings tuned for the Nishya workload.
var Pool *sql.DB

// Connect opens a PostgreSQL connection pool and verifies connectivity.
func Connect(databaseURL string) error {
	var err error
	Pool, err = sql.Open("postgres", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	// Connection pool settings for moderate e-commerce traffic
	Pool.SetMaxOpenConns(25)
	Pool.SetMaxIdleConns(5)
	Pool.SetConnMaxLifetime(5 * time.Minute)
	Pool.SetConnMaxIdleTime(2 * time.Minute)

	// Verify the connection is alive
	if err := Pool.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	return nil
}

// Close gracefully shuts down the connection pool.
func Close() error {
	if Pool != nil {
		return Pool.Close()
	}
	return nil
}
