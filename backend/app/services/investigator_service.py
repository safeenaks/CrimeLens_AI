import json

from openai import OpenAI
from pymongo.errors import PyMongoError

from app.config import GROQ_API_KEY
from app.database import database


# ---------------------------------------------------------
# Groq Configuration
# ---------------------------------------------------------

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

GROQ_MODEL = "openai/gpt-oss-120b"


# ---------------------------------------------------------
# Allowed CrimeLens Database Fields
# ---------------------------------------------------------

ALLOWED_FIELDS = {
    "case_id",
    "fir_number",
    "crime_type",
    "description",
    "district",
    "police_station",
    "latitude",
    "longitude",
    "incident_date",
    "status",
    "severity",
    "victim_age",
    "victim_gender",
    "weapon_used",
    "weapon_involved",
    "victim_age_known",
}


# ---------------------------------------------------------
# Groq API
# ---------------------------------------------------------

def call_groq(prompt: str) -> str:
    """
    Send a prompt to Groq using its OpenAI-compatible API.
    """

    response = client.responses.create(
        model=GROQ_MODEL,
        input=prompt,
    )

    return response.output_text.strip()


# ---------------------------------------------------------
# AI Query Planner
# ---------------------------------------------------------

def build_investigation_plan(
    question: str,
    history: list | None = None,
) -> dict:
    """
    Convert an investigator question into a safe,
    structured CrimeLens database investigation plan.

    Recent conversation history is supplied so follow-up
    questions such as "in that district" can be resolved.
    """

    history = history or []

    conversation_context = json.dumps(
        history[-10:],
        ensure_ascii=False,
    )

    prompt = f"""
You are the query planner for CrimeLens AI, a Karnataka
crime intelligence system.

Convert the investigator's CURRENT question into exactly
ONE structured database investigation plan.

The investigator may communicate in English or Kannada.

You may receive recent conversation history.

Use conversation history ONLY when necessary to resolve
references in the current question.

Examples:

"that district"
"that police station"
"those cases"
"there"
"the same district"

Kannada examples:

"ಅದೇ ಜಿಲ್ಲೆಯಲ್ಲಿ"
"ಆ ಜಿಲ್ಲೆಯಲ್ಲಿ"
"ಆ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ"
"ಅಲ್ಲಿ"


CONTEXT EXAMPLE:

Previous user question:
Which district has the highest number of crimes?

Previous assistant answer:
Bengaluru Urban has the highest number of crimes.

Current question:
Which police station has the most cases in that district?

Correct plan:

{{
    "operation": "group",
    "field": "police_station",
    "filters": {{
        "district": {{
            "$regex": "^Bengaluru Urban$",
            "$options": "i"
        }}
    }},
    "limit": 1
}}


IMPORTANT CONTEXT RULE:

Conversation history is CONTEXT ONLY.

It can be used to determine what words such as
"that district" refer to.

Never treat a statistic from conversation history as
verified evidence for the new answer.

The database query must always retrieve fresh evidence.


AVAILABLE CRIMELENS FIELDS:

case_id
fir_number
crime_type
description
district
police_station
latitude
longitude
incident_date
status
severity
victim_age
victim_gender
weapon_used
weapon_involved
victim_age_known


SUPPORTED OPERATIONS:


1. count

Use when the investigator asks how many records match
specific conditions.

Example:

{{
    "operation": "count",
    "filters": {{
        "severity": {{
            "$regex": "^High$",
            "$options": "i"
        }}
    }}
}}


2. group

Use for:

- highest
- lowest
- most
- least
- top categories
- distributions
- rankings

Example:

{{
    "operation": "group",
    "field": "district",
    "filters": {{}},
    "limit": 5
}}


3. find

Use when the investigator asks to:

- show cases
- list cases
- retrieve cases
- find cases

Example:

{{
    "operation": "find",
    "filters": {{
        "district": {{
            "$regex": "^Mysuru$",
            "$options": "i"
        }}
    }},
    "limit": 10
}}


STRICT RULES:

- Return ONLY one valid JSON object.
- Do not return Markdown.
- Do not explain the JSON.
- Never invent a district.
- Never invent a police station.
- Never invent a crime type.
- Never invent a severity.
- Never invent a status.
- Never invent case information.
- Never add unrelated filters.
- Only use available CrimeLens database fields.
- Use case-insensitive regex for text filters.
- limit must be between 1 and 20.

A filter may come from:

1. Information explicitly stated in the current question.

OR

2. A clearly resolved contextual reference from recent
   conversation history.

If the investigator asks "how many", normally use "count".

If the investigator asks highest, lowest, most, least,
top or similar ranking questions, use "group".

If the investigator asks to show, list, retrieve or find
cases, use "find".


RECENT CONVERSATION:

{conversation_context}


CURRENT INVESTIGATOR QUESTION:

{question}
"""

    response = call_groq(prompt).strip()

    # Remove accidental Markdown code fences.
    if response.startswith("```"):
        response = response.replace(
            "```json",
            "",
        )
        response = response.replace(
            "```JSON",
            "",
        )
        response = response.replace(
            "```",
            "",
        )
        response = response.strip()

    try:
        plan = json.loads(response)

    except json.JSONDecodeError as error:
        raise ValueError(
            "AI could not create a valid investigation plan."
        ) from error

    if not isinstance(plan, dict):
        raise ValueError(
            "AI returned an invalid investigation plan."
        )

    return plan


