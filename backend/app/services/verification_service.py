import logging
from preprocessing.document_processor import DocumentProcessor
from ml.classifier import CertificateClassifier
from .ocr_service import OCRService
from .analysis_service import AnalysisService
from .audit_service import AuditService
from app.exceptions import PreprocessingError

logger = logging.getLogger(__name__)

class VerificationService:
    def __init__(self, db, model_path, config):
        self.db = db
        self.model_path = model_path
        self.config = config
        self.ocr_service = OCRService()
        self.analysis_service = AnalysisService()
        self.audit_service = AuditService(db)

    def verify(self, filepath: str, filename: str):
        """Main orchestration pipeline."""
        
        # 1. Preprocess
        processor = DocumentProcessor()
        try:
            processed_image = processor.preprocess(filepath)
        except Exception as exc:
            raise PreprocessingError(f"Preprocessing failed: {exc}")

        # 2. OCR
        extracted_text = self.ocr_service.extract(processed_image)

        # 3. Analyze
        text_feats, img_feats, warnings = self.analysis_service.analyze(filepath, extracted_text)

        # 4. Classify
        classifier = CertificateClassifier(
            model_path=self.model_path,
            version=self.config.get("MODEL_VERSION", "1.0.0"),
            thresholds={
                "genuine": self.config.get("CONFIDENCE_THRESHOLD_GENUINE", 0.80),
                "suspicious": self.config.get("CONFIDENCE_THRESHOLD_SUSPICIOUS", 0.50)
            }
        )
        result = classifier.predict(text_feats, img_feats)

        # 5. Audit
        record_id = self.audit_service.log_verification(filename, extracted_text, result)

        return {
            "record_id": record_id,
            "status": result["status"],
            "confidence_score": result["confidence"],
            "reasons": result["reasons"],
            "model_version": result["model_version"],
            "decision_logic": result["decision_logic"],
            "extracted_info": text_feats.get("extracted_fields", {}),
            "warnings": warnings or None,
        }
