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
        # Create admin user (medverify.dev)
        admin_mv = User.query.filter_by(email='admin@medverify.dev').first()
        if not admin_mv:
            admin_mv = User(
                email='admin@medverify.dev',
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
                role='admin'
            )
            db.session.add(admin_mv)
        
        # Create verifier user (medverify.dev)
        verifier_mv = User.query.filter_by(email='verifier@medverify.dev').first()
        if not verifier_mv:
            verifier_mv = User(
                email='verifier@medverify.dev',
                password_hash=bcrypt.generate_password_hash('verifier123').decode('utf-8'),
                role='verifier'
            )
            db.session.add(verifier_mv)

        # Create viewer user (medverify.dev)
        viewer_mv = User.query.filter_by(email='viewer@medverify.dev').first()
        if not viewer_mv:
            viewer_mv = User(
                email='viewer@medverify.dev',
                password_hash=bcrypt.generate_password_hash('viewer123').decode('utf-8'),
                role='viewer'
            )
            db.session.add(viewer_mv)
        
        db.session.commit()
        
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
