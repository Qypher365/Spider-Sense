"""
DataShield Backend — Sensitivity Assignment
Maps a classified category to a sensitivity level.
"""

CATEGORY_TO_SENSITIVITY: dict[str, str] = {
    "name": "low",
    "username": "low",
    "email": "low",
    "phone": "medium",
    "date_of_birth": "medium",
    "address": "medium",
    "password": "high",
    "security_question": "high",
    "government_id": "critical",
    "financial": "critical",
    "biometric": "critical",
    "health": "critical",
    "other": "unknown",
}


def get_sensitivity(category: str) -> str:
    return CATEGORY_TO_SENSITIVITY.get(category, "unknown")