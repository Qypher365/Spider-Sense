"""
DataShield Backend — Privacy Score

overall_score is a PRIVACY SCORE:
    100 = safest
      0 = highest privacy risk

Risk is calculated from:
    1. field sensitivity
    2. whether the field is reasonable in the page context

A sensitive field that is legitimately required should NOT be
treated the same as a sensitive field requested without justification.
"""

SENSITIVITY_WEIGHT: dict[str, int] = {
    "low": 10,
    "medium": 40,
    "high": 70,
    "critical": 100,
    "unknown": 30,
}

# Reasonable sensitive fields still carry some inherent privacy impact.
# Low-sensitivity reasonable fields have essentially no privacy penalty.
REASONABLE_MULTIPLIER: dict[str, float] = {
    "low": 0.0,
    "medium": 1.0,
    "high": 0.5,
    "critical": 0.5,
    "unknown": 1.0,
}


def score_scan(
    sensitivities: list[str],
    reasonables: list[bool],
) -> tuple[int, str]:

    if not sensitivities:
        return 100, "low"

    if len(sensitivities) != len(reasonables):
        raise ValueError(
            "sensitivities and reasonables must have the same length"
        )

    risk_weights = []

    for sensitivity, reasonable in zip(sensitivities, reasonables):
        base_weight = SENSITIVITY_WEIGHT.get(
            sensitivity,
            SENSITIVITY_WEIGHT["unknown"],
        )

        if reasonable:
            penalty = base_weight * REASONABLE_MULTIPLIER.get(
                sensitivity,
                1.0,
            )
        else:
            # Unjustified sensitive data request gets the full penalty.
            penalty = base_weight

        risk_weights.append(penalty)

    max_risk = max(risk_weights)
    average_risk = sum(risk_weights) / len(risk_weights)

    # Worst field dominates, while the average still matters.
    risk_score = round(
        0.7 * max_risk +
        0.3 * average_risk
    )

    risk_score = max(0, min(100, risk_score))

    # IMPORTANT:
    # Higher overall_score = BETTER privacy.
    overall_score = 100 - risk_score

    if overall_score >= 75:
        risk_level = "low"
    elif overall_score >= 50:
        risk_level = "medium"
    elif overall_score >= 25:
        risk_level = "high"
    else:
        risk_level = "critical"

    return overall_score, risk_level