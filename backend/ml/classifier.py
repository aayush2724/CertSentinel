"""
Certificate Classifier
Combines text and image features to produce a final verdict.
Uses a singleton-like caching mechanism for model loading.
"""
import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class CertificateClassifier:
    # Class-level cache to prevent reloading the model on every request
    _model_cache = {}

    def __init__(self, model_path: Optional[str] = None, version: str = "1.0.0", 
                 thresholds: Optional[Dict[str, float]] = None):
        self.model_path = model_path
        self.version = version
        self.thresholds = thresholds or {"genuine": 0.75, "suspicious": 0.45}
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self._get_model(model_path)

    def _get_model(self, model_path: str) -> None:
        """Retrieve model from cache or load it if not present."""
        if model_path in CertificateClassifier._model_cache:
            self.model = CertificateClassifier._model_cache[model_path]
            return

        try:
            import joblib  # noqa: PLC0415
            self.model = joblib.load(model_path)
            CertificateClassifier._model_cache[model_path] = self.model
            logger.info("Loaded ML model from %s (joblib) into cache", model_path)
        except Exception as exc:
            logger.error("Failed to load model from %s: %s", model_path, exc)
            self.model = None

    def predict(
        self, text_features: Dict[str, Any], image_features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Combine features and return a prediction dict."""
        text_score = float(text_features.get("text_authenticity_score", 0.5))
        image_score = float(image_features.get("image_authenticity_score", 0.5))
        all_flags: List[str] = (
            text_features.get("flags", []) + image_features.get("flags", [])
        )

        confidence = 0.5
        if self.model is not None:
            try:
                feature_vector = self._build_feature_vector(text_features, image_features)
                proba = self.model.predict_proba([feature_vector])[0]
                confidence = float(proba[1])  # P(genuine)
            except Exception as exc:
                logger.warning("Model inference failed (%s) — using rule-based fallback.", exc)
                confidence = round(0.5 * text_score + 0.5 * image_score, 2)
        else:
            confidence = round(0.5 * text_score + 0.5 * image_score, 2)

        # Use configured thresholds
        if confidence >= self.thresholds["genuine"]:
            status = "GENUINE"
        elif confidence >= self.thresholds["suspicious"]:
            status = "SUSPICIOUS"
        else:
            status = "FAKE"

        return {
            "status": status,
            "confidence": confidence,
            "reasons": all_flags if all_flags else ["No significant issues detected"],
            "model_version": self.version,
            "decision_logic": {
                "text_score": text_score,
                "image_score": image_score,
                "flags_count": len(all_flags),
                "thresholds": self.thresholds
            }
        }

    @staticmethod
    def _build_feature_vector(
        text_features: Dict, image_features: Dict
    ) -> List[float]:
        fields = text_features.get("extracted_fields", {})
        return [
            text_features.get("text_authenticity_score", 0.0),
            image_features.get("image_authenticity_score", 0.0),
            1.0 if fields.get("dates") else 0.0,
            1.0 if fields.get("registration_numbers") else 0.0,
            1.0 if fields.get("hospital_name") else 0.0,
            1.0 if fields.get("doctor_name") else 0.0,
            float(len(fields.get("diagnosis_keywords", []))),
            float(image_features.get("ela_score", 0.0)),
            float(image_features.get("noise_inconsistency_score", 0.0)),
            1.0 if image_features.get("copy_move_detected") else 0.0,
            float(image_features.get("font_consistency_score", 1.0)),
        ]
