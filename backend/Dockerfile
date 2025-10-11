FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (add build tools only if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install -r /app/backend/requirements.txt

# Copy backend code
COPY backend /app/backend
WORKDIR /app/backend

# Default command: run gunicorn (migrations can be run by compose post-up or entrypoint)
CMD ["bash","-lc","python manage.py collectstatic --noinput && python manage.py migrate --noinput && gunicorn api.wsgi:application --bind 0.0.0.0:8000"]
