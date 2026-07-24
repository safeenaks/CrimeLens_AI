from fastapi import APIRouter, HTTPException, Query, status
from pymongo.errors import PyMongoError
from app.database import database
from app.schemas import (
    DistrictPredictionResponse,
    StationPredictionResponse
)
from app.services.prediction_service import (
    predict_district_crime,
    predict_station_crime
)
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/predictions",
    tags=["ML Predictions"]
)

@router.get("/districts")
def get_prediction_districts():
    """
    Return districts that have historical data available
    for ML crime prediction.
    """

    try:
        districts = database.historical_cases.distinct("district")

        return {
            "districts": sorted(
                district
                for district in districts
                if district
            )
        }

    except PyMongoError as error:
        handle_database_error(error)

@router.get(
    "/station",
    response_model=StationPredictionResponse
)
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

@router.get(
    "/district",
    response_model=DistrictPredictionResponse
)
def predict_district(
    district: str = Query(..., min_length=1)
):
    """
    Predict the next month's crime count for a district
    by aggregating police-station-level ML predictions.
    """

    try:
        return predict_district_crime(district)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except PyMongoError as error:
        handle_database_error(error)