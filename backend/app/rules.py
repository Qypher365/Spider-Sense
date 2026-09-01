"""
DataShield Backend — Contextual Reasonableness Rules

Uses:
1. Context-field CSV for evidence-based contextual decisions.
2. Existing keyword rules as fallback when the CSV has no matching example.
"""

from pathlib import Path
import re

import pandas as pd

from app.models import ScanRequest


# -------------------------------------------------------------------
# Load contextual dataset
# -------------------------------------------------------------------

DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "Context_Expanded_Fixed.csv"

try:
    CONTEXT_DATA = pd.read_csv(DATA_FILE)
    CONTEXT_DATA["Website"] = CONTEXT_DATA["Website"].astype(str).str.strip().str.lower()
    CONTEXT_DATA["Field"] = CONTEXT_DATA["Field"].astype(str).str.strip().str.lower()
    CONTEXT_DATA["Status"] = CONTEXT_DATA["Status"].astype(str).str.strip()
except Exception:
    CONTEXT_DATA = pd.DataFrame(columns=["Website", "Field", "Status"])


# -------------------------------------------------------------------
# Existing fallback rules
# -------------------------------------------------------------------

CONTEXT_KEYWORDS: dict[str, list[str]] = {
    "financial": [
        "checkout", "payment", "billing", "cart", "subscribe",
        "donate", "pay", "purchase", "order",
    ],
    "government_id": [
        "kyc", "verify", "identity", "tax", "passport",
        "apply", "onboarding",
    ],
    "health": [
        "health", "medical", "clinic", "patient", "insurance",
    ],
    "biometric": [
        "verify", "security", "auth", "login", "signin", "sign in",
    ],
    "password": [
        "signup", "sign up", "register", "registration",
        "login", "log in", "signin", "sign in", "account",
        "create account", "authentication",
    ],
    "security_question": [
        "signup", "sign up", "register", "recovery",
        "reset", "security",
    ],
}


# -------------------------------------------------------------------
# Website-context detection
# -------------------------------------------------------------------

WEBSITE_ALIASES = {
    "resume_builder": [
        "resume", "cv", "curriculum", "resume builder",
    ],
    "job_application": [
        "job", "career", "employment", "application",
        "recruitment", "hiring",
    ],
    "newsletter_signup": [
        "newsletter", "subscribe", "mailing list",
    ],
    "account_signup": [
        "signup", "sign up", "register", "registration",
        "create account", "join",
    ],
    "login": [
        "login", "log in", "signin", "sign in",
        "authentication",
    ],
    "ecommerce_checkout": [
        "checkout", "cart", "purchase", "order", "shop",
        "store", "ecommerce",
    ],
    "survey_feedback": [
        "survey", "feedback", "questionnaire", "review",
    ],
    "healthcare_intake": [
        "health", "medical", "clinic", "patient",
        "healthcare", "hospital",
    ],
    "financial_services": [
        "bank", "banking", "loan", "finance", "financial",
        "investment", "broker", "credit",
    ],
    "government_sites": [
        "government", ".gov", "tax", "official",
    ],
    "real_estate_rental_application": [
        "real estate", "rental", "rent", "property",
        "apartment", "housing", "lease",
    ],
    "travel_booking": [
        "travel", "flight", "hotel", "booking",
        "reservation", "airline", "vacation",
    ],
    "insurance_application": [
        "insurance", "policy", "claim",
    ],
    "event_ticketing": [
        "ticket", "event", "concert", "festival",
    ],
    "subscription_free_trial": [
        "free trial", "trial", "subscription", "subscribe",
    ],
    "dating_app_signup": [
        "dating", "match", "matches",
    ],
    "password_reset": [
        "password reset", "reset password", "forgot password",
        "account recovery", "recover account",
    ],
    "crypto_exchange_kyc": [
        "crypto", "cryptocurrency", "exchange", "kyc",
        "wallet",
    ],
}


