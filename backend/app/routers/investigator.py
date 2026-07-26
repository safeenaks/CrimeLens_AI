from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.investigator_service import investigate


router = APIRouter(
    prefix="/api/investigator",
    tags=["AI Investigator"],
)


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        ...,
        min_length=1,
        max_length=1000,
    )


class InvestigatorRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Investigator question in English or Kannada",
    )

    language: Literal["en", "kn"] = Field(
        default="en",
        description="Response language: en for English, kn for Kannada",
    )

    history: list[ConversationMessage] = Field(
        default_factory=list,
        description="Recent conversation history for contextual follow-up questions",
    )


class InvestigatorResponse(BaseModel):
    question: str
    language: Literal["en", "kn"]
    answer: str
    plan: dict
    evidence: dict


@router.post(
    "/ask",
    response_model=InvestigatorResponse,
)
async def ask_investigator(
    request: InvestigatorRequest,
):
    try:
        history = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.history[-10:]
        ]

        result = investigate(
            question=request.question,
            language=request.language,
            history=history,
        )

        return InvestigatorResponse(
            question=request.question,
            language=request.language,
            answer=result["answer"],
            plan=result["plan"],
            evidence=result["evidence"],
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error