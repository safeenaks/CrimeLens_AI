def calculate_risk_score(cases: list[dict]) -> dict:
    """
    Calculate a basic crime risk score from case severity.

    This is a rule-based baseline and can later be replaced
    with an ML-based prediction model.
    """

    if not cases:
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "total_cases": 0
        }

    severity_weights = {
        "Low": 1,
        "Medium": 2,
        "High": 3
    }

    total_score = 0

    for case in cases:
        severity = case.get("severity", "Low")
        total_score += severity_weights.get(severity, 1)

    average_score = total_score / len(cases)

    if average_score >= 2.5:
        risk_level = "High"
    elif average_score >= 1.5:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "risk_score": round(average_score, 2),
        "risk_level": risk_level,
        "total_cases": len(cases)
    }