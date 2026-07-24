from fastapi import APIRouter, Query
from pymongo.errors import PyMongoError

from app.database import database
from app.services.risk_service import calculate_risk_score
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/risk",
    tags=["Risk Assessment"]
)


@router.get("/district")
def get_district_risk(
    district: str = Query(..., min_length=1)
):
    """
    Calculate the crime risk level for a district
    using the cases currently stored in MongoDB.
    """

    try:
        cases = list(
            database.cases.find(
                {
                    "district": {
                        "$regex": f"^{district}$",
                        "$options": "i"
                    }
                }
            )
        )
    except PyMongoError as error:
        handle_database_error(error)

    result = calculate_risk_score(cases)

    return {
        "district": district,
        **result
    }