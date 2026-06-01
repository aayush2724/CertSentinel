import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func, or_
from ..models import VerificationRecord
from ..database import db

class VerificationRepository:
    def __init__(self, db_session=None):
        self.session = db_session or db.session

    def create(self, data: dict) -> VerificationRecord:
        if data.get("user_id") is not None:
            try:
                data = {**data, "user_id": uuid.UUID(str(data["user_id"]))}
            except (ValueError, TypeError, AttributeError):
                data = {**data, "user_id": None}
        record = VerificationRecord(**data)
        self.session.add(record)
        self.session.commit()
        return record

    def get_by_id(self, record_id: str) -> Optional[VerificationRecord]:
        try:
            record_uuid = uuid.UUID(str(record_id))
        except (ValueError, TypeError, AttributeError):
            return None
        return self.session.query(VerificationRecord).filter_by(id=record_uuid).first()

    def get_by_id_for_user(self, record_id: str, user_id: str) -> Optional[VerificationRecord]:
        try:
            record_uuid = uuid.UUID(str(record_id))
            user_uuid = uuid.UUID(str(user_id))
        except (ValueError, TypeError, AttributeError):
            return None
        return self.session.query(VerificationRecord).filter_by(id=record_uuid, user_id=user_uuid).first()

    def get_all(self, user_id=None, limit=100, offset=0, 
                status_filter=None, date_from=None, date_to=None) -> List[VerificationRecord]:
        query = self.session.query(VerificationRecord)
        
        if user_id:
            try:
                user_id = uuid.UUID(str(user_id))
            except (ValueError, TypeError, AttributeError):
                return []
            query = query.filter_by(user_id=user_id)
        if status_filter:
            query = query.filter_by(status=status_filter)
        if date_from:
            query = query.filter(VerificationRecord.submitted_at >= date_from)
        if date_to:
            query = query.filter(VerificationRecord.submitted_at <= date_to)
            
        limit = max(1, min(int(limit or 100), 500))
        offset = max(0, int(offset or 0))
        return query.order_by(VerificationRecord.submitted_at.desc()).limit(limit).offset(offset).all()

    def get_stats(self, user_id=None) -> dict:
        today = datetime.utcnow().date()
        base_query = self.session.query(VerificationRecord)
        if user_id:
            try:
                user_id = uuid.UUID(str(user_id))
            except (ValueError, TypeError, AttributeError):
                return {
                    "total": 0,
                    "genuine_count": 0,
                    "suspicious_count": 0,
                    "fake_count": 0,
                    "avg_confidence": 0,
                    "records_today": 0,
                }
            base_query = base_query.filter_by(user_id=user_id)
        
        total = base_query.with_entities(func.count(VerificationRecord.id)).scalar()
        genuine = base_query.filter_by(status='GENUINE').with_entities(func.count(VerificationRecord.id)).scalar()
        suspicious = base_query.filter_by(status='SUSPICIOUS').with_entities(func.count(VerificationRecord.id)).scalar()
        fake = base_query.filter_by(status='FAKE').with_entities(func.count(VerificationRecord.id)).scalar()
        
        avg_confidence = base_query.with_entities(func.avg(VerificationRecord.confidence)).scalar() or 0
        records_today = base_query.filter(
            func.cast(VerificationRecord.submitted_at, db.Date) == today
        ).with_entities(func.count(VerificationRecord.id)).scalar()
        
        return {
            "total": total,
            "genuine_count": genuine,
            "suspicious_count": suspicious,
            "fake_count": fake,
            "avg_confidence": round(float(avg_confidence), 2),
            "records_today": records_today
        }

    def search_by_text(self, query_str: str, limit=20) -> List[VerificationRecord]:
        # Simple text search for now; real TSVector search would require PostgreSQL specific functions
        return self.session.query(VerificationRecord).filter(
            VerificationRecord.extracted_text.ilike(f"%{query_str}%")
        ).limit(limit).all()
