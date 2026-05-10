from flask import Blueprint, jsonify, current_app
from app.middleware.auth import token_required

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@bp.get("/records")
@token_required
def get_records():
    db = current_app.extensions["db"]
    records = db.get_all_records()
    return jsonify(records)

@bp.get("/records/<int:record_id>")
@token_required
def get_record(record_id):
    db = current_app.extensions["db"]
    record = db.get_record(record_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404
    return jsonify(record)

@bp.get("/stats")
@token_required
def get_stats():
    # Placeholder for dashboard stats
    return jsonify({
        "total_verifications": 1250,
        "genuine_count": 980,
        "suspicious_count": 150,
        "fake_count": 120
    })
