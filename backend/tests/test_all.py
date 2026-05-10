"""
Unit & Integration Tests
Run with: pytest tests/ -v
"""
import json
import sys
import os

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.text_analyzer import TextAnalyzer
from utils.image_analyzer import ImageAnalyzer
from ml.classifier import CertificateClassifier
from database.db_handler import DBHandler


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

GENUINE_TEXT = """
Dr. Priya Sharma
MBBS, MD – General Medicine
Reg. No.: MCI-12345-A
City General Hospital, Bangalore

This is to certify that Mr. Arjun Kumar, aged 22 years, was under medical treatment
from 10/03/2024 to 15/03/2024 for viral fever and upper respiratory infection.
He is advised rest for 5 days. He may resume duties from 16/03/2024.

Date: 15 March 2024
Phone: 9876543210
"""

SPARSE_TEXT = "rest"


@pytest.fixture()
def analyzer():
    return TextAnalyzer()


@pytest.fixture()
def classifier():
    return CertificateClassifier()  # rule-based fallback — no pkl needed


@pytest.fixture()
def db(tmp_path):
    """In-memory-equivalent: ephemeral file DB per test."""
    return DBHandler(str(tmp_path / "test.db"))


# ---------------------------------------------------------------------------
# TextAnalyzer
# ---------------------------------------------------------------------------


class TestTextAnalyzer:
    def test_genuine_text_high_score(self, analyzer):
        result = analyzer.analyze(GENUINE_TEXT)
        assert result["text_authenticity_score"] >= 0.5

    def test_sparse_text_returns_zero_score(self, analyzer):
        result = analyzer.analyze(SPARSE_TEXT)
        assert result["text_authenticity_score"] == 0.0

    def test_sparse_text_flagged_as_short(self, analyzer):
        result = analyzer.analyze(SPARSE_TEXT)
        assert any("short" in f.lower() for f in result["flags"])

    def test_dates_extracted(self, analyzer):
        result = analyzer.analyze(GENUINE_TEXT)
        assert len(result["extracted_fields"]["dates"]) > 0

    def test_registration_extracted(self, analyzer):
        result = analyzer.analyze(GENUINE_TEXT)
        assert len(result["extracted_fields"]["registration_numbers"]) > 0

    def test_no_dates_flagged(self, analyzer):
        long_text = "Some hospital text without any date or doctor info. " * 5
        result = analyzer.analyze(long_text)
        assert any("date" in f.lower() for f in result["flags"])

    def test_future_date_flagged(self, analyzer):
        text = (
            "Date of visit: 01/01/2099\n"
            "Dr. Smith, Reg: MCI-999\n"
            "Patient was treated for viral fever. Advised rest.\n" * 4
        )
        result = analyzer.analyze(text)
        assert any("future" in f.lower() for f in result["flags"])

    def test_raw_text_length_populated(self, analyzer):
        result = analyzer.analyze(GENUINE_TEXT)
        assert result["raw_text_length"] == len(GENUINE_TEXT)


# ---------------------------------------------------------------------------
# Classifier
# ---------------------------------------------------------------------------


class TestClassifier:
    def test_genuine_prediction(self, classifier):
        tf = {"text_authenticity_score": 0.9, "flags": [], "extracted_fields": {}}
        imf = {"image_authenticity_score": 0.9, "flags": []}
        result = classifier.predict(tf, imf)
        assert result["status"] == "GENUINE"

    def test_fake_prediction(self, classifier):
        tf = {
            "text_authenticity_score": 0.1,
            "flags": ["No dates", "No registration"],
            "extracted_fields": {},
        }
        imf = {"image_authenticity_score": 0.1, "flags": ["ELA tampering detected"]}
        result = classifier.predict(tf, imf)
        assert result["status"] in ("FAKE", "SUSPICIOUS")

    def test_suspicious_prediction(self, classifier):
        tf = {
            "text_authenticity_score": 0.5,
            "flags": ["No registration number"],
            "extracted_fields": {},
        }
        imf = {"image_authenticity_score": 0.5, "flags": []}
        result = classifier.predict(tf, imf)
        assert result["status"] == "SUSPICIOUS"

    def test_reasons_returned(self, classifier):
        tf = {"text_authenticity_score": 0.3, "flags": ["Missing date"], "extracted_fields": {}}
        imf = {"image_authenticity_score": 0.3, "flags": ["Font inconsistency"]}
        result = classifier.predict(tf, imf)
        assert len(result["reasons"]) > 0

    def test_confidence_in_range(self, classifier):
        tf = {"text_authenticity_score": 0.7, "flags": [], "extracted_fields": {}}
        imf = {"image_authenticity_score": 0.8, "flags": []}
        result = classifier.predict(tf, imf)
        assert 0.0 <= result["confidence"] <= 1.0

    def test_fallback_message_when_no_flags(self, classifier):
        tf = {"text_authenticity_score": 1.0, "flags": [], "extracted_fields": {}}
        imf = {"image_authenticity_score": 1.0, "flags": []}
        result = classifier.predict(tf, imf)
        assert result["reasons"] == ["No significant issues detected"]


# ---------------------------------------------------------------------------
# DBHandler
# ---------------------------------------------------------------------------


class TestDBHandler:
    def test_save_and_retrieve(self, db):
        result = {
            "status": "GENUINE",
            "confidence": 0.9,
            "reasons": ["All good"],
            "extracted_info": {"dates": ["01/03/2024"]},
        }
        record_id = db.save_result("test.jpg", "Sample OCR text", result)
        assert record_id is not None

        record = db.get_record(record_id)
        assert record is not None
        assert record["status"] == "GENUINE"
        assert record["confidence"] == 0.9
        assert record["reasons"] == ["All good"]

    def test_get_all_records(self, db):
        result = {"status": "FAKE", "confidence": 0.2, "reasons": [], "extracted_info": {}}
        db.save_result("a.jpg", "", result)
        db.save_result("b.jpg", "", result)
        records = db.get_all_records()
        assert len(records) >= 2

    def test_missing_record_returns_none(self, db):
        assert db.get_record(9999) is None

    def test_reasons_deserialized_as_list(self, db):
        result = {
            "status": "SUSPICIOUS",
            "confidence": 0.5,
            "reasons": ["Flag A", "Flag B"],
            "extracted_info": {},
        }
        rid = db.save_result("x.pdf", "text", result)
        record = db.get_record(rid)
        assert isinstance(record["reasons"], list)
        assert "Flag A" in record["reasons"]
