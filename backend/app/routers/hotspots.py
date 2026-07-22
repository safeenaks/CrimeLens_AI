from fastapi import APIRouter

from app.database import database


router = APIRouter(
    prefix="/api/hotspots",
    tags=["Crime Hotspots"]
)


@router.get("")
def get_hotspots():
    """
    Identify and rank crime hotspot areas.

    Hotspot score is based on:
    - Total number of cases
    - Number of high-severity cases
    """

    pipeline = [
        {
            "$group": {
                "_id": {
                    "district": "$district",
                    "police_station": "$police_station"
                },
                "total_cases": {"$sum": 1},
                "latitude": {"$avg": "$latitude"},
                "longitude": {"$avg": "$longitude"},
                "high_severity_cases": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$severity", "High"]},
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]

    results = list(database.cases.aggregate(pipeline))

    hotspots = []

    for result in results:

        total_cases = result["total_cases"]
        high_cases = result["high_severity_cases"]

        # Simple rule-based hotspot score
        hotspot_score = total_cases + (high_cases * 2)

        if hotspot_score >= 6:
            risk_level = "High"
        elif hotspot_score >= 3:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        hotspots.append({
            "district": result["_id"]["district"],
            "police_station": result["_id"]["police_station"],
            "latitude": round(result["latitude"], 6),
            "longitude": round(result["longitude"], 6),
            "total_cases": total_cases,
            "high_severity_cases": high_cases,
            "hotspot_score": hotspot_score,
            "risk_level": risk_level
        })

    hotspots.sort(
        key=lambda hotspot: hotspot["hotspot_score"],
        reverse=True
    )

    return hotspots