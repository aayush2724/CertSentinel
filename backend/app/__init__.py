import os
import logging
from flask import Flask
from flask_cors import CORS
from celery import Celery, Task
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from .database import db
from .config import DevelopmentConfig

limiter = Limiter(key_func=get_remote_address)
jwt = JWTManager()
bcrypt = Bcrypt()

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config, silent=True, namespace='CELERY')
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)
    if not app.config.get("DEBUG") and not app.config.get("SECRET_KEY"):
        raise ValueError("No SECRET_KEY set for Flask application")

    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    celery_init_app(app)
    limiter.init_app(app)
    jwt.init_app(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Global Error Handlers
    from .errors import register_error_handlers
    register_error_handlers(app)

    # Blueprints
    from .routes.certificates import bp as certificates_bp
    from .routes.auth import bp as auth_bp
    from .routes.admin import bp as admin_bp
    
    app.register_blueprint(certificates_bp, url_prefix='/api/certificates')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app
