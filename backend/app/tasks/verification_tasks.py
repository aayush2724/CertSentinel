import os
import logging
from celery import shared_task
from flask import current_app
from app.services.verification_service import VerificationService
from app.exceptions import CertSentinelError

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def verify_certificate_task(self, filepath, filename):
    """Celery task using the refactored VerificationService."""
    try:
        db = current_app.extensions["db"]
        model_path = current_app.config["MODEL_PATH"]
        
        service = VerificationService(
            db=db, 
            model_path=model_path,
            config=current_app.config
        )
        
        result = service.verify(filepath, filename)
        return result

    except CertSentinelError as exc:
        return {
            "error": str(exc),
            "code": exc.code,
            "retryable": exc.retryable
        }
    except Exception as exc:
        logger.exception("Task failure")
        return {
            "error": "Internal task error",
            "code": "ERR_INTERNAL",
            "retryable": False
        }
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
