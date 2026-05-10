import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from .database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'verifier', 'viewer', name='user_roles'), nullable=False, default='viewer')
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'

class VerificationRecord(db.Model):
    __tablename__ = 'verification_records'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True) # Max 5000 chars logic can be enforced in application layer or via check constraint
    status = db.Column(db.Enum('GENUINE', 'SUSPICIOUS', 'FAKE', 'PENDING', 'ERROR', name='verification_status'), nullable=False, default='PENDING')
    confidence = db.Column(db.Float, nullable=True)
    reasons = db.Column(JSONB, nullable=True) # Array of strings
    extracted_fields = db.Column(JSONB, nullable=True) # Doctor name, hospital, etc.
    text_score = db.Column(db.Float, nullable=True)
    image_score = db.Column(db.Float, nullable=True)
    ml_features = db.Column(JSONB, nullable=True) # Full 11-feature vector
    model_version = db.Column(db.String(50), nullable=True)
    processing_time_ms = db.Column(db.Integer, nullable=True)
    submitted_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f'<VerificationRecord {self.id} - {self.status}>'

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False) # e.g. 'UPLOAD', 'VERIFY'
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.UUID(as_uuid=True), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    details = db.Column(JSONB, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f'<AuditLog {self.action} by {self.user_id}>'

class BatchJob(db.Model):
    __tablename__ = 'batch_jobs'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('QUEUED', 'PROCESSING', 'DONE', 'FAILED', name='batch_status'), nullable=False, default='QUEUED')
    total_files = db.Column(db.Integer, default=0)
    processed_files = db.Column(db.Integer, default=0)
    results = db.Column(JSONB, nullable=True) # List of {filename, record_id, status}
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f'<BatchJob {self.id} - {self.status}>'
