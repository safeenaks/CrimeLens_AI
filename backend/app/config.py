import os

from dotenv import load_dotenv


load_dotenv()


MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "crimelens_db")


if not MONGODB_URL:
    raise ValueError(
        "MONGODB_URL is not configured. "
        "Add it to the backend/.env file."
    )