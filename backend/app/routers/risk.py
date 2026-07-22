from fastapi import APIRouter, Query

from app.database import database
from app.services.risk_service import calculate_risk_score


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

    result = calculate_risk_score(cases)

    return {
        "district": district,
        **result
    }