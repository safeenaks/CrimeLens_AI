def calculate_hotspot(total_cases: int, high_severity_cases: int) -> dict:
    """
    Calculate a rule-based hotspot score.

    High-severity cases are given additional weight.
    This acts as the baseline hotspot detection method
    and can later be complemented by an ML-based model.
    """

    hotspot_score = total_cases + (high_severity_cases * 2)

    if hotspot_score >= 6:
        risk_level = "High"
    elif hotspot_score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "hotspot_score": hotspot_score,
        "risk_level": risk_level
    }