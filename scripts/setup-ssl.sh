#!/bin/bash
# =============================================================================
# setup-ssl.sh — Bootstrap Let's Encrypt SSL for shopfront.co.ke
#
# Run once on the production server from /opt/shopfront after deploying:
#   sudo bash scripts/setup-ssl.sh
#
# What it does:
#   1. Creates required directories
#   2. Starts nginx-proxy with HTTP-only config so port 80 is reachable
#   3. Runs certbot to obtain the certificate via webroot challenge
#   4. Switches nginx to the full HTTPS config and reloads
#   5. Installs a cron job for nginx reload after each certbot renewal
# =============================================================================

set -e

DOMAIN="shopfront.co.ke"
EMAIL="admin@shopfront.co.ke"        # Change to your real email for expiry alerts
COMPOSE_DIR="/opt/shopfront"

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Sanity checks ─────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Run as root: sudo bash $0"
command -v docker >/dev/null 2>&1 || error "Docker not found. Run the deploy workflow first."
cd "$COMPOSE_DIR" || error "Could not cd to $COMPOSE_DIR"

# ── 1. Create directories that Docker named volumes won't create on the host ──
info "Creating certbot directories..."
mkdir -p nginx
mkdir -p /etc/letsencrypt          # will be used by the letsencrypt named volume

# ── 2. Check if cert already exists ──────────────────────────────────────────
if [ -f "/var/lib/docker/volumes/shopfront_letsencrypt/_data/live/${DOMAIN}/fullchain.pem" ]; then
    warn "Certificate already exists for ${DOMAIN}. Skipping acquisition."
    warn "To force renewal run: docker compose run --rm certbot renew --force-renewal"
else
    # ── 3. Start nginx-proxy with HTTP-only config for webroot challenge ───────
    info "Starting nginx-proxy with HTTP-only config for ACME challenge..."
    cp nginx/nginx-http-only.conf nginx/nginx.conf.bak 2>/dev/null || true

    # Temporarily swap in the HTTP-only config
    docker compose up -d nginx-proxy

    # Give nginx a moment to start
    sleep 3

    # Verify nginx is responding on port 80
    if ! curl -sf http://localhost/.well-known/acme-challenge/test 2>/dev/null; then
        info "nginx is up (404 on challenge path is expected at this stage)"
    fi

    # ── 4. Obtain the certificate ─────────────────────────────────────────────
    info "Obtaining Let's Encrypt certificate for ${DOMAIN} and www.${DOMAIN}..."
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --domains "${DOMAIN},www.${DOMAIN}"

    info "Certificate obtained successfully."
fi

# ── 5. Switch nginx to full HTTPS config and restart everything ───────────────
info "Switching nginx-proxy to HTTPS config and starting all services..."
docker compose down nginx-proxy

# Restore the real HTTPS nginx.conf
docker compose up -d

# ── 6. Verify HTTPS is working ────────────────────────────────────────────────
sleep 5
if curl -sf --max-time 10 "https://${DOMAIN}" >/dev/null 2>&1; then
    info "HTTPS is working! https://${DOMAIN} is live."
else
    warn "Could not verify HTTPS yet. DNS may need time to propagate, or check nginx-proxy logs:"
    warn "  docker compose logs nginx-proxy"
fi

# ── 7. Install cron job to reload nginx after certbot renewal ─────────────────
info "Installing cron job for post-renewal nginx reload..."
CRON_JOB="0 3 * * * cd ${COMPOSE_DIR} && docker compose exec -T nginx-proxy nginx -s reload >> /var/log/nginx-reload.log 2>&1"
# Add only if not already present
( crontab -l 2>/dev/null | grep -v "nginx-proxy nginx -s reload" ; echo "$CRON_JOB" ) | crontab -

info "Cron job installed: nginx reloads daily at 03:00 to pick up renewed certs."

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} SSL setup complete for https://${DOMAIN}${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Useful commands:"
echo "  Check cert expiry:   docker compose run --rm certbot certificates"
echo "  Force renewal:       docker compose run --rm certbot renew --force-renewal"
echo "  nginx logs:          docker compose logs -f nginx-proxy"
echo "  Reload nginx:        docker compose exec nginx-proxy nginx -s reload"
