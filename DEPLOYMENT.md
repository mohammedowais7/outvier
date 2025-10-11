Open-Source Production Deployment (Caddy + Docker + Postgres + Redis)

Prereqs
- Ubuntu/Debian VPS with Docker Engine + Compose plugin installed
- Domain pointing to VPS public IP (A record), e.g., api.example.com
- Ports 80/443 open in firewall

Files in this repo
- backend/Dockerfile: builds Django image and starts gunicorn
- docker-compose.prod.yml: services (db, redis, api, worker, beat, caddy)
- Caddyfile: reverse proxy + automatic HTTPS (Let’s Encrypt)
- backend/.env.production.example: example env vars for the API

1) Prepare environment files
- Copy backend/.env.production.example to backend/.env.production and edit:
  - DJANGO_SECRET_KEY=<random-long-string>
  - DJANGO_DEBUG=False
  - ALLOWED_HOSTS=api.example.com
  - CSRF_TRUSTED_ORIGINS=https://api.example.com
  - Optionally set CORS_ALLOW_ALL=False and CORS_ALLOWED_ORIGINS=https://your-app-domain
- Create .env in repo root with:
  - DOMAIN=api.example.com
  - ACME_EMAIL=you@example.com

2) Build and run
```
docker compose -f docker-compose.prod.yml --env-file backend/.env.production up -d --build
```

3) Verify
- Health: https://api.example.com/ should return JSON with db_ok: true
- Logs: `docker compose -f docker-compose.prod.yml logs -f api worker beat caddy`

4) Admin and DB
- Create superuser: `docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser`
- Postgres data persists in the `pgdata` named volume

5) Frontend app configuration
- Set your Expo app base URL to your domain:
  - frontend/app.json → `"extra": { "apiUrl": "https://api.example.com" }`
  - Restart expo: `npx expo start -c`

6) CI/CD (optional)
- Configure GitHub Secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PATH, VPS_PORT (optional)
- Push to main triggers `.github/workflows/deploy.yml` to rsync and compose up on the VPS

Notes
- Celery runs via `worker` (tasks) and `beat` (scheduler). Redis is the broker.
- Switch CORS to an allowlist for production (recommended).
- WhiteNoise serves static files from the API container.

No domain? Two open options
- Plain HTTP with your VPS IP (quickest; good for testing)
  - The compose file defaults `DOMAIN` to `:80`, so Caddy serves HTTP on port 80 for any Host header.
  - Use the API via `http://<YOUR_VPS_IP>/`.
  - In Expo, set base URL to your IP:
    - Temporary per run: `EXPO_PUBLIC_API_URL="http://<YOUR_VPS_IP>" npx expo start -c`
    - Or persist in `frontend/app.json` → `extra.apiUrl`.
  - Note: For production App Store builds, iOS ATS prefers HTTPS. For testing in Expo Go, HTTP works.

- Free wildcard DNS to your IP (HTTPS without buying a domain)
  - Services like `sslip.io` or `nip.io` resolve hostnames to IPs automatically.
    - Example: if your IP is `203.0.113.10`, use `203-0-113-10.sslip.io`.
  - Set root `.env` `DOMAIN=203-0-113-10.sslip.io` and restart compose.
  - Caddy will obtain a valid TLS cert; then use `https://203-0-113-10.sslip.io/` in your app.
  - Update `frontend/app.json` `extra.apiUrl` accordingly.
