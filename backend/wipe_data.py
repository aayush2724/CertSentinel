import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app
from app.database import db
from app.models import VerificationRecord, AuditLog

def wipe():
    app = create_app()
    with app.app_context():
        # 1. Clear database tables
        num_records = VerificationRecord.query.delete()
        num_audits = AuditLog.query.delete()
        db.session.commit()
        print(f"Cleared {num_records} verification records from database.")
        print(f"Cleared {num_audits} audit logs from database.")
        
        # 2. Clear physical files in UPLOAD_FOLDER
        upload_dir = app.config['UPLOAD_FOLDER']
        files_deleted = 0
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename == '.gitkeep':
                    continue
                file_path = os.path.join(upload_dir, filename)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                        files_deleted += 1
                except Exception as e:
                    print(f"Failed to delete file {file_path}: {e}")
        print(f"Deleted {files_deleted} physical upload/placeholder files from disk.")

if __name__ == '__main__':
    wipe()
