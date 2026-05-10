"""
Celery Worker Entry Point
Run with: celery -A celery_worker.celery_app worker --loglevel=info
"""
from app import create_app

flask_app = create_app()
celery_app = flask_app.extensions["celery"]
