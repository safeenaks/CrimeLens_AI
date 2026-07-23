from pathlib import Path

import joblib
import pandas as pd

from app.database import database


MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "ml"
    / "models"
    / "crime_risk_model.joblib"
)

model = joblib.load(MODEL_PATH)


def predict_station_crime(police_station: str) -> dict:
    """
    Predict next-month crime count for a police station
    using historical cases stored in MongoDB.
    """

    cases = list(
        database.historical_cases.find(
            {
                "police_station": {
                    "$regex": f"^{police_station}$",
                    "$options": "i"
                }
            }
        )
    )

    if not cases:
        raise ValueError("No cases found for this police station.")

    df = pd.DataFrame(cases)

    df["incident_date"] = pd.to_datetime(
        df["incident_date"],
        errors="coerce"
    )

    df = df.dropna(subset=["incident_date"])

    if df.empty:
        raise ValueError(
            "No valid incident dates found for this police station."
        )

    df["year"] = df["incident_date"].dt.year
    df["month"] = df["incident_date"].dt.month

    df["is_high_severity"] = (
        df["severity"].str.lower() == "high"
    ).astype(int)

    monthly = (
        df.groupby(
            ["year", "month"],
            as_index=False
        )
        .agg(
            crime_count=("_id", "count"),
            high_severity_count=("is_high_severity", "sum"),
            latitude=("latitude", "mean"),
            longitude=("longitude", "mean")
        )
        .sort_values(["year", "month"])
        .reset_index(drop=True)
    )

    if len(monthly) < 4:
        raise ValueError(
            "At least four months of historical data "
            "are required for prediction."
        )

    latest = monthly.iloc[-1]

    previous_month_crime_count = monthly.iloc[-2]["crime_count"]

    rolling_3_month_avg = (
    monthly.iloc[-3:]["crime_count"].mean()
)

    district = df["district"].iloc[0]

    input_data = pd.DataFrame(
        [
            {
                "district": district,
                "police_station": police_station,
                "year": int(latest["year"]),
                "month": int(latest["month"]),
                "high_severity_count": int(
                    latest["high_severity_count"]
                ),
                "latitude": float(latest["latitude"]),
                "longitude": float(latest["longitude"]),
                "previous_month_crime_count": float(
                    previous_month_crime_count
                ),
                "rolling_3_month_avg": float(
                    rolling_3_month_avg
                )
            }
        ]
    )

    prediction = model.predict(input_data)[0]

    predicted_count = max(
        0,
        int(round(prediction))
    )

    return {
        "district": district,
        "police_station": police_station,
        "latest_data_year": int(latest["year"]),
        "latest_data_month": int(latest["month"]),
        "predicted_next_month_crime_count": predicted_count
    }