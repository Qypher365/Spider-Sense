import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    version="0.3.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    first_error = exc.errors()[0]

    field_path = " -> ".join(
        str(loc) for loc in first_error.get("loc", [])
    )

    message = first_error.get("msg", "Invalid request")

    return JSONResponse(
        status_code=422,
        content={
            "error": (
                f"{field_path}: {message}"
                if field_path
                else message
            )
        },
    )


def adjust_sensitivity_for_confidence(
    sensitivity: str,
    confidence: str,
) -> str:
    """
    Prevent low/unknown label confidence from producing
    maximum-severity classifications with full certainty.

    High-confidence labels keep their normal sensitivity.
    """

    if confidence in ("high", "medium"):
        return sensitivity

    if confidence == "low":
        if sensitivity == "critical":
            return "high"
        if sensitivity == "high":
            return "medium"

    if confidence == "unknown":
        if sensitivity in ("critical", "high"):
            return "unknown"

    return sensitivity


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "DataShield API",
    }


@app.post("/api/scan", response_model=ScanResponse)
async def scan(payload: ScanRequest):
    field_results = []
    sensitivities = []
    reasonables = []

    for field in payload.fields:

        # Determine label confidence first.
        label_confidence = LABEL_SOURCE_TO_CONFIDENCE[
            field.label_source
        ]

        # Classify the field.
        category = classify_field(field)

        # Determine normal sensitivity.
        base_sensitivity = get_sensitivity(category)

        # Apply confidence-aware adjustment.
        sensitivity = adjust_sensitivity_for_confidence(
            base_sensitivity,
            label_confidence,
        )

        # Determine whether requesting the data is reasonable.
        reasonable, note = is_reasonable(
            category,
            sensitivity,
            payload,
        )

        # Add confidence information to notes when uncertain.
        if label_confidence == "low":
            note += (
                " Label confidence is low, so the sensitivity "
                "assessment was downgraded."
            )

        elif label_confidence == "unknown":
            note += (
                " Label confidence is unknown, so high-severity "
                "classification was not applied with full certainty."
            )

        field_results.append(
            FieldResult(
                field_id=field.field_id,
                sensitivity=sensitivity,
                reasonable=reasonable,
                label_confidence=label_confidence,
                notes=note,
            )
        )

        sensitivities.append(sensitivity)
        reasonables.append(reasonable)

    privacy_score, risk_level = score_scan(
        sensitivities,
        reasonables,
    )

    return ScanResponse(
        scan_id=str(uuid.uuid4())[:8],
        privacy_score=privacy_score,
        risk_level=risk_level,
        field_results=field_results,
    )