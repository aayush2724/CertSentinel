import os
import sys
import json

# Add project root to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from ml.classifier import CertificateClassifier

def validate():
    model_path = os.environ.get("MODEL_PATH", "ml/models/classifier.pkl")
    
    print(f"--- CertSentinel Model Validation ---")
    print(f"Model Path: {model_path}")
    
    if not os.path.exists(model_path):
        print("ERROR: Model file not found!")
        return

    classifier = CertificateClassifier.get_instance(model_path)
    print(f"Model Loaded: {'SUCCESS' if classifier.model else 'FAILED'}")
    print(f"Metadata: {json.dumps(classifier.metadata, indent=2)}")
    
    # Test Cases
    test_cases = [
        {
            "name": "Perfect Genuine",
            "features": {
                "text_authenticity_score": 0.95,
                "image_authenticity_score": 0.95,
                "has_dates": True,
                "has_registration_number": True,
                "has_hospital_name": True,
                "has_doctor_name": True,
                "diagnosis_count": 2,
                "ela_score": 0.05,
                "noise_inconsistency_score": 0.05,
                "copy_move_detected": False,
                "font_consistency_score": 0.95,
                "has_phone_number": True,
                "unusual_char_ratio": 0.01,
                "text_length": 1500,
                "ela_suspicious_regions": 0,
                "metadata_software_detected": False,
                "flags": []
            }
        },
        {
            "name": "Obvious Fake",
            "features": {
                "text_authenticity_score": 0.2,
                "image_authenticity_score": 0.1,
                "has_dates": False,
                "has_registration_number": False,
                "has_hospital_name": False,
                "has_doctor_name": False,
                "diagnosis_count": 0,
                "ela_score": 0.8,
                "noise_inconsistency_score": 0.9,
                "copy_move_detected": True,
                "font_consistency_score": 0.2,
                "has_phone_number": False,
                "unusual_char_ratio": 0.4,
                "text_length": 100,
                "ela_suspicious_regions": 15,
                "metadata_software_detected": True,
                "flags": ["Copy-move detected", "High ELA score", "Unusual characters"]
            }
        }
    ]
    
    print("\n--- Running Inference Tests ---")
    for case in test_cases:
        result = classifier.classify(case["features"])
        print(f"Test Case: {case['name']}")
        print(f"  Result Status: {result['status']}")
        print(f"  Confidence: {result['confidence']}")
        print(f"  Reasons: {result['reasons']}")
        print("-" * 20)

if __name__ == "__main__":
    validate()
