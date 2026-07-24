from fastapi import APIRouter
from pymongo.errors import PyMongoError

from app.database import database
from app.services.hotspot_service import calculate_hotspot
from app.utils.database_errors import handle_database_error


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

    try:
        results = list(database.cases.aggregate(pipeline))
    except PyMongoError as error:
        handle_database_error(error)

    hotspots = []

    for result in results:
        total_cases = result["total_cases"]
        high_cases = result["high_severity_cases"]

        hotspot_result = calculate_hotspot(
            total_cases,
            high_cases
        )

        hotspots.append({
            "district": result["_id"]["district"],
            "police_station": result["_id"]["police_station"],
            "latitude": round(result["latitude"], 6),
            "longitude": round(result["longitude"], 6),
            "total_cases": total_cases,
            "high_severity_cases": high_cases,
            **hotspot_result
        })

    hotspots.sort(
        key=lambda hotspot: hotspot["hotspot_score"],
        reverse=True
    )

    return hotspots