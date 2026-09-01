"""
DataShield Backend — Contextual Reasonableness Rules

Uses the context CSV first.
Falls back to deterministic keyword rules when
the CSV has no matching context.
"""

from pathlib import Path
import re

import pandas as pd

from app.models import ScanRequest


# ============================================================
# LOAD CONTEXT DATASET
# ============================================================

DATA_FILE = (
    Path(__file__).resolve().parent.parent.parent
    / "data"
    / "Context-Final.csv"
)

try:
    CONTEXT_DATA = pd.read_csv(DATA_FILE)

    CONTEXT_DATA["Website"] = (
        CONTEXT_DATA["Website"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    CONTEXT_DATA["Field"] = (
        CONTEXT_DATA["Field"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    CONTEXT_DATA["Status"] = (
        CONTEXT_DATA["Status"]
        .astype(str)
        .str.strip()
    )

except Exception:
    CONTEXT_DATA = pd.DataFrame(
        columns=["Website", "Field", "Status"]
    )


# ============================================================
# FALLBACK CONTEXT KEYWORDS
# ============================================================

CONTEXT_KEYWORDS = {
    "financial": [
        "checkout", "payment", "billing", "cart",
        "subscribe", "donate", "pay", "purchase", "order",
    ],

    "government_id": [
        "kyc", "verify", "identity", "tax",
        "passport", "apply", "onboarding",
    ],

    "health": [
        "health", "medical", "clinic",
        "patient", "insurance",
    ],

    "biometric": [
        "verify", "security", "auth",
        "login", "signin", "sign in",
    ],

    "password": [
        "signup", "sign up", "register",
        "registration", "login", "log in",
        "signin", "sign in", "account",
        "create account", "authentication",
    ],

    "security_question": [
        "signup", "sign up", "register",
        "recovery", "reset", "security",
    ],
}


# ============================================================
# WEBSITE CONTEXTS
# ============================================================

WEBSITE_ALIASES = {
    "resume_builder": [
        "resume", "cv", "curriculum",
    ],

    "job_application": [
        "job", "career", "employment",
        "application", "recruitment", "hiring",
    ],

    "newsletter_signup": [
        "newsletter", "mailing list",
    ],

    "account_signup": [
        "signup", "sign up", "register",
        "registration", "create account", "join",
    ],

    "login": [
        "login", "log in", "signin",
        "sign in", "authentication",
    ],

    "ecommerce_checkout": [
        "checkout", "cart", "purchase",
        "order", "shop", "store", "ecommerce",
    ],

    "survey_feedback": [
        "survey", "feedback",
        "questionnaire", "review",
    ],

    "healthcare_intake": [
        "health", "medical", "clinic",
        "patient", "healthcare", "hospital",
    ],

    "financial_services": [
        "bank", "banking", "loan", "finance",
        "financial", "investment", "broker", "credit",
    ],

    "government_sites": [
        "government", ".gov", "tax", "official",
    ],

    "real_estate_rental_application": [
        "real estate", "rental", "rent",
        "property", "apartment", "housing", "lease",
    ],

    "travel_booking": [
        "travel", "flight", "hotel",
        "booking", "reservation", "airline", "vacation",
    ],

    "insurance_application": [
        "insurance", "policy", "claim",
    ],

    "event_ticketing": [
        "ticket", "event", "concert", "festival",
    ],

    "subscription_free_trial": [
        "free trial", "trial",
        "subscription", "subscribe",
    ],

    "dating_app_signup": [
        "dating", "match", "matches",
    ],

    "password_reset": [
        "password reset", "reset password",
        "forgot password", "account recovery",
        "recover account",
    ],

    "crypto_exchange_kyc": [
        "crypto", "cryptocurrency",
        "exchange", "kyc", "wallet",
    ],
}


# ============================================================
# FIELD ALIASES
# ============================================================

FIELD_ALIASES = {
    "name": [
        "name",
        "full_name",
        "fullname",
        "first_name",
        "last_name",
        "display_name",
    ],

    "email": [
        "email",
        "email_address",
    ],

    "phone": [
        "phone",
        "phone_number",
        "mobile",
        "mobile_number",
        "telephone",
        "tel",
    ],

    "password": [
        "password",
        "passcode",
    ],

    "username": [
        "username",
        "email_username",
        "user_id",
    ],

    "date_of_birth": [
        "dob",
        "date_of_birth",
        "birthdate",
        "birthday",
    ],

    "address": [
        "address",
        "home_address",
        "billing_address",
        "shipping_address",
    ],

    "government_id": [
        "government_id",
        "government_id_number",
        "passport",
        "passport_number",
        "national_id",
        "ssn",
        "social_security",
        "tax_id",
        "pan_number",
        "driver_license",
        "driving_license",
    ],

    "financial": [
        "financial_card_details",
        "payment_card_details",
        "credit_card",
        "card_number",
        "bank_details",
        "financial_details",
        "payment",
    ],

    "health": [
        "health_information",
        "health_medical_history",
        "medical_history",
        "health",
    ],
}


# ============================================================
# NORMALIZATION
# ============================================================

def _normalize(text: str) -> str:
    text = str(text or "").lower()

    text = text.replace("-", "_")

    text = re.sub(
        r"[^a-z0-9_ ]+",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# DETECT WEBSITE CONTEXT
# ============================================================

def _detect_website_context(
    request: ScanRequest,
) -> str | None:

    text = _normalize(
        f"{request.url} {request.page_title}"
    )

    # Specific contexts first.
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

            if _normalize(keyword) in text:
                return context

    return None


# ============================================================
# MATCH CSV FIELD TO BACKEND CATEGORY
# ============================================================

def _field_matches_category(
    csv_field: str,
    category: str,
) -> bool:

    field = _normalize(csv_field)

    aliases = FIELD_ALIASES.get(
        category,
        [],
    )

    for alias in aliases:

        alias = _normalize(alias)

        if field == alias:
            return True

    return False


# ============================================================
# CSV LOOKUP
# ============================================================

def _csv_reasonableness(
    category: str,
    website_context: str | None,
) -> tuple[bool, str] | None:

    if website_context is None:
        return None

    if CONTEXT_DATA.empty:
        return None

    website = _normalize(website_context)

    # Find the exact website context.
    website_rows = CONTEXT_DATA[
        CONTEXT_DATA["Website"].apply(
            lambda value: _normalize(value) == website
        )
    ]

    if website_rows.empty:
        return None

    # Find fields belonging to this backend category.
    matches = website_rows[
        website_rows["Field"].apply(
            lambda value: _field_matches_category(
                value,
                category,
            )
        )
    ]

    if matches.empty:
        return None

    # IMPORTANT:
    # Flagged takes priority over Can_ask.
    # This prevents a conflicting dataset entry
    # from accidentally making a risky request safe.

    flagged = matches[
        matches["Status"].str.lower() == "flagged"
    ]

    if not flagged.empty:

        return (
            False,
            f"Context dataset flags '{category}' "
            "as unnecessary for this type of form.",
        )

    can_ask = matches[
        matches["Status"].str.lower() == "can_ask"
    ]

    if not can_ask.empty:

        return (
            True,
            f"Context dataset supports requesting "
            f"'{category}' for this type of form.",
        )

    return None


# ============================================================
# MAIN REASONABLENESS DECISION
# ============================================================

def is_reasonable(
    category: str,
    sensitivity: str,
    request: ScanRequest,
) -> tuple[bool, str]:

    # --------------------------------------------------------
    # 1. LOW SENSITIVITY
    # --------------------------------------------------------

    if sensitivity == "low":

        return (
            True,
            "Standard field for this type of form.",
        )

    # --------------------------------------------------------
    # 2. CSV — PRIMARY SOURCE
    # --------------------------------------------------------

    website_context = _detect_website_context(
        request
    )

    csv_result = _csv_reasonableness(
        category,
        website_context,
    )

    if csv_result is not None:
        return csv_result

    # --------------------------------------------------------
    # 3. KEYWORD FALLBACK
    # --------------------------------------------------------

    context_text = _normalize(
        f"{request.url} {request.page_title}"
    )

    keywords = CONTEXT_KEYWORDS.get(
        category,
        [],
    )

    for keyword in keywords:

        if _normalize(keyword) in context_text:

            if category == "password":

                return (
                    True,
                    "Password is appropriate for "
                    "authentication on a login or "
                    "account-related page.",
                )

            return (
                True,
                f"'{category}' data appears justified "
                "by the page context.",
            )

    # --------------------------------------------------------
    # 4. MEDIUM-SENSITIVITY FALLBACK
    # --------------------------------------------------------

    if sensitivity == "medium":

        return (
            True,
            f"'{category}' data may be relevant, "
            "but its necessity depends on the "
            "specific purpose of the form.",
        )

    # --------------------------------------------------------
    # 5. HIGH / CRITICAL WITHOUT JUSTIFICATION
    # --------------------------------------------------------

    return (
        False,
        f"'{category}' data requested without "
        "clear contextual justification.",
    )