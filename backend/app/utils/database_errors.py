from fastapi import HTTPException
from pymongo.errors import PyMongoError


def handle_database_error(error: PyMongoError) -> None:
    """
    Convert MongoDB/PyMongo failures into a clean API response.

    Prevents internal database connection details from being
    exposed to API clients.
    """

    raise HTTPException(
        status_code=503,
        detail="Database service is temporarily unavailable"
    ) from error