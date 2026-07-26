from fastapi import APIRouter
from pymongo.errors import PyMongoError

from app.database import database
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


# ==========================================================
# Crime Summary
# ==========================================================

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


# ==========================================================
# District Analytics
# ==========================================================

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
        results = list(
            database.cases.aggregate(pipeline)
        )

    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "district": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


# ==========================================================
# Crime Type Analytics
# ==========================================================

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
        results = list(
            database.cases.aggregate(pipeline)
        )

    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "crime_type": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


# ==========================================================
# Severity Analytics
# ==========================================================

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
        results = list(
            database.cases.aggregate(pipeline)
        )

    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "severity": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


# ==========================================================
# Status Analytics
# ==========================================================

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
        results = list(
            database.cases.aggregate(pipeline)
        )

    except PyMongoError as error:
        handle_database_error(error)

    return [
        {
            "status": result["_id"],
            "total_cases": result["total_cases"]
        }
        for result in results
    ]


# ==========================================================
# Socio-Demographic Analytics
# ==========================================================

@router.get("/demographics")
def get_demographic_insights():
    """
    Return socio-demographic crime insights using historical
    crime data.

    Includes:
    - victim gender distribution
    - victim age-group distribution
    - high-severity cases by gender
    - common crime types by victim gender
    """

    try:
        collection = database.historical_cases

        # --------------------------------------------------
        # Total historical records
        # --------------------------------------------------

        total_records = collection.count_documents({})

        # --------------------------------------------------
        # Gender distribution
        # --------------------------------------------------

        gender_pipeline = [
            {
                "$match": {
                    "victim_gender": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$victim_gender",
                    "total_cases": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "total_cases": -1
                }
            }
        ]

        gender_results = list(
            collection.aggregate(gender_pipeline)
        )

        # --------------------------------------------------
        # Known age records
        #
        # Dataset stores victim_age_known as:
        # 1 = known
        # 0 = unknown
        # --------------------------------------------------

        known_age_records = collection.count_documents(
            {
                "victim_age_known": 1,
                "victim_age": {
                    "$ne": None
                }
            }
        )

        # --------------------------------------------------
        # Age distribution
        # --------------------------------------------------

        age_pipeline = [
            {
                "$match": {
                    "victim_age_known": 1,
                    "victim_age": {
                        "$ne": None
                    }
                }
            },
            {
                "$bucket": {
                    "groupBy": "$victim_age",
                    "boundaries": [
                        0,
                        18,
                        26,
                        41,
                        61,
                        200
                    ],
                    "default": "Unknown",
                    "output": {
                        "total_cases": {
                            "$sum": 1
                        }
                    }
                }
            },
            {
                "$sort": {
                    "_id": 1
                }
            }
        ]

        age_results = list(
            collection.aggregate(age_pipeline)
        )

        age_labels = {
            0: "Under 18",
            18: "18-25",
            26: "26-40",
            41: "41-60",
            61: "61+",
            "Unknown": "Unknown"
        }

        # --------------------------------------------------
        # High-severity cases by gender
        # --------------------------------------------------

        severity_gender_pipeline = [
            {
                "$match": {
                    "severity": {
                        "$regex": "^High$",
                        "$options": "i"
                    },
                    "victim_gender": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$victim_gender",
                    "high_severity_cases": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "high_severity_cases": -1
                }
            }
        ]

        severity_gender_results = list(
            collection.aggregate(
                severity_gender_pipeline
            )
        )

        # --------------------------------------------------
        # Crime types by gender
        # --------------------------------------------------

        crime_gender_pipeline = [
            {
                "$match": {
                    "victim_gender": {
                        "$nin": [None, ""]
                    },
                    "crime_type": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "gender": "$victim_gender",
                        "crime_type": "$crime_type"
                    },
                    "total_cases": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "total_cases": -1
                }
            },
            {
                "$limit": 15
            }
        ]

        crime_gender_results = list(
            collection.aggregate(
                crime_gender_pipeline
            )
        )

    except PyMongoError as error:
        handle_database_error(error)

    # ======================================================
    # Response
    # ======================================================

    return {
        "total_records": total_records,

        "known_age_records": known_age_records,

        "gender_distribution": [
            {
                "gender": item["_id"],
                "total_cases": item["total_cases"]
            }
            for item in gender_results
        ],

        "age_distribution": [
            {
                "age_group": age_labels.get(
                    item["_id"],
                    str(item["_id"])
                ),
                "total_cases": item["total_cases"]
            }
            for item in age_results
        ],

        "high_severity_by_gender": [
            {
                "gender": item["_id"],
                "high_severity_cases":
                    item["high_severity_cases"]
            }
            for item in severity_gender_results
        ],

        "crime_types_by_gender": [
            {
                "gender":
                    item["_id"]["gender"],
                "crime_type":
                    item["_id"]["crime_type"],
                "total_cases":
                    item["total_cases"]
            }
            for item in crime_gender_results
        ]
    }