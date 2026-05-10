import uuid
from datetime import datetime
from flask import jsonify
from sqlalchemy.exc import IntegrityError, OperationalError
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

# Error Codes
INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT"
FILE_TOO_LARGE = "FILE_TOO_LARGE"
FILE_CORRUPTED = "FILE_CORRUPTED"
OCR_FAILED = "OCR_FAILED"
OCR_EMPTY_RESULT = "OCR_EMPTY_RESULT"
PREPROCESSING_FAILED = "PREPROCESSING_FAILED"
MODEL_INFERENCE_FAILED = "MODEL_INFERENCE_FAILED"
RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
UNAUTHORIZED = "UNAUTHORIZED"
FORBIDDEN = "FORBIDDEN"
RECORD_NOT_FOUND = "RECORD_NOT_FOUND"
DB_SAVE_FAILED = "DB_SAVE_FAILED"
BATCH_LIMIT_EXCEEDED = "BATCH_LIMIT_EXCEEDED"

# Exception Classes
class CertSentinelError(Exception):
    def __init__(self, error_code, message, details=None, status_code=400):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.status_code = status_code

class FileValidationError(CertSentinelError):
    def __init__(self, error_code, message, details=None):
        super().__init__(error_code, message, details, status_code=400)

class ProcessingError(CertSentinelError):
    def __init__(self, error_code, message, details=None):
        super().__init__(error_code, message, details, status_code=500)

class AuthError(CertSentinelError):
    def __init__(self, error_code, message, details=None, status_code=401):
        super().__init__(error_code, message, details, status_code)

class NotFoundError(CertSentinelError):
    def __init__(self, error_code, message, details=None):
        super().__init__(error_code, message, details, status_code=404)

# Error Response Builder
def error_response(error_code, message, details=None, status_code=400, request_id=None):
    return jsonify({
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id or str(uuid.uuid4())
        }
    }), status_code

# Register Error Handlers
def register_error_handlers(app):
    @app.errorhandler(CertSentinelError)
    def handle_certsentinel_error(e):
        return error_response(e.error_code, e.message, e.details, e.status_code)

    @app.errorhandler(400)
    def bad_request(e):
        return error_response("BAD_REQUEST", str(e), status_code=400)

    @app.errorhandler(404)
    def not_found(e):
        return error_response(RECORD_NOT_FOUND, "Resource not found", status_code=404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("METHOD_NOT_ALLOWED", str(e), status_code=405)

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return error_response(FILE_TOO_LARGE, "File is too large", status_code=413)

    @app.errorhandler(422)
    def unprocessable_entity(e):
        return error_response("UNPROCESSABLE_ENTITY", str(e), status_code=422)

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return error_response(RATE_LIMIT_EXCEEDED, "Too many requests", status_code=429)

    @app.errorhandler(500)
    def internal_server_error(e):
        return error_response("INTERNAL_SERVER_ERROR", "An unexpected error occurred", status_code=500)

    # JWT Errors
    @app.errorhandler(ExpiredSignatureError)
    def handle_expired_token(e):
        return error_response(UNAUTHORIZED, "Token has expired", status_code=401)

    @app.errorhandler(InvalidTokenError)
    def handle_invalid_token(e):
        return error_response(UNAUTHORIZED, "Invalid token", status_code=401)

    # SQLAlchemy Errors
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(e):
        return error_response(DB_SAVE_FAILED, "Database integrity error", status_code=400)

    @app.errorhandler(OperationalError)
    def handle_operational_error(e):
        return error_response(DB_SAVE_FAILED, "Database operational error", status_code=500)
