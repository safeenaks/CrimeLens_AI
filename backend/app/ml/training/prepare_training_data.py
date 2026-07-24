from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DATASET_PATH = (
    PROJECT_ROOT
    / "data"
    / "crimelens_karnataka_dataset_v2_ml_ready.csv"
)


def prepare_training_data():
    """
    Prepare monthly police-station-level data.

    Each row represents the current month and uses information
    available through that month to predict the next month's
    crime count.
    """

    df = pd.read_csv(DATASET_PATH)

    df["incident_date"] = pd.to_datetime(
        df["incident_date"],
        errors="coerce"
    )

    df = df.dropna(subset=["incident_date"])

    df["year"] = df["incident_date"].dt.year
    df["month"] = df["incident_date"].dt.month

    df["is_high_severity"] = (
        df["severity"].str.lower() == "high"
    ).astype(int)

    monthly = (
        df.groupby(
            [
                "district",
                "police_station",
                "year",
                "month"
            ],
            as_index=False
        )
        .agg(
            crime_count=("case_id", "count"),
            high_severity_count=("is_high_severity", "sum"),
            latitude=("latitude", "mean"),
            longitude=("longitude", "mean")
        )
    )

    monthly = monthly.sort_values(
        ["police_station", "year", "month"]
    ).reset_index(drop=True)

    station_groups = monthly.groupby("police_station")

    # Previous calendar month's crime count
    monthly["previous_month_crime_count"] = (
        station_groups["crime_count"].shift(1)
    )

    # Crime count two months ago
    monthly["lag_2_crime_count"] = (
        station_groups["crime_count"].shift(2)
    )

    # Crime count three months ago
    monthly["lag_3_crime_count"] = (
        station_groups["crime_count"].shift(3)
    )

    # Current month + previous two months.
    # This is information available when forecasting next month.
    monthly["rolling_3_month_avg"] = (
        station_groups["crime_count"]
        .transform(
            lambda series:
            series.rolling(3).mean()
        )
    )

    # Difference between the current month and previous month
    monthly["crime_trend"] = (
        monthly["crime_count"]
        - monthly["previous_month_crime_count"]
    )


    # Target = following month's crime count
    monthly["next_month_crime_count"] = (
        station_groups["crime_count"].shift(-1)
    )

    training_data = monthly.dropna(
        subset=[
            "previous_month_crime_count",
            "lag_2_crime_count",
            "lag_3_crime_count",
            "rolling_3_month_avg",
            "crime_trend",
            "next_month_crime_count"
        ]
    ).copy()

    return training_data


if __name__ == "__main__":
    data = prepare_training_data()

    print("Training dataset shape:", data.shape)

    print("\nColumns:")
    print(data.columns.tolist())

    print("\nSample:")
    print(data.head())

    print("\nTarget statistics:")
    print(
        data["next_month_crime_count"].describe()
    )