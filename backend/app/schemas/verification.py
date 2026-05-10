from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class VerificationRequest(BaseModel):
    # For file uploads we usually use multipart, but for batch/json we use this
    filename: str
    metadata: Optional[Dict[str, Any]] = None

class VerificationResult(BaseModel):
    record_id: int
    status: str
    confidence_score: float
    reasons: List[str]
    model_version: str
    decision_logic: Dict[str, Any]
    extracted_info: Dict[str, Any]
    warnings: Optional[List[str]] = None

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[VerificationResult] = None
    error: Optional[str] = None
    code: Optional[str] = None
    retryable: Optional[bool] = None
