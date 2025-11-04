"""
Django settings for DNC platform project - PythonAnywhere optimized.
"""

import os
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG', default=False)

# PythonAnywhere specific ALLOWED_HOSTS
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.pythonanywhere.com',  # PythonAnywhere domain
    env('PYTHONANYWHERE_DOMAIN', default=''),  # Your specific domain
]

# Application definition
DJANGO_APPS = [
    'django.contrib.admin', 
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'crispy_forms',
    'crispy_bootstrap5',
    'django_filters',
    'import_export',
]

LOCAL_APPS = [
    'apps.core',
    'apps.users',
    'apps.community',
    'apps.projects',
    'apps.events',
    'apps.analytics',
    'apps.forum',
    'apps.integrations',
    'apps.outvier',
]

# Remove Celery apps for PythonAnywhere
if not env.bool('USE_CELERY', default=False):
    THIRD_PARTY_APPS.remove('django_celery_beat')

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dnc.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dnc.wsgi.application'

# Database - PythonAnywhere optimized
if env('DATABASE_URL', default=''):
    DATABASES = {
        'default': env.db()
    }
else:
    # Default to SQLite for PythonAnywhere free accounts
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # Increased for production
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images) - PythonAnywhere optimized
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files - PythonAnywhere optimized
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Django REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Configuration - Single, clean configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Authentication Configuration
LOGIN_REDIRECT_URL = '/dashboard/'
LOGIN_URL = '/login/'
LOGOUT_REDIRECT_URL = '/'

# CORS Settings - PythonAnywhere optimized
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.pythonanywhere.com",  # Replace with your domain
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Allow all origins in development only
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True

# Celery Configuration - Disabled for PythonAnywhere free accounts
if env.bool('USE_CELERY', default=False):
    CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='django://')
    CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='django-db')
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_TIMEZONE = TIME_ZONE
else:
    # Disable Celery for PythonAnywhere
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

# Email Configuration - PythonAnywhere optimized
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')

# Crispy Forms
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# Logging - PythonAnywhere optimized
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Security Settings - Production ready
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Cache Configuration - PythonAnywhere optimized (no Redis)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# API Integration Settings
GOOGLE_ANALYTICS_VIEW_ID = env('GOOGLE_ANALYTICS_VIEW_ID', default='')
GOOGLE_ANALYTICS_CREDENTIALS_PATH = env('GOOGLE_ANALYTICS_CREDENTIALS_PATH', default='')

# Social Media API Keys
TWITTER_API_KEY = env('TWITTER_API_KEY', default='')
TWITTER_API_SECRET = env('TWITTER_API_SECRET', default='')
TWITTER_ACCESS_TOKEN = env('TWITTER_ACCESS_TOKEN', default='')
TWITTER_ACCESS_TOKEN_SECRET = env('TWITTER_ACCESS_TOKEN_SECRET', default='')

LINKEDIN_CLIENT_ID = env('LINKEDIN_CLIENT_ID', default='')
LINKEDIN_CLIENT_SECRET = env('LINKEDIN_CLIENT_SECRET', default='')

# Salesforce Integration
SALESFORCE_CLIENT_ID = env('SALESFORCE_CLIENT_ID', default='')
SALESFORCE_CLIENT_SECRET = env('SALESFORCE_CLIENT_SECRET', default='')
SALESFORCE_USERNAME = env('SALESFORCE_USERNAME', default='')
SALESFORCE_PASSWORD = env('SALESFORCE_PASSWORD', default='')
SALESFORCE_SECURITY_TOKEN = env('SALESFORCE_SECURITY_TOKEN', default='')

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID = env('QUICKBOOKS_CLIENT_ID', default='')
QUICKBOOKS_CLIENT_SECRET = env('QUICKBOOKS_CLIENT_SECRET', default='')
QUICKBOOKS_REDIRECT_URI = env('QUICKBOOKS_REDIRECT_URI', default='')

# EventBrite Integration
EVENTBRITE_ACCESS_TOKEN = env('EVENTBRITE_ACCESS_TOKEN', default='')

# Discourse Integration
DISCOURSE_API_KEY = env('DISCOURSE_API_KEY', default='')
DISCOURSE_API_USERNAME = env('DISCOURSE_API_USERNAME', default='')
DISCOURSE_BASE_URL = env('DISCOURSE_BASE_URL', default='')

# WordPress Integration
WORDPRESS_URL = env('WORDPRESS_URL', default='')
WORDPRESS_USERNAME = env('WORDPRESS_USERNAME', default='')
WORDPRESS_PASSWORD = env('WORDPRESS_PASSWORD', default='')

# Custom Error Handlers
HANDLER400 = 'apps.core.views.error_400'
HANDLER401 = 'apps.core.views.error_401'
HANDLER403 = 'apps.core.views.error_403'
HANDLER404 = 'apps.core.views.error_404'
HANDLER500 = 'apps.core.views.error_500'

# Feature Flags for Integrations
INTEGRATIONS_API_ENABLED = env.bool('INTEGRATIONS_API_ENABLED', default=False)
WORDPRESS_INTEGRATION_ENABLED = env.bool('WORDPRESS_INTEGRATION_ENABLED', default=False)
SALESFORCE_INTEGRATION_ENABLED = env.bool('SALESFORCE_INTEGRATION_ENABLED', default=False)
QUICKBOOKS_INTEGRATION_ENABLED = env.bool('QUICKBOOKS_INTEGRATION_ENABLED', default=False)
DISCOURSE_INTEGRATION_ENABLED = env.bool('DISCOURSE_INTEGRATION_ENABLED', default=False)
EVENTBRITE_INTEGRATION_ENABLED = env.bool('EVENTBRITE_INTEGRATION_ENABLED', default=False)
GOOGLE_ANALYTICS_INTEGRATION_ENABLED = env.bool('GOOGLE_ANALYTICS_INTEGRATION_ENABLED', default=False)

# PythonAnywhere specific settings
PYTHONANYWHERE_DOMAIN = env('PYTHONANYWHERE_DOMAIN', default='')
USE_CELERY = env.bool('USE_CELERY', default=False)
