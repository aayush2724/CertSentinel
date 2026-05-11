import uuid
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func
from .database import db

JSONType = db.JSON().with_variant(postgresql.JSONB, "postgresql")

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = (
        db.Index('ix_users_email', 'email'),
        db.Index('ix_users_role', 'role'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'verifier', 'viewer', name='user_roles'), nullable=False, default='viewer')
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'

class Permission(db.Model):
    __tablename__ = 'permissions'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Permission {self.name}>'

class UserPermission(db.Model):
    __tablename__ = 'user_permissions'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    permission_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
    granted_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

class VerificationRecord(db.Model):
    __tablename__ = 'verification_records'
    __table_args__ = (
        db.CheckConstraint("confidence IS NULL OR (confidence >= 0 AND confidence <= 1)", name="ck_verification_confidence_range"),
        db.CheckConstraint("processing_time_ms IS NULL OR processing_time_ms >= 0", name="ck_verification_processing_time_nonnegative"),
        db.Index('ix_verification_records_submitted_at', 'submitted_at'),
        db.Index('ix_verification_records_status', 'status'),
        db.Index('ix_verification_records_user_id', 'user_id'),
        db.Index('ix_verification_records_user_status', 'user_id', 'status'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True) # Max 5000 chars logic can be enforced in application layer or via check constraint
    status = db.Column(db.Enum('GENUINE', 'SUSPICIOUS', 'FAKE', 'PENDING', 'ERROR', name='verification_status'), nullable=False, default='PENDING')
    confidence = db.Column(db.Float, nullable=True)
    confidence_threshold_used = db.Column(db.Float, nullable=True)
    reasons = db.Column(JSONType, nullable=True) # Array of strings
    extracted_fields = db.Column(JSONType, nullable=True) # Doctor name, hospital, etc.
    text_score = db.Column(db.Float, nullable=True)
    image_score = db.Column(db.Float, nullable=True)
    ml_features = db.Column(JSONType, nullable=True) # Full feature vector
    feature_extraction_metadata = db.Column(JSONType, nullable=True)
    model_version = db.Column(db.String(50), nullable=True)
    processing_time_ms = db.Column(db.Integer, nullable=True)
    submitted_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<VerificationRecord {self.id} - {self.status}>'

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    __table_args__ = (
        db.Index('ix_audit_logs_created_at', 'created_at'),
        db.Index('ix_audit_logs_user_id', 'user_id'),
        db.Index('ix_audit_logs_resource', 'resource_type', 'resource_id'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = db.Column(db.String(100), nullable=False) # e.g. 'UPLOAD', 'VERIFY'
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.UUID(as_uuid=True), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    confidence_threshold_used = db.Column(db.Float, nullable=True)
    model_version = db.Column(db.String(50), nullable=True)
    details = db.Column(JSONType, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<AuditLog {self.action} by {self.user_id}>'

class BatchJob(db.Model):
    __tablename__ = 'batch_jobs'
    __table_args__ = (
        db.CheckConstraint("total_files >= 0", name="ck_batch_jobs_total_files_nonnegative"),
        db.CheckConstraint("processed_files >= 0", name="ck_batch_jobs_processed_files_nonnegative"),
        db.CheckConstraint("processed_files <= total_files", name="ck_batch_jobs_progress_bounds"),
        db.Index('ix_batch_jobs_created_at', 'created_at'),
        db.Index('ix_batch_jobs_status', 'status'),
        db.Index('ix_batch_jobs_user_id', 'user_id'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum('QUEUED', 'PROCESSING', 'DONE', 'FAILED', name='batch_status'), nullable=False, default='QUEUED')
    total_files = db.Column(db.Integer, nullable=False, default=0)
    processed_files = db.Column(db.Integer, nullable=False, default=0)
    results = db.Column(JSONType, nullable=True) # List of {filename, record_id, status}
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f'<BatchJob {self.id} - {self.status}>'