# ---------------------------------------------------------
# Query Validation
# ---------------------------------------------------------

def validate_filters(filters: dict) -> dict:
    """
    Validate AI-generated filters before sending them
    to MongoDB.

    Only approved CrimeLens fields and safe regex
    operators are allowed.
    """

    if not isinstance(filters, dict):
        return {}

    validated = {}

    for field, value in filters.items():

        if field not in ALLOWED_FIELDS:
            continue

        # AI supplied operators such as regex.
        if isinstance(value, dict):

            operators = {}

            if "$regex" in value:
                operators["$regex"] = str(
                    value["$regex"]
                )

            if "$options" in value:
                options = str(
                    value["$options"]
                )

                # Only allow case-insensitive regex.
                if options == "i":
                    operators["$options"] = "i"

            if operators:
                validated[field] = operators

        # Direct equality value.
        else:
            validated[field] = value

    return validated


# ---------------------------------------------------------
# Execute Investigation Plan
# ---------------------------------------------------------

def execute_plan(plan: dict) -> dict:
    """
    Execute a validated AI investigation plan against
    the Karnataka historical crime dataset.
    """

    operation = plan.get("operation")

    filters = validate_filters(
        plan.get("filters", {})
    )

    # =====================================================
    # COUNT
    # =====================================================

    if operation == "count":

        count = (
            database.historical_cases.count_documents(
                filters
            )
        )

        return {
            "operation": "count",
            "filters": filters,
            "count": count,
        }

    # =====================================================
    # GROUP
    # =====================================================

    if operation == "group":

        field = plan.get("field")

        if field not in ALLOWED_FIELDS:
            raise ValueError(
                "AI requested an unsupported grouping field."
            )

        try:
            limit = int(
                plan.get("limit", 5)
            )

        except (TypeError, ValueError):
            limit = 5

        limit = min(
            max(limit, 1),
            20,
        )

        pipeline = []

        # Apply optional filters.
        if filters:
            pipeline.append(
                {
                    "$match": filters
                }
            )

        # Ignore missing and empty values.
        pipeline.append(
            {
                "$match": {
                    field: {
                        "$nin": [
                            None,
                            "",
                        ]
                    }
                }
            }
        )

        # Group by requested field.
        pipeline.append(
            {
                "$group": {
                    "_id": f"${field}",
                    "count": {
                        "$sum": 1
                    },
                }
            }
        )

        # Highest count first.
        pipeline.append(
            {
                "$sort": {
                    "count": -1
                }
            }
        )

        pipeline.append(
            {
                "$limit": limit
            }
        )

        results = list(
            database.historical_cases.aggregate(
                pipeline
            )
        )

        return {
            "operation": "group",
            "field": field,
            "filters": filters,
            "results": results,
        }

    # =====================================================
    # FIND
    # =====================================================

    if operation == "find":

        try:
            limit = int(
                plan.get("limit", 10)
            )

        except (TypeError, ValueError):
            limit = 10

        limit = min(
            max(limit, 1),
            20,
        )

        records = list(
            database.historical_cases.find(
                filters,
                {
                    "_id": 0
                },
            ).limit(limit)
        )

        return {
            "operation": "find",
            "filters": filters,
            "records": records,
        }

    raise ValueError(
        "AI requested an unsupported investigation operation."
    )


