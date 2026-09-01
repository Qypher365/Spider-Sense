"""
DataShield Backend — Main Application Entry Point
Wires /api/scan to classification, sensitivity, rules, and scoring.
All business logic lives in dedicated modules.
"""

import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.classifier import classify_field
from app.models import (
    LABEL_SOURCE_TO_CONFIDENCE,
    FieldResult,
    ScanRequest,
    ScanResponse,
)
from app.rules import is_reasonable
from app.scorer import score_scan
from app.sensitivity import get_sensitivity

app = FastAPI(
    title="DataShield API",
    description="Privacy risk scanning backend for the DataShield Chrome extension.",
    version="0.2.0",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    field_path = " -> ".join(str(loc) for loc in first_error.get("loc", []))
    message = first_error.get("msg", "Invalid request")
    return JSONResponse(
        status_code=422,
        content={"error": f"{field_path}: {message}" if field_path else message},
    )


@app.get("/")
async def root():
    return {"status": "ok", "service": "DataShield API"}


@app.post("/api/scan", response_model=ScanResponse)
async def scan(payload: ScanRequest):
    field_results = []
    sensitivities = []
    reasonables = []

    for field in payload.fields:
        category = classify_field(field)
        sensitivity = get_sensitivity(category)
        reasonable, note = is_reasonable(category, sensitivity, payload)

        field_results.append(
            FieldResult(
                field_id=field.field_id,
                sensitivity=sensitivity,
                reasonable=reasonable,
                label_confidence=LABEL_SOURCE_TO_CONFIDENCE[field.label_source],
                notes=note,
            )
        )
        sensitivities.append(sensitivity)
        reasonables.append(reasonable)

    overall_score, risk_level = score_scan(
        sensitivities,
        reasonables,
    )

    return ScanResponse(
        scan_id=str(uuid.uuid4())[:8],
        overall_score=overall_score,
        risk_level=risk_level,
        field_results=field_results,
    )