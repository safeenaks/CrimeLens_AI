from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError

from app.database import database
from app.schemas import CaseCreate, CaseResponse, CaseUpdate
from app.utils.database_errors import handle_database_error


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"]
)


def serialize_case(case: dict) -> dict:
    """
    Convert MongoDB's ObjectId into a JSON-compatible string.
    """
    return {
        "id": str(case["_id"]),
        "fir_number": case["fir_number"],
        "crime_type": case["crime_type"],
        "description": case["description"],
        "district": case["district"],
        "police_station": case["police_station"],
        "latitude": case["latitude"],
        "longitude": case["longitude"],
        "incident_date": case["incident_date"],
        "status": case["status"],
        "severity": case["severity"],
    }


@router.post(
    "",
    response_model=CaseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_case(case: CaseCreate):
    """
    Create a new crime/FIR case in MongoDB.
    """

    try:
        existing_case = database.cases.find_one(
            {"fir_number": case.fir_number}
        )

        if existing_case:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A case with this FIR number already exists."
            )

        case_document = case.model_dump()

        result = database.cases.insert_one(case_document)

        created_case = database.cases.find_one(
            {"_id": result.inserted_id}
        )

    except PyMongoError as error:
        handle_database_error(error)

    return serialize_case(created_case)


@router.get(
    "",
    response_model=list[CaseResponse],
    status_code=status.HTTP_200_OK
)
def get_all_cases(
    district: str | None = None,
    crime_type: str | None = None,
    case_status: str | None = None,
    severity: str | None = None
):
    """
    Retrieve crime/FIR cases with optional filters.
    """

    query = {}

    if district:
        query["district"] = {
            "$regex": f"^{district}$",
            "$options": "i"
        }

    if crime_type:
        query["crime_type"] = {
            "$regex": f"^{crime_type}$",
            "$options": "i"
        }

    if case_status:
        query["status"] = {
            "$regex": f"^{case_status}$",
            "$options": "i"
        }

    if severity:
        query["severity"] = {
            "$regex": f"^{severity}$",
            "$options": "i"
        }

    try:
        cases = list(database.cases.find(query))
    except PyMongoError as error:
        handle_database_error(error)

    return [serialize_case(case) for case in cases]


@router.get(
    "/{case_id}",
    response_model=CaseResponse,
    status_code=status.HTTP_200_OK
)
def get_case_by_id(case_id: str):
    """
    Retrieve a single crime/FIR case by MongoDB ObjectId.
    """

    try:
        object_id = ObjectId(case_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID."
        )

    try:
        case = database.cases.find_one(
            {"_id": object_id}
        )
    except PyMongoError as error:
        handle_database_error(error)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found."
        )

    return serialize_case(case)


@router.put(
    "/{case_id}",
    response_model=CaseResponse,
    status_code=status.HTTP_200_OK
)
def update_case(case_id: str, case_update: CaseUpdate):
    """
    Update an existing crime/FIR case.
    """

    try:
        object_id = ObjectId(case_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID."
        )

    try:
        existing_case = database.cases.find_one(
            {"_id": object_id}
        )

        if not existing_case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        update_data = case_update.model_dump(exclude_unset=True)

        if update_data:
            database.cases.update_one(
                {"_id": object_id},
                {"$set": update_data}
            )

        updated_case = database.cases.find_one(
            {"_id": object_id}
        )

    except PyMongoError as error:
        handle_database_error(error)

    return serialize_case(updated_case)


@router.delete(
    "/{case_id}",
    status_code=status.HTTP_200_OK
)
def delete_case(case_id: str):
    """
    Delete a crime/FIR case by MongoDB ObjectId.
    """

    try:
        object_id = ObjectId(case_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID."
        )

    try:
        existing_case = database.cases.find_one(
            {"_id": object_id}
        )

        if not existing_case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        database.cases.delete_one(
            {"_id": object_id}
        )

    except PyMongoError as error:
        handle_database_error(error)

    return {
        "message": "Case deleted successfully.",
        "case_id": case_id
    }