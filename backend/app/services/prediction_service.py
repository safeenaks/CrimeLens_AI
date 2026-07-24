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
def classify_station_risk(predicted_count: int) -> str:
    """
    Classify station-level predicted monthly crime count
    using historical 33rd and 67th percentile thresholds.
    """

    if predicted_count <= 16:
        return "Low"

    if predicted_count <= 23:
        return "Medium"

    return "High"

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

    risk_level = classify_station_risk(predicted_count)

    return {
        "district": district,
        "police_station": police_station,
        "latest_data_year": int(latest["year"]),
        "latest_data_month": int(latest["month"]),
        "predicted_next_month_crime_count": predicted_count,
        "risk_level": risk_level
    }

def predict_district_crime(district: str) -> dict:
    """
    Predict next-month crime count for a district by
    aggregating predictions from its police stations.
    """

    stations = database.historical_cases.distinct(
        "police_station",
        {
            "district": {
                "$regex": f"^{district}$",
                "$options": "i"
            }
        }
    )

    if not stations:
        raise ValueError(
            "No historical data found for this district."
        )

    station_predictions = []
    total_predicted_count = 0

    risk_summary = {
        "low": 0,
        "medium": 0,
        "high": 0
    }

    for station in sorted(stations):
        try:
            prediction = predict_station_crime(station)

            predicted_count = prediction[
                "predicted_next_month_crime_count"
            ]

            risk_level = prediction["risk_level"]

            station_predictions.append(
                {
                    "police_station": station,
                    "predicted_count": predicted_count,
                    "risk_level": risk_level
                }
            )

            risk_summary[risk_level.lower()] += 1
            total_predicted_count += predicted_count

        except ValueError:
            # Skip stations without enough historical data
            continue

    if not station_predictions:
        raise ValueError(
            "No police stations in this district have "
            "enough historical data for prediction."
        )

    return {
        "district": district,
        "station_count": len(station_predictions),
        "predicted_next_month_crime_count": total_predicted_count,
        "risk_summary": risk_summary,
        "station_predictions": station_predictions
    }