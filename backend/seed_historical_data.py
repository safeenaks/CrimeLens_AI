from pathlib import Path

import pandas as pd

from app.database import database


CSV_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "crimelens_karnataka_dataset_v2_ml_ready.csv"
)


def seed_historical_data():
    print("Loading historical crime dataset...")

    df = pd.read_csv(CSV_PATH)

    print(f"Loaded {len(df)} records.")

    # Convert incident_date into a real datetime value
    df["incident_date"] = pd.to_datetime(
        df["incident_date"],
        errors="coerce"
    )

    # Remove records with invalid dates
    df = df.dropna(subset=["incident_date"])

    # Convert NaN values into None for MongoDB
    df = df.astype(object).where(pd.notnull(df), None)

    records = df.to_dict(orient="records")

    collection = database["historical_cases"]

    print("Removing existing historical data...")

    collection.delete_many({})

    if records:
        result = collection.insert_many(records)

        print(
            f"Inserted {len(result.inserted_ids)} "
            "historical crime records."
        )

    print("Historical data seeding completed.")


if __name__ == "__main__":
    seed_historical_data()