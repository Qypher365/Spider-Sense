from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def base_field(
    field_id,
    name,
    label,
    label_source,
    field_type,
):
    return {
        "field_id": field_id,
        "name": name,
        "label": label,
        "label_source": label_source,
        "type": field_type,
        "placeholder": "",
        "autocomplete": "",
        "required": True,
    }


def test_normal_signup():
    response = client.post(
        "/api/scan",
        json={
            "url": "https://example.com/signup",
            "page_title": "Create Account",
            "scan_timestamp": "2026-09-02T01:30:00Z",
            "fields": [
                base_field(
                    "email|email|1",
                    "email",
                    "Email Address",
                    "label_for",
                    "email",
                ),
                base_field(
                    "password|password|2",
                    "password",
                    "Password",
                    "label_for",
                    "password",
                ),
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["risk_level"] in [
        "low",
        "medium",
        "high",
        "critical",
    ]

    assert len(data["field_results"]) == 2

    assert data["field_results"][0]["field_id"] == "email|email|1"
    assert data["field_results"][1]["field_id"] == "password|password|2"


def test_flagged_phone_from_csv():
    response = client.post(
        "/api/scan",
        json={
            "url": "https://example.com/signup",
            "page_title": "Create Account",
            "scan_timestamp": "2026-09-02T01:30:00Z",
            "fields": [
                base_field(
                    "phone|tel|1",
                    "phone",
                    "Phone Number",
                    "label_for",
                    "tel",
                )
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    result = data["field_results"][0]

    assert result["field_id"] == "phone|tel|1"
    assert result["sensitivity"] == "medium"
    assert result["reasonable"] is False
    assert result["label_confidence"] == "high"


def test_government_id_high_confidence():
    response = client.post(
        "/api/scan",
        json={
            "url": "https://example.com/signup",
            "page_title": "Create Account",
            "scan_timestamp": "2026-09-02T01:30:00Z",
            "fields": [
                base_field(
                    "government_id|text|1",
                    "government_id",
                    "Government ID Number",
                    "label_for",
                    "text",
                )
            ],
        },
    )

    assert response.status_code == 200

    result = response.json()["field_results"][0]

    assert result["sensitivity"] == "critical"
    assert result["label_confidence"] == "high"


def test_validation_error():
    response = client.post(
        "/api/scan",
        json={
            "url": "https://example.com/signup",
            "page_title": "Create Account",
            "fields": [],
        },
    )

    assert response.status_code == 422
    assert "error" in response.json()


def test_field_ids_are_preserved():
    field_id = "weird|custom|123"

    response = client.post(
        "/api/scan",
        json={
            "url": "https://example.com/signup",
            "page_title": "Create Account",
            "scan_timestamp": "2026-09-02T01:30:00Z",
            "fields": [
                base_field(
                    field_id,
                    "email",
                    "Email",
                    "label_for",
                    "email",
                )
            ],
        },
    )

    assert response.status_code == 200

    result = response.json()["field_results"][0]

    assert result["field_id"] == field_id