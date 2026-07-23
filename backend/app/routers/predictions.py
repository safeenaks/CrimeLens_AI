from fastapi import APIRouter, HTTPException, Query, status
from pymongo.errors import PyMongoError

from app.services.prediction_service import predict_station_crime
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/predictions",
    tags=["ML Predictions"]
)


@router.get("/station")
def predict_station(
    police_station: str = Query(..., min_length=1)
):
    """
    Predict the next month's crime count for a police station
    using the trained CrimeLens ML model.
    """

    try:
        return predict_station_crime(police_station)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except PyMongoError as error:
        handle_database_error(error)