#!/bin/bash
# =============================================================================
# setup-ssl.sh — Bootstrap Let's Encrypt SSL for shopfront.co.ke
# Run once on the production server: sudo bash /opt/shopfront/scripts/setup-ssl.sh
# =============================================================================

set -e

DOMAIN="shopfront.co.ke"
EMAIL="admin@shopfront.co.ke"
COMPOSE_DIR="/opt/shopfront"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && error "Run as root: sudo bash $0"
command -v docker >/dev/null 2>&1 || error "Docker not found."
cd "$COMPOSE_DIR" || error "Could not cd to $COMPOSE_DIR"

# ── Check if cert already exists ──────────────────────────────────────────────
CERT_PATH="/var/lib/docker/volumes/shopfront_letsencrypt/_data/live/${DOMAIN}/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
    warn "Certificate already exists for ${DOMAIN}. Skipping acquisition."
else
    # ── Stop nginx-proxy so port 80 is free for certbot standalone ────────────
    info "Stopping nginx-proxy to free port 80..."
    docker compose stop nginx-proxy 2>/dev/null || true

    # ── Obtain certificate using standalone mode ───────────────────────────────
    info "Obtaining Let's Encrypt certificate for ${DOMAIN} and www.${DOMAIN}..."
    docker compose run --rm -p 80:80 certbot certonly \
        --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "${DOMAIN}" \
        -d "www.${DOMAIN}"

    info "Certificate obtained successfully."
fi

# ── Start all services with HTTPS config ──────────────────────────────────────
info "Starting all services..."
docker compose up -d

# ── Verify ────────────────────────────────────────────────────────────────────
sleep 6
if curl -sf --max-time 15 "https://${DOMAIN}" >/dev/null 2>&1; then
    info "HTTPS is live at https://${DOMAIN}"
else
    warn "Could not verify HTTPS yet — DNS may still be propagating."
    warn "Check nginx logs: docker compose logs nginx-proxy"
fi

# ── Cron: reload nginx nightly to pick up renewed certs ───────────────────────
info "Installing nightly nginx reload cron..."
CRON_JOB="0 3 * * * cd ${COMPOSE_DIR} && docker compose exec -T nginx-proxy nginx -s reload >> /var/log/nginx-reload.log 2>&1"
( crontab -l 2>/dev/null | grep -v "nginx-proxy nginx -s reload"; echo "$CRON_JOB" ) | crontab -

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} SSL setup complete — https://${DOMAIN}${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Useful commands:"
echo "  Check cert:    docker compose run --rm certbot certificates"
echo "  Force renew:   docker compose run --rm -p 80:80 certbot renew --force-renewal"
echo "  nginx logs:    docker compose logs -f nginx-proxy"
echo "  Reload nginx:  docker compose exec nginx-proxy nginx -s reload"
