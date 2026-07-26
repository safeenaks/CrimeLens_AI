import os

from dotenv import load_dotenv


load_dotenv()


MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "crimelens_db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")



FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


if not MONGODB_URL:
    raise ValueError(
        "MONGODB_URL is not configured. "
        "Add it to the backend/.env file."
    )
if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not configured. "
        "Add it to the backend/.env file."
    )