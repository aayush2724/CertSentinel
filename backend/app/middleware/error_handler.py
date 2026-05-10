from flask import jsonify
from app.exceptions import CertSentinelError
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    @app.errorhandler(CertSentinelError)
    def handle_domain_error(error):
        response = jsonify({
            "error": str(error),
            "code": error.code,
            "retryable": error.retryable
        })
        response.status_code = 400
        return response

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        logger.exception("Unexpected error occurred")
        response = jsonify({
            "error": "An internal server error occurred.",
            "code": "ERR_INTERNAL",
            "retryable": False
        })
        response.status_code = 500
        return response
