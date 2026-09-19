#!/bin/bash
# ==============================================================================
# NISHYA GO BACKEND — 1-CLICK DOCKER DEPLOYMENT FOR HOSTINGER VPS
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 Deploying Nishya Go Backend on Hostinger VPS"
echo "========================================================"

# 1. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

if ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 2. Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️ Creating backend .env file..."
    cat << 'EOF' > .env
PORT=8080
SUPABASE_URL=https://wbrxwsenrilaxjgdeish.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicnh3c2VucmlsYXhqZ2RlaXNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODQyOCwiZXhwIjoyMTA1Mjk0NDI4fQ.0IDlQBMU_qNJyBiS0zN707fwd3u6hOvBc8zU65i8-Mw
SUPABASE_JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicnh3c2VucmlsYXhqZ2RlaXNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODQyOCwiZXhwIjoyMTA1Mjk0NDI4fQ.0IDlQBMU_qNJyBiS0zN707fwd3u6hOvBc8zU65i8-Mw
CORS_ORIGIN=*

# Razorpay Official Keys
RAZORPAY_KEY_ID=rzp_test_Te2wCxAX1j4qSL
RAZORPAY_KEY_SECRET=5d0HqUMUuuZ4RUzVB4yHTAFZ

# PostgreSQL Connection (Supabase)
# Format: postgresql://postgres:[PASSWORD]@db.wbrxwsenrilaxjgdeish.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.wbrxwsenrilaxjgdeish.supabase.co:5432/postgres
EOF

    echo "⚠️ .env file created! Don't forget to update your Supabase DATABASE_URL password."
fi

# 3. Build & Run Go Backend Container
echo "🔨 Building Go Backend Container..."
docker compose down || true
docker compose up -d --build

# 4. Wait for health check
echo "⏳ Waiting for API to start..."
sleep 5

echo "========================================================"
echo "🎉 BACKEND DEPLOYED SUCCESSFULLY!"
echo "⚡ Live Health Check: http://$(curl -s ifconfig.me)/api/health"
echo "========================================================"
docker compose ps
