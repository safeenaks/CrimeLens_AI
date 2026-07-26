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

def build_investigation_plan(question: str) -> dict:
    """
    Convert an English or Kannada investigator question
    into a safe structured CrimeLens query plan.
    """

    prompt = f"""
You are the query planner for CrimeLens AI, a crime intelligence system.

Your task is to convert an investigator's natural-language question
into ONE structured database investigation plan.

The investigator may ask questions in English or Kannada.

AVAILABLE CRIMELENS DATABASE FIELDS:

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


1. COUNT

Use when the investigator asks how many cases satisfy conditions.

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


2. GROUP

Use for rankings, distributions, most common values,
highest counts, lowest counts, top categories, etc.

Example:

Question:
Which district has the highest number of crimes?

Output:

{{
    "operation": "group",
    "field": "district",
    "filters": {{}},
    "limit": 1
}}


Question:
What are the five most common crime types?

Output:

{{
    "operation": "group",
    "field": "crime_type",
    "filters": {{}},
    "limit": 5
}}


3. FIND

Use when the investigator asks to show, list,
retrieve or find individual crime records.

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


FILTER FORMAT:

For text values, use case-insensitive matching.

Example:

{{
    "district": {{
        "$regex": "^Mysuru$",
        "$options": "i"
    }}
}}


STRICT RULES:

- Return ONLY one valid JSON object.
- Do not return markdown.
- Do not explain your answer.
- Do not include ```json.
- Never invent filters.
- Never invent district names.
- Never invent police station names.
- Never invent crime types.
- Never invent severity values.
- Never invent status values.
- Only create a filter when the investigator explicitly mentions it.
- Only use fields listed above.
- If the question asks "how many", normally use count.
- If the question asks "which has the most", use group.
- If the question asks "highest", use group.
- If the question asks "lowest", use group.
- If the question asks "top", use group.
- If the question asks "most common", use group.
- If the question asks to show/list/find cases, use find.
- limit must be between 1 and 20.
- Kannada questions must be interpreted with the same rules.


INVESTIGATOR QUESTION:

{question}
"""

    response = call_groq(prompt)

    response = response.strip()

    # Defensive cleanup in case the model returns a code block.
    if response.startswith("```"):
        response = response.replace("```json", "")
        response = response.replace("```JSON", "")
        response = response.replace("```", "")
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

    This prevents the AI from executing arbitrary MongoDB
    operators or accessing unsupported fields.
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

                # Only allow case-insensitive regex option.
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
    CrimeLens MongoDB.
    """

    operation = plan.get("operation")

    filters = validate_filters(
        plan.get("filters", {})
    )

    # =====================================================
    # COUNT
    # =====================================================

    if operation == "count":

        count = database.historical_cases.count_documents(
            filters
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

        # Apply optional filters first.
        if filters:
            pipeline.append(
                {
                    "$match": filters
                }
            )

        # Ignore missing or empty values.
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

        # Group records.
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

        # Limit results.
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

Keep official names such as district names,
police station names, FIR numbers and case IDs
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

You have already been provided with evidence retrieved
from the CrimeLens database.

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
- If the evidence is empty, clearly state that no matching
  information was found.
- If evidence is insufficient to answer the question,
  clearly say so.
- Mention important numerical results when available.
- Keep the answer concise.
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
) -> dict:
    """
    Complete CrimeLens AI Investigator workflow.

    1. Understand question with Groq.
    2. Generate structured plan.
    3. Validate the plan.
    4. Query CrimeLens MongoDB.
    5. Generate grounded English/Kannada response.
    """

    try:

        plan = build_investigation_plan(
            question
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