# ---------------------------------------------------------
# AI Answer Generator
# ---------------------------------------------------------

def generate_answer(
    question: str,
    language: str,
    evidence: dict,
) -> str:
    """
    Convert verified CrimeLens evidence into a natural
    English or Kannada response.
    """

    if language == "kn":

        language_instruction = """
Respond in clear and natural Kannada.

Use Kannada for the explanation.

Keep official district names, police station names,
FIR numbers, case IDs and other official identifiers
unchanged where appropriate.
"""

    else:

        language_instruction = """
Respond in clear and professional English.
"""

    prompt = f"""
You are CrimeLens AI Investigator.

You assist crime investigators by explaining VERIFIED
CrimeLens crime intelligence results.

The evidence below has already been retrieved from the
CrimeLens historical Karnataka crime dataset.

STRICT RULES:

- Use ONLY the verified evidence provided below.
- Never invent statistics.
- Never invent crime cases.
- Never invent case IDs.
- Never invent FIR numbers.
- Never invent districts.
- Never invent police stations.
- Never invent crime types.
- Never change numerical values.
- Never claim causation based only on crime counts.

- If evidence is empty, clearly state that no matching
  information was found.

- If the evidence is insufficient to answer the question,
  clearly state that the available evidence is insufficient.

- Mention important numerical results when available.

- Keep the answer concise and professional.

- Return plain text only.

- Do NOT use Markdown formatting.
- Do NOT use **bold** formatting.
- Do NOT use Markdown headings.

- Do not mention MongoDB.
- Do not mention JSON.
- Do not mention query plans.
- Do not mention internal implementation details.


LANGUAGE:

{language_instruction}


INVESTIGATOR QUESTION:

{question}


VERIFIED CRIMELENS EVIDENCE:

{json.dumps(
    evidence,
    ensure_ascii=False,
    default=str,
)}
"""

    return call_groq(
        prompt
    )


# ---------------------------------------------------------
# Main Investigator Function
# ---------------------------------------------------------

def investigate(
    question: str,
    language: str,
    history: list | None = None,
) -> dict:
    """
    Complete CrimeLens AI Investigator workflow.

    1. Understand the current question and conversation.
    2. Generate a structured investigation plan.
    3. Validate the plan.
    4. Query the historical Karnataka crime dataset.
    5. Generate an evidence-grounded English/Kannada answer.
    """

    try:

        plan = build_investigation_plan(
            question=question,
            history=history,
        )

        evidence = execute_plan(
            plan
        )

        answer = generate_answer(
            question=question,
            language=language,
            evidence=evidence,
        )

        return {
            "answer": answer,
            "plan": plan,
            "evidence": evidence,
        }

    except PyMongoError as error:

        raise RuntimeError(
            f"Database investigation failed: {error}"
        ) from error

    except ValueError:
        raise

    except Exception as error:

        raise RuntimeError(
            f"AI investigation failed: {error}"
        ) from error