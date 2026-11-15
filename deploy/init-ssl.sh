#!/usr/bin/env bash
# ==============================================================================
# Automated Production SSL/TLS Initializer for Azure Virtual Machine
# Usage: ./deploy/init-ssl.sh <your-domain.com> <your-email@example.com>
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Error: Missing arguments."
  echo "Usage: ./deploy/init-ssl.sh <domain> <email>"
  echo "Example: ./deploy/init-ssl.sh chat.example.com admin@example.com"
  exit 1
fi

echo "==> Configuring SSL for domain: $DOMAIN with email: $EMAIL"

DATA_PATH="./certbot"
CONF_PATH="$DATA_PATH/conf/live/$DOMAIN"

mkdir -p "$DATA_PATH/www"
mkdir -p "$CONF_PATH"

# Step 1: Create self-signed placeholder certificate so Nginx can boot on HTTPS
if [ ! -f "$CONF_PATH/privkey.pem" ]; then
  echo "==> Generating temporary self-signed certificate for initial boot..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CONF_PATH/privkey.pem" \
    -out "$CONF_PATH/fullchain.pem" \
    -subj "/CN=localhost"
fi

# Step 2: Start services using production compose
echo "==> Starting containers to enable ACME webroot challenge..."
docker compose -f docker-compose.prod.yml up -d client backend mongo

# Step 3: Request production certificate from Let's Encrypt via Certbot
echo "==> Requesting official Let's Encrypt certificate..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive \
    --force-renewal" certbot

# Step 4: Reload Nginx with production certificates
echo "==> Reloading Nginx with production TLS certificates..."
docker compose -f docker-compose.prod.yml exec client nginx -s reload

echo "==> SSL installation successful! Your site is now live at https://$DOMAIN"