def _normalize(text: str) -> str:
    """Normalize text for matching."""
    text = str(text or "").lower()
    text = text.replace("-", "_")
    text = re.sub(r"[^a-z0-9_ ]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _detect_website_context(request: ScanRequest) -> str | None:
    """
    Try to identify the website/form context from URL and page title.
    """
    context_text = _normalize(
        f"{request.url} {request.page_title}"
    )

    # More specific contexts first.
    ordered_contexts = [
        "crypto_exchange_kyc",
        "password_reset",
        "ecommerce_checkout",
        "healthcare_intake",
        "real_estate_rental_application",
        "financial_services",
        "insurance_application",
        "dating_app_signup",
        "subscription_free_trial",
        "newsletter_signup",
        "event_ticketing",
        "travel_booking",
        "government_sites",
        "job_application",
        "resume_builder",
        "survey_feedback",
        "account_signup",
        "login",
    ]

    for context in ordered_contexts:
        for keyword in WEBSITE_ALIASES[context]:
            if _normalize(keyword) in context_text:
                return context

    return None


# -------------------------------------------------------------------
# Field matching
# -------------------------------------------------------------------

FIELD_ALIASES = {
    "name": [
        "full_name", "fullname", "first_name", "last_name",
        "name", "display_name",
    ],
    "email": [
        "email", "email_address",
    ],
    "phone": [
        "phone", "phone_number", "mobile", "mobile_number",
        "telephone",
    ],
    "password": [
        "password", "passcode",
    ],
    "username": [
        "username", "email_username", "user_id",
    ],
    "date_of_birth": [
        "dob", "date_of_birth", "birthdate", "birthday",
    ],
    "address": [
        "address", "home_address", "billing_address",
        "shipping_address",
    ],
    "government_id": [
        "government_id_number", "government_id",
        "passport", "passport_number", "national_id",
        "ssn", "social_security", "tax_id", "pan_number",
        "driver_license",
    ],
    "financial": [
        "financial_card_details", "payment_card_details",
        "credit_card", "card_number", "bank_details",
        "financial_details", "payment",
    ],
    "health": [
        "health_information", "health_medical_history",
        "medical_history", "health",
    ],
}


def _field_matches_category(field_name: str, category: str) -> bool:
    """
    Determine whether a CSV field description corresponds
    to the backend's classified category.
    """
    field_name = _normalize(field_name)

    if field_name in FIELD_ALIASES.get(category, []):
        return True

    return any(
        alias in field_name
        for alias in FIELD_ALIASES.get(category, [])
    )


# -------------------------------------------------------------------
# CSV lookup
# -------------------------------------------------------------------

def _csv_reasonableness(
    category: str,
    website_context: str | None,
) -> tuple[bool, str] | None:

    if website_context is None or CONTEXT_DATA.empty:
        return None

    rows = CONTEXT_DATA[
        CONTEXT_DATA["Website"].apply(
            lambda value: _normalize(value) == website_context
        )
    ]

    if rows.empty:
        return None

    matching_rows = rows[
        rows["Field"].apply(
            lambda field: _field_matches_category(field, category)
        )
    ]

    if matching_rows.empty:
        return None

    # If any matching example is Flagged, treat the request as
    # unreasonable for this context.
    if (matching_rows["Status"] == "Flagged").any():
        return (
            False,
            f"Context dataset flags '{category}' as unnecessary "
            f"for this type of form.",
        )

    if (matching_rows["Status"] == "Can_ask").any():
        return (
            True,
            f"Context dataset supports requesting '{category}' "
            f"for this type of form.",
        )

    return None


# -------------------------------------------------------------------
# Main reasonableness function
# -------------------------------------------------------------------

def is_reasonable(
    category: str,
    sensitivity: str,
    request: ScanRequest,
) -> tuple[bool, str]:

    # Low-sensitivity information is normally reasonable.
    if sensitivity == "low":
        return True, "Standard field for this type of form."

    # First use the expanded contextual dataset.
    website_context = _detect_website_context(request)

    csv_result = _csv_reasonableness(
        category,
        website_context,
    )

    if csv_result is not None:
        return csv_result

    # Fall back to deterministic keyword rules.
    context_text = (
        f"{request.url} {request.page_title}"
    ).lower()

    keywords = CONTEXT_KEYWORDS.get(category, [])

    if any(keyword in context_text for keyword in keywords):
        if category == "password":
            return (
                True,
                "Password is appropriate for authentication on a "
                "login or account-related page.",
            )

        return (
            True,
            f"'{category}' data appears justified by the page context.",
        )

    # Medium-sensitivity fields are not automatically unreasonable.
    if sensitivity == "medium":
        return (
            True,
            f"'{category}' data may be relevant, but its necessity "
            f"depends on the specific purpose of the form.",
        )

    return (
        False,
        f"'{category}' data requested without clear contextual justification.",
    )