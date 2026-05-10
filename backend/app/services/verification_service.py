import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from flask import current_app
from ..repositories.verification_repository import VerificationRepository
from ..repositories.audit_repository import AuditRepository
from ..errors import ProcessingError, OCR_EMPTY_RESULT, MODEL_INFERENCE_FAILED
from ..models import VerificationRecord

# Mocking imports based on project structure — actual imports might need adjustment
from ml.classifier import CertificateClassifier
from preprocessing.document_processor import DocumentProcessor
from utils.ocr_engine import OCREngine
from utils.text_analyzer import TextAnalyzer
from utils.image_analyzer import ImageAnalyzer

class VerificationService:
    _executor = ThreadPoolExecutor(max_workers=4)

    def __init__(self, db_session, model_path, model_version):
        self.repo = VerificationRepository(db_session)
        self.audit = AuditRepository(db_session)
        self.classifier = CertificateClassifier.get_instance(model_path)
        self.model_version = model_version
        
        # Initialize engines once
        self.processor = DocumentProcessor()
        self.ocr = OCREngine()
        self.text_analyzer = TextAnalyzer()
        self.image_analyzer = ImageAnalyzer()

    def verify(self, filepath: str, original_filename: str, 
               user_id: str = None, ip_address: str = None) -> VerificationRecord:
        start_time = time.time()
        
        try:
            # 1. Run Pipeline
            results = self._run_pipeline(filepath)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # 2. Persist Result
            record_data = {
                "user_id": user_id,
                "filename": os.path.basename(filepath),
                "original_filename": original_filename,
                "extracted_text": results["extracted_text"],
                "status": results["classification"]["status"],
                "confidence": results["classification"]["confidence"],
                "reasons": results["classification"]["reasons"],
                "extracted_fields": results["analysis"]["text"].get("extracted_fields", {}),
                "text_score": results["analysis"]["text"].get("score", 0),
                "image_score": results["analysis"]["image"].get("score", 0),
                "ml_features": results["features"],
                "model_version": self.model_version,
                "processing_time_ms": processing_time_ms
            }
            
            record = self.repo.create(record_data)
            
            # 3. Audit Log
            self.audit.log(
                user_id=user_id,
                action='VERIFY',
                resource_type='VerificationRecord',
                resource_id=record.id,
                ip_address=ip_address,
                details={"status": record.status, "confidence": record.confidence}
            )
            
            return record

        except Exception as e:
            # Audit the failure too
            self.audit.log(
                user_id=user_id,
                action='VERIFY_FAILED',
                ip_address=ip_address,
                details={"error": str(e), "filename": original_filename}
            )
            if isinstance(e, ProcessingError):
                raise e
            raise ProcessingError("VERIFICATION_PIPELINE_FAILED", str(e))

    def _run_pipeline(self, filepath: str) -> dict:
        timings = {}
        
        # Step 1: Preprocess
        s1 = time.time()
        processed_img = self.processor.process(filepath)
        timings['preprocess'] = time.time() - s1
        
        # Step 2: OCR
        s2 = time.time()
        extracted_text = self.ocr.extract(processed_img)
        if not extracted_text or not extracted_text.strip():
            raise ProcessingError(OCR_EMPTY_RESULT, "No text could be extracted from the document")
        timings['ocr'] = time.time() - s2
        
        # Step 3: Parallel Analysis
        s3 = time.time()
        future_text = self._executor.submit(self.text_analyzer.analyze, extracted_text)
        future_image = self._executor.submit(self.image_analyzer.analyze, filepath)
        
        text_results = future_text.result()
        image_results = future_image.result()
        timings['analysis'] = time.time() - s3
        
        # Step 4: Classify
        s4 = time.time()
        # Combine features for classification
        features = {**text_results.get('features', {}), **image_results.get('features', {})}
        classification = self.classifier.classify(features)
        timings['classify'] = time.time() - s4
        
        return {
            "extracted_text": extracted_text,
            "analysis": {
                "text": text_results,
                "image": image_results
            },
            "features": features,
            "classification": classification,
            "timings": timings
        }

    def get_record(self, record_id: str) -> VerificationRecord:
        record = self.repo.get_by_id(record_id)
        if not record:
            from ..errors import NotFoundError, RECORD_NOT_FOUND
            raise NotFoundError(RECORD_NOT_FOUND, f"Record {record_id} not found")
        return record

    def list_records(self, **filters) -> list:
        return self.repo.get_all(**filters)

    def get_dashboard_stats(self) -> dict:
        return self.repo.get_stats()
