from datetime import datetime


def calculate_case_linkage(
    source_case: dict,
    candidate_case: dict
) -> dict:
    """
    Calculate how strongly two crime cases may be related.

    Score factors:
    - Same crime type: 40 points
    - Same district: 20 points
    - Same police station: 25 points
    - Incident dates within 30 days: 15 points

    Maximum score: 100
    """

    score = 0
    reasons = []

    source_crime_type = str(
        source_case.get("crime_type", "")
    ).strip().lower()

    candidate_crime_type = str(
        candidate_case.get("crime_type", "")
    ).strip().lower()

    if (
        source_crime_type
        and source_crime_type == candidate_crime_type
    ):
        score += 40
        reasons.append("Same crime type")

    source_district = str(
        source_case.get("district", "")
    ).strip().lower()

    candidate_district = str(
        candidate_case.get("district", "")
    ).strip().lower()

    if (
        source_district
        and source_district == candidate_district
    ):
        score += 20
        reasons.append("Same district")

    source_station = str(
        source_case.get("police_station", "")
    ).strip().lower()

    candidate_station = str(
        candidate_case.get("police_station", "")
    ).strip().lower()

    if (
        source_station
        and source_station == candidate_station
    ):
        score += 25
        reasons.append("Same police station")

    source_date = source_case.get("incident_date")
    candidate_date = candidate_case.get("incident_date")

    if source_date and candidate_date:
        if isinstance(source_date, str):
            source_date = datetime.fromisoformat(
                source_date.replace("Z", "+00:00")
            )

        if isinstance(candidate_date, str):
            candidate_date = datetime.fromisoformat(
                candidate_date.replace("Z", "+00:00")
            )

        days_difference = abs(
            (source_date - candidate_date).days
        )

        if days_difference <= 30:
            score += 15
            reasons.append(
                f"Incidents occurred within {days_difference} days"
            )

    if score >= 75:
        linkage_level = "High"
    elif score >= 40:
        linkage_level = "Medium"
    else:
        linkage_level = "Low"

    return {
        "linkage_score": score,
        "linkage_level": linkage_level,
        "reasons": reasons,
    }