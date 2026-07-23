from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


CaseStatus = Literal[
    "Under Investigation",
    "Solved",
    "Unsolved",
    "Closed"
]

CaseSeverity = Literal[
    "Low",
    "Medium",
    "High"
]


class CaseCreate(BaseModel):
    fir_number: str = Field(..., min_length=1, max_length=100)
    crime_type: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)

    district: str = Field(..., min_length=1, max_length=100)
    police_station: str = Field(..., min_length=1, max_length=150)

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    incident_date: datetime

    status: CaseStatus = "Under Investigation"
    severity: CaseSeverity = "Medium"


class CaseResponse(CaseCreate):
    id: str


class CaseUpdate(BaseModel):
    crime_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=1000
    )

    district: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    police_station: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180
    )

    incident_date: datetime | None = None
    status: CaseStatus | None = None
    severity: CaseSeverity | None = None