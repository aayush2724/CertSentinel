import jwt
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timezone

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing", "code": "ERR_AUTH_MISSING"}), 401

        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired", "code": "ERR_AUTH_EXPIRED"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid", "code": "ERR_AUTH_INVALID"}), 401
        except Exception:
            return jsonify({"message": "Authentication failed", "code": "ERR_AUTH_FAILED"}), 401

        return f(*args, **kwargs)

    return decorated
