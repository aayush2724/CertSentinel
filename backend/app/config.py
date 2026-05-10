"""
Application Configuration
Environment-driven settings for dev and production.
"""
import os


class Config:
    # Security: SECRET_KEY MUST be set via environment in production.
    # A random fallback is provided only for local dev convenience.
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32).hex())

    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

    DATABASE_PATH = os.environ.get(
        "DATABASE_PATH",
        os.path.join(os.path.dirname(__file__), "..", "certificates.db"),
    )

    MODEL_PATH = os.path.join(
        os.path.dirname(__file__), "..", "ml", "models", "classifier.pkl"
    )

    CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    # ML Config
    MODEL_VERSION = "1.0.0"
    CONFIDENCE_THRESHOLD_GENUINE = 0.80
    CONFIDENCE_THRESHOLD_SUSPICIOUS = 0.50

    # Security
    API_KEY = os.environ.get("API_KEY", "dev-key-12345")
    RATELIMIT_DEFAULT = "200 per day; 50 per hour"
    RATELIMIT_STORAGE_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    # In production, SECRET_KEY should be set via environment.
    # If missing, it will fall back to the base Config's random key or None here.
    # To keep the 'intentional crash' behavior, we could check it in create_app.
    SECRET_KEY = os.environ.get("SECRET_KEY")


class TestingConfig(Config):
    TESTING = True
    DATABASE_PATH = ":memory:"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
