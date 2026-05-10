import os
import redis
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from flask_bcrypt import Bcrypt
from ..database import db
from ..models import User
from ..errors import AuthError, UNAUTHORIZED
from ..repositories.audit_repository import AuditRepository

bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()
# audit_repo will be initialized in the routes to ensure session context

# Setup Redis for token blocklist
try:
    jwt_redis_blocklist = redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"))
except Exception:
    jwt_redis_blocklist = None 

@bp.route('/register', methods=['POST'])
def register():
    audit_repo = AuditRepository(db.session)
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'viewer')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500

@bp.route('/login', methods=['POST'])
def login():
    audit_repo = AuditRepository(db.session)
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        user.last_login = db.func.now()
        db.session.commit()
        
        audit_repo.log(user.id, 'LOGIN', ip_address=request.remote_addr)
        
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        return jsonify({
            "access_token": access_token,
            "user": {"id": str(user.id), "email": user.email, "role": user.role}
        }), 200
    
    if user:
        audit_repo.log(user.id, 'LOGIN_FAILED', ip_address=request.remote_addr)
        
    raise AuthError(UNAUTHORIZED, "Invalid credentials")

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        raise AuthError(UNAUTHORIZED, "User not found")
    return jsonify({
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat()
    }), 200

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    audit_repo = AuditRepository(db.session)
    jti = get_jwt()["jti"]
    if jwt_redis_blocklist:
        jwt_redis_blocklist.set(jti, "", ex=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    
    user_id = get_jwt_identity()
    audit_repo.log(user_id, 'LOGOUT', ip_address=request.remote_addr)
    
    return jsonify({"message": "Logged out"}), 200
