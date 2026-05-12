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
        # Create admin user
        admin = User.query.filter_by(email='admin@certsentinel.dev').first()
        if not admin:
            admin = User(
                email='admin@certsentinel.dev',
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
                role='admin'
            )
            db.session.add(admin)
        
        # Create verifier user
        verifier = User.query.filter_by(email='verifier@certsentinel.dev').first()
        if not verifier:
            verifier = User(
                email='verifier@certsentinel.dev',
                password_hash=bcrypt.generate_password_hash('verifier123').decode('utf-8'),
                role='verifier'
            )
            db.session.add(verifier)
        
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
                user_id=verifier.id
            )
            db.session.add(record)
            db.session.flush() # Get the ID
            
            # Add Audit Log
            audit = AuditLog(
                user_id=verifier.id,
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
