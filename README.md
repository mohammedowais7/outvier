# 🧭 Outvier

Goal-tracking app with reminders, events, collaboration, and push/email hooks.

=======================================================================

## 📁 Project Structure
outvier/
├── backend/                # Django 5 API (Postgres + Redis + Celery ready)
├── frontend/               # Expo React Native client
├── docker-compose.prod.yml # Caddy + Gunicorn + Postgres + Redis + Celery stack
└── scripts/
    └── dev.ps1             # One-shot dev startup script

=======================================================================

## ⚙️ Requirements
Component | Minimum
-----------|----------
Node.js | 18+ (tested with Node 24 + npm 11)
Python | 3.11+ (virtualenv recommended; backend/venv already exists)
Docker + Compose | for production-style stack
Expo Go app | install on iOS/Android for testing

=======================================================================

## 🧑‍💻 1. Local Development (Backend + Frontend)

### Backend (Windows PowerShell)
cd "C:\Users\polav\Desktop\VIT\Units\CapstoneProject Files\outvier\backend"
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

Ensure ALLOWED_HOSTS in settings.py includes your LAN IP (e.g. 172.20.10.3).

---

### Frontend (Expo Client)
cd "C:\Users\polav\Desktop\VIT\Units\CapstoneProject Files\outvier\frontend"

# Detect your active LAN IP automatically
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceOperationalStatus -eq 'Up' } |
  Sort-Object InterfaceMetric, IPAddress |
  Select-Object -First 1 -ExpandProperty IPAddress)
$env:EXPO_PUBLIC_API_URL = "http://$ip:8000"

npm install
npx expo start -c

Scan the QR code with Expo Go (ensure phone and PC are on the same Wi-Fi).
Safari or Chrome on your phone should load:
http://<PC-IP>:8000/ and return {"status":"ok"}.

=======================================================================

## 🐳 2. Production Stack (Docker, Caddy, Postgres, Redis, Celery)

### Prepare Configuration
Edit backend/.env.production:
- Update DJANGO_SECRET_KEY
- Update DB credentials
- Tighten CORS/ALLOWED_HOSTS before deployment

Optional root .env:
DOMAIN=<your.ip>.sslip.io
ACME_EMAIL=<you@example.com>

---

### Run the Stack
cd "C:\Users\polav\Desktop\VIT\Units\CapstoneProject Files\outvier"
docker compose -f docker-compose.prod.yml --env-file backend/.env.production up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost/

---

### Firewall (Windows PowerShell as Admin)
New-NetFirewallRule -DisplayName "Outvier Caddy 80"  -Direction Inbound -LocalPort 80  -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Outvier Caddy 443" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

=======================================================================

## 📱 3. Expo App Notes
- EXPO_PUBLIC_API_URL overrides auto-detection.
- If unset, Expo auto-detects the Metro host (e.g. 172.20.x.x) and tries:
  http://host:8000 and http://host
- Metro logs show API Base URL: http://172.20.10.3:8000 for quick verification.

=======================================================================

## ⚡ 4. Deployment Automation (GitHub Actions)
.github/workflows/deploy.yml deploys via SSH + Docker Compose.

Required GitHub Secrets:
VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PATH, VPS_PORT

Post-deploy health check:
docker compose exec api python manage.py check

=======================================================================

## ⏰ 5. Celery Reminders & Notifications
- Celery worker and beat run in Docker services (worker, beat).
- Task goals.tasks.run_reminder_scan executes every 60 seconds.
- Email sending uses Django’s EMAIL_HOST settings.
- Expo push sending is stubbed. Integrate with https://expo.dev/push-notifications when ready.

=======================================================================

## 🧩 6. Troubleshooting

