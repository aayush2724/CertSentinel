import logging
import mimetypes
from flask import Blueprint, request, jsonify, current_app
from celery.result import AsyncResult
from app.controllers.certificate_controller import CertificateController
from app.middleware.auth import token_required
from app import limiter

logger = logging.getLogger(__name__)
bp = Blueprint("certificates", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}
ALLOWED_MIMETYPES = {"image/png", "image/jpeg", "application/pdf"}

def allowed_file(filename, content_type=None):
    ext_ok = "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    if content_type:
        return ext_ok and content_type in ALLOWED_MIMETYPES
    return ext_ok

@bp.post("/verify")
@token_required
@limiter.limit("10 per minute")
def verify():
    if "certificate" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["certificate"]
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0]
    
    if not allowed_file(file.filename, content_type):
        return jsonify({"error": "File type not allowed"}), 400

    result = CertificateController.handle_upload(file)
    return jsonify(result), 202

@bp.get("/tasks/<task_id>")
@token_required
def get_status(task_id):
    result = AsyncResult(task_id)
    response = {"task_id": task_id, "status": result.status}
    
    if result.ready():
        if result.successful():
            task_result = result.result
            if isinstance(task_result, dict) and "error" in task_result:
                response.update({"status": "FAILURE", **task_result})
            else:
                response["result"] = task_result
        else:
            response.update({"status": "FAILURE", "error": str(result.result), "code": "WORKER_CRASH"})
            
    return jsonify(response)
