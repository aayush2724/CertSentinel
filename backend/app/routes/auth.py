import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/login")
def login():
    """Simple login for demo. In production, verify against DB."""
    auth = request.json
    if not auth or not auth.get("username") or not auth.get("password"):
        return jsonify({"message": "Could not verify", "code": "ERR_AUTH_MISSING"}), 401

    # Mock user check
    if auth.get("username") == "admin" and auth.get("password") == "password":
        token = jwt.encode({
            'user': auth.get("username"),
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'token': token})

    return jsonify({"message": "Invalid credentials", "code": "ERR_AUTH_INVALID"}), 401
