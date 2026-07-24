from fastapi import APIRouter
from pymongo.errors import PyMongoError

from app.database import database
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def get_crime_summary():
    """
    Return summary statistics for crime cases.
    """

    try:
        total_cases = database.cases.count_documents({})

        high_severity_cases = database.cases.count_documents(
            {
                "severity": {
                    "$regex": "^High$",
                    "$options": "i"
                }
            }
        )

        unsolved_cases = database.cases.count_documents(
            {
                "status": {
                    "$regex": "^Unsolved$",
                    "$options": "i"
                }
            }
        )

        crime_type_pipeline = [
            {
                "$group": {
                    "_id": "$crime_type",
                    "count": {"$sum": 1}
                }
            }
        ]

        crime_type_results = list(
            database.cases.aggregate(crime_type_pipeline)
        )

    except PyMongoError as error:
        handle_database_error(error)

    crime_types = {
        item["_id"]: item["count"]
        for item in crime_type_results
    }

    return {
        "total_cases": total_cases,
        "high_severity_cases": high_severity_cases,
        "unsolved_cases": unsolved_cases,
        "crime_types": crime_types
    }


@router.get("/districts")
def get_district_crime_counts():
    """
    Get the number of crime cases in each district.
    """

    pipeline = [
        {
            "$group": {
                "_id": "$district",
                "total_cases": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "total_cases": -1
            }
        }
    ]

    try:
        results = list(database.cases.aggregate(pipeline))
    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "district": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


@router.get("/crime-types")
def get_crime_type_counts():
    """
    Get the number of cases for each crime type.
    """

    pipeline = [
        {
            "$group": {
                "_id": "$crime_type",
                "total_cases": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "total_cases": -1
            }
        }
    ]

    try:
        results = list(database.cases.aggregate(pipeline))
    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "crime_type": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


@router.get("/severity")
def get_severity_counts():
    """
    Get the number of cases grouped by severity.
    """

    pipeline = [
        {
            "$group": {
                "_id": "$severity",
                "total_cases": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "total_cases": -1
            }
        }
    ]

    try:
        results = list(database.cases.aggregate(pipeline))
    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "severity": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


@router.get("/status")
def get_status_counts():
    """
    Get the number of cases grouped by status.
    """

    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "total_cases": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "total_cases": -1
            }
        }
    ]

    try:
        results = list(database.cases.aggregate(pipeline))
    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "status": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]