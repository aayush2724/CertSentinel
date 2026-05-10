import os
import logging
from flask import Flask
from flask_cors import CORS
from celery import Celery, Task
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.config import Config
from app.middleware.error_handler import register_error_handlers

limiter = Limiter(key_func=get_remote_address)

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config, silent=True)
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    celery_init_app(app)
    limiter.init_app(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Database setup
    from database.db_handler import DBHandler
    app.extensions["db"] = DBHandler(app.config["DATABASE_PATH"])

    # Middleware
    register_error_handlers(app)

    # Blueprints
    from app.routes.certificates import bp as certificates_bp
    from app.routes.auth import bp as auth_bp
    from app.routes.admin import bp as admin_bp
    
    app.register_blueprint(certificates_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    return app
