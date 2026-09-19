#!/bin/bash
# ==============================================================================
# NISHYA GO BACKEND — 1-CLICK UBUNTU / DEBIAN VPS INSTALLATION SCRIPT
# ==============================================================================

set -e

echo "🚀 Setting up Nishya Go Backend on Ubuntu/Debian..."

# 1. Update and install Nginx & curl
sudo apt update -y
sudo apt install -y nginx curl ca-certificates ufw

# 2. Create directory and set permissions
sudo mkdir -p /var/www/nishya-api
sudo chown -R www-data:www-data /var/www/nishya-api
sudo chmod 755 /var/www/nishya-api

# 3. Ensure binary is executable
if [ -f "/var/www/nishya-api/nishya-api-linux" ]; then
    sudo chmod +x /var/www/nishya-api/nishya-api-linux
    sudo chown www-data:www-data /var/www/nishya-api/nishya-api-linux
    echo "✅ Executable permissions set on nishya-api-linux"
else
    echo "⚠️  Please upload nishya-api-linux to /var/www/nishya-api/"
fi

# 4. Copy systemd service if present
if [ -f "nishya-api.service" ]; then
    sudo cp nishya-api.service /etc/systemd/system/nishya-api.service
    sudo systemctl daemon-reload
    sudo systemctl enable nishya-api
    echo "✅ systemd service nishya-api enabled"
fi

# 5. Copy Nginx configuration
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/nishya-api
    sudo ln -sf /etc/nginx/sites-available/nishya-api /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    echo "✅ Nginx configured and restarted"
fi

# 6. Configure UFW Firewall
sudo ufw allow 'Nginx Full' || true
sudo ufw allow OpenSSH || true

echo "=================================================="
echo "🎉 Setup complete!"
echo "To start the backend service:"
echo "   sudo systemctl start nishya-api"
echo "To check logs:"
echo "   sudo journalctl -u nishya-api -f"
echo "=================================================="
