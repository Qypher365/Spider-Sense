"""
DataShield Backend — Field Classification
Keyword-based categorization (no ML) — determines what KIND of data
a field is asking for.
"""

from app.models import ScanField

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "password": ["password", "pwd", "passcode"],
    "government_id": [
        "ssn", "social_security", "aadhaar", "passport", "national_id",
        "driver_license", "driving_license", "tax_id", "pan_number",
        "government_id",
    ],
    "financial": [
        "credit_card", "creditcard", "card_number", "cvv", "cvc",
        "debit", "bank_account", "account_number", "routing_number",
        "iban", "swift", "payment",
    ],
    "biometric": ["fingerprint", "face_id", "faceid", "biometric", "retina"],
    "health": ["health", "medical", "diagnosis", "condition", "blood_type"],
    "security_question": ["security_question", "secret_question", "maiden_name"],
    "date_of_birth": ["dob", "birthdate", "birth_date", "date_of_birth", "birthday"],
    "email": ["email"],
    "phone": ["phone", "mobile", "tel"],
    "address": ["address", "street", "city", "zipcode", "zip_code", "postal", "country"],
    "name": ["fname", "lname", "firstname", "lastname", "fullname", "full_name", "name"],
    "username": ["username", "user_id", "userid"],
}


def _field_text(field: ScanField) -> str:
    parts = [
        field.name or "",
        field.type or "",
        field.autocomplete or "",
        field.label or "",
        field.placeholder or "",
    ]
    return " ".join(parts).lower()


def classify_field(field: ScanField) -> str:
    """Returns a category string, e.g. 'email', 'government_id'. Defaults to 'other'."""
    if field.type.lower() == "password":
        return "password"

    text = _field_text(field)
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return category

    return "other"