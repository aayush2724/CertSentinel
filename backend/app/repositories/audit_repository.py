import sys
from typing import List
from ..models import AuditLog
from ..database import db

class AuditRepository:
    def __init__(self, db_session=None):
        self.session = db_session or db.session

    def log(self, user_id, action, resource_type=None, 
            resource_id=None, ip_address=None, details=None) -> AuditLog:
        """Create an audit log entry. Never raises — swallows exceptions to avoid breaking main request flow."""
        try:
            entry = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                details=details
            )
            self.session.add(entry)
            self.session.commit()
            return entry
        except Exception as e:
            print(f"FAILED TO WRITE AUDIT LOG: {str(e)}", file=sys.stderr)
            self.session.rollback()
            return None

    def get_by_user(self, user_id, limit=50) -> List[AuditLog]:
        return self.session.query(AuditLog).filter_by(user_id=user_id).order_by(AuditLog.created_at.desc()).limit(limit).all()

    def get_recent(self, limit=100) -> List[AuditLog]:
        return self.session.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
