import os
import uuid
import redis
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from ..database import db
from ..models import User
from .. import bcrypt
from ..errors import AuthError, FileValidationError, UNAUTHORIZED, VALIDATION_ERROR
from ..repositories.audit_repository import AuditRepository

bp = Blueprint('auth', __name__)
# audit_repo will be initialized in the routes to ensure session context

_jwt_redis_blocklist = None
_jwt_redis_url = None
_memory_blocklist = set()

def _blocklist_url():
    try:
        return current_app.config.get("JWT_BLOCKLIST_REDIS_URL")
    except RuntimeError:
        return os.environ.get("JWT_BLOCKLIST_REDIS_URL") or os.environ.get("REDIS_URL", "redis://localhost:6379/0")

def _blocklist_required():
    try:
        return bool(current_app.config.get("JWT_BLOCKLIST_REQUIRED", False))
    except RuntimeError:
        return False

def _get_blocklist_client():
    global _jwt_redis_blocklist, _jwt_redis_url
    redis_url = _blocklist_url()
    if _jwt_redis_blocklist is not None and _jwt_redis_url == redis_url:
        return _jwt_redis_blocklist
    try:
        client = redis.from_url(redis_url)
        client.ping()
    except Exception as exc:
        _jwt_redis_blocklist = None
        _jwt_redis_url = redis_url
        try:
            current_app.logger.warning("JWT blocklist Redis unavailable: %s", exc)
        except RuntimeError:
            pass
        return None
    _jwt_redis_blocklist = client
    _jwt_redis_url = redis_url
    return client

def is_token_revoked(jwt_payload):
    jti = jwt_payload.get("jti")
    if not jti:
        return True

    client = _get_blocklist_client()
    if client:
        return client.get(jti) is not None

    if _blocklist_required():
        return True
    return jti in _memory_blocklist

@bp.route('/register', methods=['POST'])
def register():
    audit_repo = AuditRepository(db.session)
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    role = "viewer"

    if not email or not password:
        raise FileValidationError(VALIDATION_ERROR, "Email and password are required")
    if User.query.filter_by(email=email).first():
        raise FileValidationError(VALIDATION_ERROR, "Email already registered")

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password_hash=hashed_password, role=role)
    
    try:
        db.session.add(user)
        db.session.commit()
        
        audit_repo.log(user.id, 'REGISTER', ip_address=request.remote_addr)
        
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        return jsonify({
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "access_token": access_token
        }), 201
    except Exception:
        db.session.rollback()
        from ..errors import ProcessingError, DB_SAVE_FAILED

        raise ProcessingError(DB_SAVE_FAILED, "Registration failed")

@bp.route('/login', methods=['POST'])
def login():
    audit_repo = AuditRepository(db.session)
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        raise AuthError(UNAUTHORIZED, "Invalid credentials")

    user = User.query.filter_by(email=email).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        user.last_login = db.func.now()
        db.session.commit()
        
        audit_repo.log(user.id, 'LOGIN', ip_address=request.remote_addr)
        
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "name": user.name,
                "avatar": user.avatar
            }
        }), 200
    
    if user:
        audit_repo.log(user.id, 'LOGIN_FAILED', ip_address=request.remote_addr)
        
    raise AuthError(UNAUTHORIZED, "Invalid credentials")

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except (ValueError, AttributeError):
        raise AuthError(UNAUTHORIZED, "Invalid user ID")
    
    user = db.session.get(User, user_uuid)
    if not user:
        raise AuthError(UNAUTHORIZED, "User not found")
    return jsonify({
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "avatar": user.avatar,
        "created_at": user.created_at.isoformat()
    }), 200

@bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    audit_repo = AuditRepository(db.session)
    user_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except (ValueError, AttributeError):
        raise AuthError(UNAUTHORIZED, "Invalid user ID")
        
    user = db.session.get(User, user_uuid)
    if not user:
        raise AuthError(UNAUTHORIZED, "User not found")
        
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    email = data.get('email')
    avatar = data.get('avatar')
    
    if email:
        # Check if email is already taken by another user
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user.id:
            return jsonify({"error_code": "VALIDATION_ERROR", "message": "Email is already taken"}), 400
        user.email = email
        
    if name is not None:
        user.name = name
        
    if avatar is not None:
        user.avatar = avatar
        
    try:
        db.session.commit()
        audit_repo.log(user.id, 'UPDATE_PROFILE', ip_address=request.remote_addr)
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "name": user.name,
                "avatar": user.avatar
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile", "details": str(e)}), 500

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    audit_repo = AuditRepository(db.session)
    jti = get_jwt()["jti"]
    client = _get_blocklist_client()
    if client:
        client.set(jti, "", ex=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    elif _blocklist_required():
        raise AuthError(UNAUTHORIZED, "Token revocation store is unavailable")
    else:
        _memory_blocklist.add(jti)
    
    user_id = get_jwt_identity()
    audit_repo.log(user_id, 'LOGOUT', ip_address=request.remote_addr)
    
    return jsonify({"message": "Logged out"}), 200
