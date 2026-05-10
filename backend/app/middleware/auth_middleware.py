from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from ..errors import AuthError, FORBIDDEN

def role_required(required_role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != required_role and claims.get("role") != 'admin':
                raise AuthError(FORBIDDEN, f"Role {required_role} required", status_code=403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
