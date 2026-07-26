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
@router.get("/{case_id}/network")
def get_case_linkage_network(
    case_id: str,
    minimum_score: int = 40,
    limit: int = 20,
):
    """
    Build an evidence-based relationship network around a selected case.

    Nodes represent crime cases.
    Edges represent calculated similarities between cases.

    Only relationships supported by CrimeLens case data are returned.
    """

    # Prevent unreasonable values
    minimum_score = max(0, min(minimum_score, 100))
    limit = max(1, min(limit, 50))

    try:
        object_id = ObjectId(case_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID.",
        )

    try:
        source_case = database.cases.find_one(
            {"_id": object_id}
        )

        if not source_case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found.",
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

    relationships = []

    for candidate in candidate_cases:
        linkage = calculate_case_linkage(
            source_case,
            candidate,
        )

        if (
            linkage["linkage_score"]
            < minimum_score
        ):
            continue

        relationships.append(
            {
                "case": candidate,
                "linkage": linkage,
            }
        )

    relationships.sort(
        key=lambda item:
        item["linkage"]["linkage_score"],
        reverse=True,
    )

    relationships = relationships[:limit]

    nodes = [
        {
            "id": str(source_case["_id"]),
            "fir_number": source_case.get(
                "fir_number",
                "Unknown",
            ),
            "crime_type": source_case.get(
                "crime_type",
                "Unknown",
            ),
            "district": source_case.get(
                "district",
                "Unknown",
            ),
            "police_station": source_case.get(
                "police_station",
                "Unknown",
            ),
            "severity": source_case.get(
                "severity",
                "Unknown",
            ),
            "status": source_case.get(
                "status",
                "Unknown",
            ),
            "is_source": True,
        }
    ]

    edges = []

    for relationship in relationships:
        candidate = relationship["case"]
        linkage = relationship["linkage"]

        candidate_id = str(
            candidate["_id"]
        )

        nodes.append(
            {
                "id": candidate_id,
                "fir_number": candidate.get(
                    "fir_number",
                    "Unknown",
                ),
                "crime_type": candidate.get(
                    "crime_type",
                    "Unknown",
                ),
                "district": candidate.get(
                    "district",
                    "Unknown",
                ),
                "police_station": candidate.get(
                    "police_station",
                    "Unknown",
                ),
                "severity": candidate.get(
                    "severity",
                    "Unknown",
                ),
                "status": candidate.get(
                    "status",
                    "Unknown",
                ),
                "is_source": False,
            }
        )

        edges.append(
            {
                "source": str(
                    source_case["_id"]
                ),
                "target": candidate_id,
                "score": linkage[
                    "linkage_score"
                ],
                "level": linkage[
                    "linkage_level"
                ],
                "reasons": linkage[
                    "reasons"
                ],
            }
        )

    high_links = sum(
        1
        for edge in edges
        if edge["level"] == "High"
    )

    medium_links = sum(
        1
        for edge in edges
        if edge["level"] == "Medium"
    )

    low_links = sum(
        1
        for edge in edges
        if edge["level"] == "Low"
    )

    return {
        "source_case_id": str(
            source_case["_id"]
        ),
        "minimum_score": minimum_score,
        "node_count": len(nodes),
        "edge_count": len(edges),
        "summary": {
            "high_links": high_links,
            "medium_links": medium_links,
            "low_links": low_links,
        },
        "nodes": nodes,
        "edges": edges,
    }