from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.config import DATABASE_NAME, MONGODB_URL


client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000
)

database = client[DATABASE_NAME]


def check_database_connection() -> bool:
    """
    Verify that the CrimeLens backend can communicate
    with MongoDB Atlas.
    """
    try:
        client.admin.command("ping")
        return True
    except PyMongoError as error:
        print(f"MongoDB connection error: {error}")
        return False