"""
Text Analyzer
Extracts structured fields from OCR text and checks for inconsistencies
that may indicate a fake or tampered medical certificate.
"""
import re
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Load spaCy model lazily so import doesn't crash if not installed
_nlp = None
_SPACY_AVAILABLE: Optional[bool] = None


def _get_nlp():
    global _nlp, _SPACY_AVAILABLE
    if _SPACY_AVAILABLE is None:
        try:
            import spacy  # noqa: PLC0415
            _nlp = spacy.load("en_core_web_sm")
            _SPACY_AVAILABLE = True
        except (OSError, ImportError):
            logger.warning(
                "spaCy model 'en_core_web_sm' not available. "
                "Hospital/doctor NER will be skipped."
            )
            _SPACY_AVAILABLE = False
    return _nlp


class TextAnalyzer:
    # Regex patterns
    DATE_PATTERN = re.compile(
        r"\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|"
        r"\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b",
        re.IGNORECASE,
    )
    REG_NUMBER_PATTERN = re.compile(
        r"\b(?:Reg(?:istration)?\.?\s*(?:No\.?|Number)?|MCI|State Medical Council)"
        r"[:\s]*([A-Z0-9\-\/]+)\b",
        re.IGNORECASE,
    )
    PHONE_PATTERN = re.compile(r"(?:\+91[\s\-]?)?[6-9]\d{9}")
    DIAGNOSIS_KEYWORDS = [
        "fever", "viral", "infection", "cold", "flu", "injury", "fracture",
        "surgery", "admitted", "treatment", "prescribed", "rest", "advised",
    ]

    # Minimum sensible length for a real certificate
    MIN_TEXT_LENGTH = 100

    def analyze(self, text: str) -> Dict[str, Any]:
        """Full text analysis pipeline. Returns a features dict."""
        if not text or len(text) < self.MIN_TEXT_LENGTH:
            logger.debug("Text too short (%d chars), returning low score.", len(text or ""))
            return {
                "extracted_fields": self._empty_fields(),
                "flags": ["Document text is unusually short"],
                "text_authenticity_score": 0.0,
                "raw_text_length": len(text or ""),
            }

        fields = self._extract_fields(text)
        flags = self._check_inconsistencies(text, fields)
        score = self._compute_text_score(flags)
        return {
            "extracted_fields": fields,
            "flags": flags,
            "text_authenticity_score": score,
            "raw_text_length": len(text),
        }

    # ------------------------------------------------------------------
    # Field extraction
    # ------------------------------------------------------------------

    def _extract_fields(self, text: str) -> Dict[str, Any]:
        dates = self.DATE_PATTERN.findall(text)
        reg_numbers = self.REG_NUMBER_PATTERN.findall(text)
        phones = self.PHONE_PATTERN.findall(text)
        diagnosis_found = [
            kw for kw in self.DIAGNOSIS_KEYWORDS if kw.lower() in text.lower()
        ]

        hospital_name: Optional[str] = None
        doctor_name: Optional[str] = None

        nlp = _get_nlp()
        if nlp:
            doc = nlp(text[:2000])
            for ent in doc.ents:
                if ent.label_ == "ORG" and hospital_name is None:
                    hospital_name = ent.text
                if ent.label_ == "PERSON" and doctor_name is None:
                    doctor_name = ent.text

        return {
            "dates": dates,
            "registration_numbers": reg_numbers,
            "phone_numbers": phones,
            "diagnosis_keywords": diagnosis_found,
            "hospital_name": hospital_name,
            "doctor_name": doctor_name,
        }

    @staticmethod
    def _empty_fields() -> Dict[str, Any]:
        return {
            "dates": [],
            "registration_numbers": [],
            "phone_numbers": [],
            "diagnosis_keywords": [],
            "hospital_name": None,
            "doctor_name": None,
        }

    # ------------------------------------------------------------------
    # Inconsistency checks
    # ------------------------------------------------------------------

    def _check_inconsistencies(self, text: str, fields: Dict) -> List[str]:
        flags: List[str] = []

        if not fields["dates"]:
            flags.append("No dates found in document")
        else:
            for date_str in fields["dates"]:
                parsed = self._parse_date(date_str)
                if parsed and parsed > datetime.now():
                    flags.append(f"Future date detected: {date_str}")

        if not fields["registration_numbers"]:
            flags.append("No doctor registration number found")

        if not fields["hospital_name"]:
            flags.append("No hospital or clinic name detected")

        # BUG FIX: original code had a broken ternary —
        #   `fields['raw_text_length'] < 100 if 'raw_text_length' not in fields else len(text) < 100`
        # which always evaluated to a bool, never a flag.
        if len(text) < self.MIN_TEXT_LENGTH:
            flags.append("Document text is unusually short")

        if not fields["diagnosis_keywords"]:
            flags.append("No medical diagnosis keywords found")

        unusual_chars = re.findall(r"[^\x20-\x7E\n]", text)
        if len(unusual_chars) > 20:
            flags.append(
                "High count of unusual characters — possible encoding issues or tampering"
            )

        return flags

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    _DEDUCTIONS: Dict[str, float] = {
        "No dates found in document": 0.15,
        "No doctor registration number found": 0.20,
        "No hospital or clinic name detected": 0.15,
        "No medical diagnosis keywords found": 0.10,
        "Document text is unusually short": 0.15,
        "High count of unusual characters": 0.10,
        "Future date detected": 0.20,
    }

    def _compute_text_score(self, flags: List[str]) -> float:
        score = 1.0
        for flag in flags:
            for key, deduction in self._DEDUCTIONS.items():
                if key in flag:
                    score -= deduction
                    break  # don't double-deduct on the same flag
        return max(0.0, round(score, 2))

    # ------------------------------------------------------------------
    # Date parsing
    # ------------------------------------------------------------------

    _DATE_FORMATS = [
        "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d",
        "%d-%m-%Y", "%d.%m.%Y",
        "%d %b %Y", "%d %B %Y",
    ]

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        for fmt in self._DATE_FORMATS:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        return None
