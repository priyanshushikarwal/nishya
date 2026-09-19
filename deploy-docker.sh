#!/bin/bash
# ==============================================================================
# NISHYA LUXURY — 1-CLICK DOCKER DEPLOYMENT SCRIPT (FRONTEND + GO BACKEND)
# ==============================================================================

set -e

echo "========================================================"
echo "✨ Starting Nishya Full-Stack Docker Deployment"
echo "========================================================"

# 1. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker & Docker Compose..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

if ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 2. Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env configuration file..."
    cat << 'EOF' > .env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wbrxwsenrilaxjgdeish.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicnh3c2VucmlsYXhqZ2RlaXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTg0MjgsImV4cCI6MjEwNTI5NDQyOH0.MMtXQZHdFWK7kr2BXn_o9MEfuorwp9FUnEm6KoV75xE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicnh3c2VucmlsYXhqZ2RlaXNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODQyOCwiZXhwIjoyMTA1Mjk0NDI4fQ.0IDlQBMU_qNJyBiS0zN707fwd3u6hOvBc8zU65i8-Mw

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_Te2wCxAX1j4qSL
RAZORPAY_KEY_ID=rzp_test_Te2wCxAX1j4qSL
RAZORPAY_KEY_SECRET=5d0HqUMUuuZ4RUzVB4yHTAFZ

# Go Backend Database URL
# Format: postgresql://postgres:[PASSWORD]@db.wbrxwsenrilaxjgdeish.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.wbrxwsenrilaxjgdeish.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicnh3c2VucmlsYXhqZ2RlaXNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODQyOCwiZXhwIjoyMTA1Mjk0NDI4fQ.0IDlQBMU_qNJyBiS0zN707fwd3u6hOvBc8zU65i8-Mw
EOF

    echo "⚠️ .env file created!"
    echo "Please edit .env to update your Supabase DATABASE_URL password if you haven't yet."
fi

# 3. Pull / Build & Start containers
echo "🚀 Building and starting containers with Docker Compose..."
docker compose down || true
docker compose up -d --build

# 4. Wait for health check
echo "⏳ Waiting for services to become healthy..."
sleep 10

echo "========================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📱 Frontend Storefront: http://$(curl -s ifconfig.me):80 or http://$(curl -s ifconfig.me):3000"
echo "⚡ Go Backend API:      http://$(curl -s ifconfig.me):8080/api/health"
echo "========================================================"
docker compose ps
