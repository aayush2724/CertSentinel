import sys
import os
import uuid
from datetime import datetime
from flask_bcrypt import Bcrypt

# Add project root to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app
from app.database import db
from app.models import User, VerificationRecord, AuditLog

def seed_data():
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        seed_users = [
            ("admin@medverify.dev", os.environ.get("MEDVERIFY_SEED_ADMIN_PASSWORD"), "admin"),
            ("verifier@medverify.dev", os.environ.get("MEDVERIFY_SEED_VERIFIER_PASSWORD"), "verifier"),
            ("viewer@medverify.dev", os.environ.get("MEDVERIFY_SEED_VIEWER_PASSWORD"), "viewer"),
        ]
        if not any(password for _, password, _ in seed_users):
            raise RuntimeError(
                "Set MEDVERIFY_SEED_ADMIN_PASSWORD, MEDVERIFY_SEED_VERIFIER_PASSWORD, "
                "or MEDVERIFY_SEED_VIEWER_PASSWORD before seeding users."
            )

        for email, password, role in seed_users:
            if password and not User.query.filter_by(email=email).first():
                db.session.add(User(
                    email=email,
                    password_hash=bcrypt.generate_password_hash(password).decode('utf-8'),
                    role=role,
                ))
        
        db.session.commit()

        verifier_mv = User.query.filter_by(email='verifier@medverify.dev').first()
        if not verifier_mv:
            raise RuntimeError("A verifier user is required for sample verification records.")
        
        # Clear existing verification records and audit logs to prevent duplicates
        VerificationRecord.query.delete()
        AuditLog.query.delete()
        db.session.commit()
        
        # Create Verification Records
        statuses = ['GENUINE', 'SUSPICIOUS', 'FAKE', 'GENUINE', 'FAKE']
        for i, status in enumerate(statuses):
            record = VerificationRecord(
                filename=f'sample_{i}.jpg',
                original_filename=f'original_{i}.jpg',
                extracted_text=f'Sample extracted text for record {i}',
                status=status,
                confidence=0.95 if status == 'GENUINE' else 0.45,
                reasons=['Reason A', 'Reason B'] if status != 'GENUINE' else [],
                extracted_fields={'doctor': 'Dr. Test', 'hospital': 'Test Hospital'},
                user_id=verifier_mv.id
            )
            db.session.add(record)
            db.session.flush() # Get the ID
            
            # Add Audit Log
            audit = AuditLog(
                user_id=verifier_mv.id,
                action='VERIFY',
                resource_type='VerificationRecord',
                resource_id=record.id,
                ip_address='127.0.0.1',
                details={'status': status}
            )
            db.session.add(audit)
            
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()