Issue | Fix
------|----
Expo shows API Base URL http://127.0.0.1 | Set $env:EXPO_PUBLIC_API_URL="http://<PC-IP>:8000" in same shell, then npx expo start -c.
Phone can't reach backend | Backend must run on 0.0.0.0, ensure phone+PC on same Wi-Fi, firewall allows port 8000.
Docker migrations fail | Remove extra migrations or docker compose down -v to reset.
Celery not available in dev | Set DISABLE_CELERY=True (default).
Expo still uses old URL | Remove-Item Env:EXPO_PUBLIC_API_URL -ErrorAction SilentlyContinue; restart Expo with -c.

=======================================================================

## 🧰 7. Optional Enhancements
- Add scripts/dev.ps1 to auto-start backend + Expo with env vars.
- Add scripts/deploy-cloudflared.ps1 for HTTPS tunnel via Cloudflare.
- Harden prod CORS/CSRF settings.
- Add Expo push token registration + sending in Celery.

=======================================================================

## ⚖️ License
© 2025 Outvier. Licensed under the MIT License unless otherwise noted.

=======================================================================

## 🚀 Example dev.ps1 (Place in scripts/dev.ps1)

param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

# Detect LAN IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceOperationalStatus -eq 'Up' } |
  Sort-Object InterfaceMetric, IPAddress |
  Select-Object -First 1 -ExpandProperty IPAddress)
if (-not $ip) { throw "Could not determine LAN IP." }

Write-Host "Using LAN IP: $ip"

# Backend
Push-Location "$PSScriptRoot\..\backend"
.\venv\Scripts\Activate.ps1
$env:DISABLE_CELERY = "True"
python manage.py migrate
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$PWD`"; .\venv\Scripts\Activate.ps1; python manage.py runserver 0.0.0.0:$Port"
Pop-Location

# Frontend
Push-Location "$PSScriptRoot\..\frontend"
$env:EXPO_PUBLIC_API_URL = "http://$ip:$Port"
npm install
npx expo start -c
Pop-Location

=======================================================================

## 🔧 Example API Base Helper (frontend/src/lib/apiBase.ts)

import Constants from "expo-constants";
import { Platform } from "react-native";

function getDevHost() {
  const hostUri = (Constants as any).expoConfig?.hostUri;
  const dbg = (Constants as any).manifest?.debuggerHost;
  const hostPort = hostUri || dbg;
  if (hostPort) return hostPort.split(":")[0];
  if (Platform.OS === "android") return "10.0.2.2";
  return "localhost";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : (__DEV__
        ? `http://${getDevHost()}:8000`
        : "https://api.outvier.example.com");

=======================================================================

## 🔒 backend/.env.production Example

DJANGO_SETTINGS_MODULE=config.settings_prod
DJANGO_SECRET_KEY=change_me
DJANGO_DEBUG=False
ALLOWED_HOSTS=outvier.example.com
CSRF_TRUSTED_ORIGINS=https://outvier.example.com
CORS_ALLOWED_ORIGINS=https://outvier.example.com
SECURE_SSL_REDIRECT=True
DATABASE_URL=postgres://outvier:strongpass@db:5432/outvier
REDIS_URL=redis://redis:6379/0
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=secret
EMAIL_PORT=587
EMAIL_USE_TLS=True

=======================================================================

## 🩺 Health Endpoint (backend/config/urls.py)

from django.http import JsonResponse

def health(_):
    return JsonResponse({"status": "ok"})

urlpatterns += [path("", health), path("healthz/", health)]

=======================================================================

## 🕒 Celery Beat Example (settings.py)

TIME_ZONE = "Australia/Melbourne"
USE_TZ = True
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    "reminder-scan": {
        "task": "goals.tasks.run_reminder_scan",
        "schedule": 60.0,
    },
}

=======================================================================

## 🧠 Notes
- Always run backend with `0.0.0.0` for device access.
- Allow Windows Firewall for Python on port 8000.
- Ensure phone and PC share the same Wi-Fi.
- IP may change per network—rerun `dev.ps1` to refresh automatically.
- Use Docker stack for stable production behavior.

=======================================================================
