"""
DataShield Backend — Overall Privacy-Risk Scoring
Worst-case field dominates the score (70%), average nudges it (30%) —
so one critical field is enough to flag the whole scan as critical.
"""

SENSITIVITY_WEIGHT: dict[str, int] = {
    "low": 10,
    "medium": 40,
    "high": 70,
    "critical": 100,
    "unknown": 30,
}

RISK_THRESHOLDS: list[tuple[int, str]] = [
    (85, "critical"),
    (55, "high"),
    (30, "medium"),
    (0, "low"),
]


def score_scan(sensitivities: list[str]) -> tuple[int, str]:
    if not sensitivities:
        return 0, "low"

    weights = [SENSITIVITY_WEIGHT.get(s, SENSITIVITY_WEIGHT["unknown"]) for s in sensitivities]
    max_weight = max(weights)
    avg_weight = sum(weights) / len(weights)

    overall_score = round(0.7 * max_weight + 0.3 * avg_weight)
    overall_score = max(0, min(100, overall_score))

    risk_level = "low"
    for threshold, level in RISK_THRESHOLDS:
        if overall_score >= threshold:
            risk_level = level
            break

    return overall_score, risk_level