from pathlib import Path

import joblib

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from prepare_training_data import prepare_training_data


MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_PATH = MODEL_DIR / "crime_risk_model.joblib"


def train_model():
    """
    Train the final CrimeLens next-month crime forecasting model.

    The model predicts the next month's crime count for a
    police station using historical crime and location features.
    """

    data = prepare_training_data()

    # --------------------------------------------------
    # Features and target
    # --------------------------------------------------

    features = [
        "district",
        "police_station",
        "year",
        "month",
        "high_severity_count",
        "latitude",
        "longitude",
        "previous_month_crime_count",
        "rolling_3_month_avg"
    ]

    target = "next_month_crime_count"

    # --------------------------------------------------
    # Time-based split
    #
    # Training: 2020-2022
    # Testing: 2023
    # --------------------------------------------------

    train_data = data[data["year"] < 2023].copy()
    test_data = data[data["year"] == 2023].copy()

    X_train = train_data[features]
    y_train = train_data[target]

    X_test = test_data[features]
    y_test = test_data[target]

    # --------------------------------------------------
    # Feature groups
    # --------------------------------------------------

    categorical_features = [
        "district",
        "police_station"
    ]

    numeric_features = [
        "year",
        "month",
        "high_severity_count",
        "latitude",
        "longitude",
        "previous_month_crime_count",
        "rolling_3_month_avg"
    ]

    # --------------------------------------------------
    # Preprocessing
    # --------------------------------------------------

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features
            ),
            (
                "numeric",
                "passthrough",
                numeric_features
            )
        ]
    )

    # --------------------------------------------------
    # Winning model from model comparison
    # --------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    # --------------------------------------------------
    # Train
    # --------------------------------------------------

    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    # --------------------------------------------------
    # Model evaluation
    # --------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions
    )

    # --------------------------------------------------
    # Naive persistence baseline
    # --------------------------------------------------

    baseline_predictions = test_data["crime_count"]

    baseline_mae = mean_absolute_error(
        y_test,
        baseline_predictions
    )

    baseline_rmse = mean_squared_error(
        y_test,
        baseline_predictions
    ) ** 0.5

    baseline_r2 = r2_score(
        y_test,
        baseline_predictions
    )

    # --------------------------------------------------
    # Results
    # --------------------------------------------------

    print("Training samples:", len(X_train))
    print("Testing samples:", len(X_test))

    print("\nRandom Forest evaluation")
    print("------------------------")
    print(f"MAE:  {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²:   {r2:.3f}")

    print("\nNaive baseline evaluation")
    print("-------------------------")
    print(f"MAE:  {baseline_mae:.2f}")
    print(f"RMSE: {baseline_rmse:.2f}")
    print(f"R²:   {baseline_r2:.3f}")

    improvement = (
        (baseline_mae - mae)
        / baseline_mae
    ) * 100

    print("\nComparison")
    print("----------")
    print(
        f"Random Forest improves MAE by "
        f"{improvement:.2f}% over the baseline."
    )

    # --------------------------------------------------
    # Save final selected model
    # --------------------------------------------------

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        pipeline,
        MODEL_PATH
    )

    print(
        f"\nModel saved to: {MODEL_PATH}"
    )


if __name__ == "__main__":
    train_model()