"""
DataShield Backend — Shared Pydantic Models
Locked request/response contract. No business logic here.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

LabelSource = Literal["label_for", "aria_label", "placeholder", "nearby_text", "none"]
LabelConfidence = Literal["high", "medium", "low", "unknown"]

LABEL_SOURCE_TO_CONFIDENCE: dict[LabelSource, LabelConfidence] = {
    "label_for": "high",
    "aria_label": "high",
    "placeholder": "medium",
    "nearby_text": "low",
    "none": "unknown",
}


class ScanField(BaseModel):
    field_id: str
    name: str
    label: Optional[str] = None
    label_source: LabelSource
    type: str
    placeholder: Optional[str] = None
    autocomplete: Optional[str] = None
    required: bool = False


class ScanRequest(BaseModel):
    url: str
    page_title: str
    scan_timestamp: datetime
    fields: List[ScanField] = Field(..., min_length=1)


class FieldResult(BaseModel):
    field_id: str
    sensitivity: str
    reasonable: bool
    label_confidence: LabelConfidence
    notes: str


class ScanResponse(BaseModel):
    scan_id: str
    overall_score: int
    risk_level: str
    field_results: List[FieldResult]


class ErrorResponse(BaseModel):
    error: str