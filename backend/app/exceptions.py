"""
Custom Exceptions for CertSentinel
Used for structured error handling and distinct HTTP responses.
"""

class CertSentinelError(Exception):
    """Base exception for all project errors."""
    code = "INTERNAL_ERROR"
    retryable = False

    def __init__(self, message, code=None, retryable=None):
        super().__init__(message)
        if code: self.code = code
        if retryable is not None: self.retryable = retryable

class PreprocessingError(CertSentinelError):
    """Errors during image/document preprocessing."""
    code = "PREPROCESSING_FAILED"
    retryable = True

class OCRError(CertSentinelError):
    """Errors during text extraction."""
    code = "OCR_FAILED"
    retryable = True

class AnalysisError(CertSentinelError):
    """Errors during text or image analysis."""
    code = "ANALYSIS_FAILED"
    retryable = True

class ModelError(CertSentinelError):
    """Errors related to ML model loading or inference."""
    code = "MODEL_ERROR"
    retryable = False

class DatabaseError(CertSentinelError):
    """Errors during record persistence."""
    code = "DATABASE_ERROR"
    retryable = True
