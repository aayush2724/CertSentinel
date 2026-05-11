"""initial_schema

Revision ID: 67fb65aafeee
Revises:
Create Date: 2026-05-10 23:13:10.290865
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "67fb65aafeee"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def json_type():
    return sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql")


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        user_roles = postgresql.ENUM("admin", "verifier", "viewer", name="user_roles", create_type=False)
        verification_status = postgresql.ENUM(
            "GENUINE", "SUSPICIOUS", "FAKE", "PENDING", "ERROR", name="verification_status", create_type=False
        )
        batch_status = postgresql.ENUM("QUEUED", "PROCESSING", "DONE", "FAILED", name="batch_status", create_type=False)
        user_roles.create(bind, checkfirst=True)
        verification_status.create(bind, checkfirst=True)
        batch_status.create(bind, checkfirst=True)
    else:
        user_roles = sa.Enum("admin", "verifier", "viewer", name="user_roles")
        verification_status = sa.Enum("GENUINE", "SUSPICIOUS", "FAKE", "PENDING", "ERROR", name="verification_status")
        batch_status = sa.Enum("QUEUED", "PROCESSING", "DONE", "FAILED", name="batch_status")

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_roles, nullable=False, server_default="viewer"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "permissions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_permissions_name"),
    )

    op.create_table(
        "user_permissions",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("permission_id", sa.UUID(), nullable=False),
        sa.Column("granted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["permission_id"], ["permissions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "permission_id"),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("resource_type", sa.String(length=50), nullable=True),
        sa.Column("resource_id", sa.UUID(), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("confidence_threshold_used", sa.Float(), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=True),
        sa.Column("details", json_type(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])
    op.create_index("ix_audit_logs_resource", "audit_logs", ["resource_type", "resource_id"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])

    op.create_table(
        "batch_jobs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("status", batch_status, nullable=False, server_default="QUEUED"),
        sa.Column("total_files", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processed_files", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("results", json_type(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("total_files >= 0", name="ck_batch_jobs_total_files_nonnegative"),
        sa.CheckConstraint("processed_files >= 0", name="ck_batch_jobs_processed_files_nonnegative"),
        sa.CheckConstraint("processed_files <= total_files", name="ck_batch_jobs_progress_bounds"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_batch_jobs_created_at", "batch_jobs", ["created_at"])
    op.create_index("ix_batch_jobs_status", "batch_jobs", ["status"])
    op.create_index("ix_batch_jobs_user_id", "batch_jobs", ["user_id"])

    op.create_table(
        "verification_records",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("status", verification_status, nullable=False, server_default="PENDING"),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("confidence_threshold_used", sa.Float(), nullable=True),
        sa.Column("reasons", json_type(), nullable=True),
        sa.Column("extracted_fields", json_type(), nullable=True),
        sa.Column("text_score", sa.Float(), nullable=True),
        sa.Column("image_score", sa.Float(), nullable=True),
        sa.Column("ml_features", json_type(), nullable=True),
        sa.Column("feature_extraction_metadata", json_type(), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("confidence IS NULL OR (confidence >= 0 AND confidence <= 1)", name="ck_verification_confidence_range"),
        sa.CheckConstraint("processing_time_ms IS NULL OR processing_time_ms >= 0", name="ck_verification_processing_time_nonnegative"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_verification_records_status", "verification_records", ["status"])
    op.create_index("ix_verification_records_submitted_at", "verification_records", ["submitted_at"])
    op.create_index("ix_verification_records_user_id", "verification_records", ["user_id"])
    op.create_index("ix_verification_records_user_status", "verification_records", ["user_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_verification_records_user_status", table_name="verification_records")
    op.drop_index("ix_verification_records_user_id", table_name="verification_records")
    op.drop_index("ix_verification_records_submitted_at", table_name="verification_records")
    op.drop_index("ix_verification_records_status", table_name="verification_records")
    op.drop_table("verification_records")

    op.drop_index("ix_batch_jobs_user_id", table_name="batch_jobs")
    op.drop_index("ix_batch_jobs_status", table_name="batch_jobs")
    op.drop_index("ix_batch_jobs_created_at", table_name="batch_jobs")
    op.drop_table("batch_jobs")

    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_resource", table_name="audit_logs")
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_table("user_permissions")
    op.drop_table("permissions")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        postgresql.ENUM(name="batch_status").drop(bind, checkfirst=True)
        postgresql.ENUM(name="verification_status").drop(bind, checkfirst=True)
        postgresql.ENUM(name="user_roles").drop(bind, checkfirst=True)
