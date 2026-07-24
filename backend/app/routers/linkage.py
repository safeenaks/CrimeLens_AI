from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import database
from app.services.linkage_service import calculate_case_linkage
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/linkage",
    tags=["Case Linkage"]
)


@router.get("/{case_id}")
def get_linked_cases(case_id: str):
    """
    Find cases that may be related to the selected case.

    Cases are compared using:
    - Crime type
    - District
    - Police station
    - Incident date proximity
    """

    try:
        object_id = ObjectId(case_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID."
        )

    try:
        source_case = database.cases.find_one(
            {"_id": object_id}
        )

        if not source_case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        candidate_cases = list(
            database.cases.find(
                {
                    "_id": {
                        "$ne": object_id
                    }
                }
            )
        )

    except PyMongoError as error:
        handle_database_error(error)

    linked_cases = []

    for candidate in candidate_cases:
        linkage = calculate_case_linkage(
            source_case,
            candidate
        )

        # Ignore cases with no meaningful similarity
        if linkage["linkage_score"] == 0:
            continue

        linked_cases.append(
            {
                "id": str(candidate["_id"]),
                "fir_number": candidate["fir_number"],
                "crime_type": candidate["crime_type"],
                "district": candidate["district"],
                "police_station": candidate["police_station"],
                "incident_date": candidate["incident_date"],
                "status": candidate["status"],
                "severity": candidate["severity"],
                **linkage,
            }
        )

    linked_cases.sort(
        key=lambda item: item["linkage_score"],
        reverse=True
    )

    return {
        "source_case": {
            "id": str(source_case["_id"]),
            "fir_number": source_case["fir_number"],
            "crime_type": source_case["crime_type"],
            "district": source_case["district"],
            "police_station": source_case["police_station"],
            "incident_date": source_case["incident_date"],
        },
        "total_linked_cases": len(linked_cases),
        "linked_cases": linked_cases,
    }