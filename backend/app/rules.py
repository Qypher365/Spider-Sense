"""
DataShield Backend — Context-Aware Privacy Rules

Uses Context Final.csv to determine whether a requested field
is expected or potentially unnecessary for a given website context.
"""

from pathlib import Path
import csv

from app.models import ScanRequest


# ------------------------------------------------------------
# DATASET LOCATION
# ------------------------------------------------------------

DATASET_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "Context Final.csv"
)


# ------------------------------------------------------------
# LOAD DATASET
# ------------------------------------------------------------

CONTEXT_RULES: dict[str, dict[str, str]] = {}


def load_context_rules() -> None:
    """Load website/field rules from Context Final.csv."""

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Context dataset not found: {DATASET_PATH}"
        )

    with open(DATASET_PATH, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            website = row["Website"].strip()
            field = row["Field"].strip()
            status = row["Status"].strip()

            CONTEXT_RULES.setdefault(website, {})
            CONTEXT_RULES[website][field] = status


load_context_rules()


# ------------------------------------------------------------
# FIELD NORMALIZATION
# ------------------------------------------------------------

FIELD_ALIASES = {
    "full_name": "Full_name",
    "name": "Full_name",
    "first_name": "Full_name",
    "last_name": "Full_name",

    "email": "Email_address",
    "email_address": "Email_address",

    "phone": "Phone_number",
    "phone_number": "Phone_number",
    "mobile": "Phone_number",

    "dob": "DOB",
    "date_of_birth": "DOB",
    "birthdate": "DOB",

    "address": "Home_address",
    "home_address": "Home_address",

    "government_id": "Government_id_number",
    "government_id_number": "Government_id_number",
    "passport_number": "Government_id_number",
    "aadhaar": "Government_id_number",
    "aadhaar_number": "Government_id_number",
    "pan": "Government_id_number",
    "pan_number": "Government_id_number",

    "bank_account": "Bank_details",
    "bank_account_number": "Bank_details",
    "bank_details": "Bank_details",

    "credit_card": "Bank_details",
    "card_number": "Bank_details",
}


def normalize_field_name(field_name: str) -> str:
    """
    Convert an incoming field name into the terminology
    used by Context Final.csv.
    """

    normalized = field_name.strip().lower()

    return FIELD_ALIASES.get(
        normalized,
        field_name.strip()
    )


# ------------------------------------------------------------
# WEBSITE CONTEXT DETECTION
# ------------------------------------------------------------

def detect_website_context(request: ScanRequest) -> str | None:
    """
    Identify the dataset context from the page URL/title.

    Returns the matching dataset Website name or None.
    """

    context_text = (
        f"{request.url} {request.page_title}"
    ).lower()

    # Explicit context keywords.
    context_keywords = {
        "Resume_Builder": [
            "resume",
            "cv builder",
            "cv",
        ],
        "Job_Application": [
            "job application",
            "job",
            "career",
            "careers",
            "employment",
            "apply for job",
        ],
        "Newsletter_Signup": [
            "newsletter",
            "subscribe to newsletter",
        ],
        "Account_Signup": [
            "create account",
            "sign up",
            "signup",
            "register",
            "registration",
        ],
        "Login": [
            "login",
            "log in",
            "signin",
            "sign in",
        ],
        "Ecommerce_Checkout": [
            "checkout",
            "shopping cart",
            "cart",
            "place order",
        ],
        "Survey_Feedback": [
            "survey",
            "feedback",
        ],
        "Healthcare_Intake": [
            "healthcare",
            "health",
            "medical",
            "clinic",
            "patient intake",
        ],
        "Financial_Services": [
            "bank",
            "banking",
            "financial",
            "finance",
            "loan",
            "investment",
        ],
        "Government_Sites": [
            "government",
            ".gov",
            "government services",
        ],
        "Real_Estate_Rental_Application": [
            "rental application",
            "rent application",
            "real estate",
            "property rental",
            "apartment rental",
        ],
        "Travel_Booking": [
            "flight",
            "hotel booking",
            "travel booking",
            "travel",
            "booking",
        ],
        "Insurance_Application": [
            "insurance",
            "insurance application",
        ],
        "Event_Ticketing": [
            "event ticket",
            "ticket booking",
            "concert",
            "event registration",
        ],
        "Subscription_Free_Trial": [
            "free trial",
            "subscription",
            "start trial",
        ],
        "Dating_App_Signup": [
            "dating",
            "dating app",
        ],
        "Password_Reset": [
            "password reset",
            "reset password",
            "forgot password",
        ],
        "Crypto_Exchange_KYC": [
            "crypto",
            "cryptocurrency",
            "exchange kyc",
            "kyc",
        ],
    }

    # Check more specific contexts first.
    matches = []

    for website, keywords in context_keywords.items():
        for keyword in keywords:
            if keyword in context_text:
                matches.append((website, len(keyword)))

    if not matches:
        return None

    # Prefer the longest matching keyword.
    matches.sort(key=lambda item: item[1], reverse=True)

    return matches[0][0]


# ------------------------------------------------------------
# REASONABLENESS
# ------------------------------------------------------------

def is_reasonable(
    category: str,
    sensitivity: str,
    request: ScanRequest,
) -> tuple[bool, str]:

    website_context = detect_website_context(request)

    normalized_field = normalize_field_name(category)

    # --------------------------------------------------------
    # Dataset-based decision
    # --------------------------------------------------------

    if website_context:
        website_rules = CONTEXT_RULES.get(
            website_context,
            {}
        )

        status = website_rules.get(normalized_field)

        if status == "Can_ask":
            return (
                True,
                f"{normalized_field} is appropriate for "
                f"{website_context.replace('_', ' ')}."
            )

        if status == "Flagged":
            return (
                False,
                f"{normalized_field} is flagged as unnecessary "
                f"for {website_context.replace('_', ' ')}."
            )

    # --------------------------------------------------------
    # Safety fallback for sensitive data
    # --------------------------------------------------------

    if sensitivity in ("critical", "high"):
        return (
            False,
            f"{normalized_field} is sensitive and the page "
            "context does not clearly justify requesting it."
        )

    # --------------------------------------------------------
    # Default for low/medium data
    # --------------------------------------------------------

    return (
        True,
        "Standard field for this type of form."
    )