from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CaseCreate(BaseModel):
    fir_number: str = Field(..., min_length=1)
    crime_type: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    district: str = Field(..., min_length=1)
    police_station: str = Field(..., min_length=1)

    latitude: float
    longitude: float

    incident_date: datetime

    status: str = "Under Investigation"
    severity: str = "Medium"


class CaseResponse(CaseCreate):
    id: str
class CaseUpdate(BaseModel):
    crime_type: str | None = None
    description: str | None = None
    district: str | None = None
    police_station: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    incident_date: datetime | None = None
    status: str | None = None
    severity: str | None = None