#!/bin/bash
# Run on the server as root to fix "Unexpected token '<'" when publishing videos.
set -euo pipefail

CONF="/etc/nginx/sites-available/creator-pilot-pro"

if [ ! -f "$CONF" ]; then
  echo "Missing $CONF — copy deploy/nginx-creator-pilot-pro.conf first."
  exit 1
fi

# Add client_max_body_size at top of file if missing
if ! grep -q "client_max_body_size" "$CONF"; then
  sed -i '1i client_max_body_size 250M;' "$CONF"
  echo "Added client_max_body_size 250M"
fi

# Add proxy timeouts inside location / if missing
if ! grep -q "proxy_read_timeout" "$CONF"; then
  sed -i '/proxy_cache_bypass/a\        proxy_connect_timeout 300s;\n        proxy_send_timeout 300s;\n        proxy_read_timeout 300s;\n        send_timeout 300s;' "$CONF"
  echo "Added proxy timeouts"
fi

# Certbot SSL vhost (if present)
SSL_CONF="/etc/nginx/sites-enabled/creator-pilot-pro"
if [ -f "$SSL_CONF" ] || [ -L "$SSL_CONF" ]; then
  if ! grep -q "client_max_body_size" "$SSL_CONF" 2>/dev/null; then
    sed -i '1i client_max_body_size 250M;' "$CONF"
  fi
fi

nginx -t
systemctl reload nginx
echo "Nginx reloaded. Retry Post now on creatorpilotpro.com"
