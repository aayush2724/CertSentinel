"""
Routes / API Endpoints – JSON-only REST API
All routes are prefixed with /api.
"""
import os
import uuid
import logging
import mimetypes
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from celery.result import AsyncResult

from app.tasks import verify_certificate_task
from app import limiter

logger = logging.getLogger(__name__)
main = Blueprint("main", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}
ALLOWED_MIMETYPES = {"image/png", "image/jpeg", "application/pdf"}


def require_api_key(f):
    """Decorator to enforce API key authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        expected_key = current_app.config.get("API_KEY")
        if not api_key or api_key != expected_key:
            return jsonify({"error": "Unauthorized: Invalid or missing API key"}), 401
        return f(*args, **kwargs)
    return decorated_function


def allowed_file(filename: str, content_type: str = None) -> bool:
    """Validate file by extension and optionally by MIME type."""
    ext_ok = (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )
    if content_type:
        mime_ok = content_type in ALLOWED_MIMETYPES
        return ext_ok and mime_ok
    return ext_ok


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@main.get("/api/healthz")
def healthz():
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# Records (History / Report)
# ---------------------------------------------------------------------------


@main.get("/api/records")
@require_api_key
def get_all_records():
    """GET /api/records – return all verification records as JSON."""
    db = current_app.extensions["db"]
    records = db.get_all_records()
    return jsonify(records)


@main.get("/api/records/<int:record_id>")
@require_api_key
def get_record(record_id: int):
    """GET /api/records/<id> – return a single verification record."""
    db = current_app.extensions["db"]
    record = db.get_record(record_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404
    return jsonify(record)


# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------


@main.post("/api/verify")
@require_api_key
@limiter.limit("10 per minute")
def verify_certificate():
    """
    POST /api/verify
    Accepts a multipart/form-data upload with field name 'certificate'.
    Triggers background verification and returns task_id.
    """
    if "certificate" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["certificate"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    # Enhanced validation: extension + MIME type
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0]
    if not allowed_file(file.filename, content_type):
        return jsonify(
            {"error": f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"}
        ), 400

    # Security: Double sanitize. secure_filename on input, 
    # then join with a safe UUID prefix.
    safe_input_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4()}_{safe_input_name}"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)
    
    # Ensure the path is still within UPLOAD_FOLDER (prevent path traversal)
    if not os.path.abspath(filepath).startswith(os.path.abspath(current_app.config["UPLOAD_FOLDER"])):
        return jsonify({"error": "Invalid file path"}), 400

    try:
        file.save(filepath)
    except OSError as exc:
        logger.exception("Failed to save uploaded file")
        return jsonify({"error": f"Could not save file: {exc}"}), 500

    # Trigger background task
    task = verify_certificate_task.delay(filepath, unique_name)
    
    return jsonify({
        "task_id": task.id,
        "status": "pending",
        "message": "Verification started in the background"
    }), 202


@main.get("/api/tasks/<task_id>")
@require_api_key
def get_task_status(task_id):
    """GET /api/tasks/<task_id> – Poll for task status and results."""
    result = AsyncResult(task_id)
    
    response = {
        "task_id": task_id,
        "status": result.status,
    }
    
    if result.ready():
        if result.successful():
            task_result = result.result
            if isinstance(task_result, dict) and "error" in task_result:
                response["status"] = "FAILURE"
                response["error"] = task_result["error"]
                response["code"] = task_result.get("code")
                response["retryable"] = task_result.get("retryable")
            else:
                response["result"] = task_result
        else:
            # result.result contains the exception if the task failed catastrophically
            response["status"] = "FAILURE"
            response["error"] = str(result.result)
            response["code"] = "WORKER_CRASH"
            
    return jsonify(response)
