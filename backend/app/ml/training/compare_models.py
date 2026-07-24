from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    RandomForestRegressor
)
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from prepare_training_data import prepare_training_data


FEATURES = [
    "district",
    "police_station",
    "year",
    "month",
    "high_severity_count",
    "latitude",
    "longitude",
    "previous_month_crime_count",
    "lag_2_crime_count",
    "lag_3_crime_count",
    "rolling_3_month_avg",
    "crime_trend"
]

CATEGORICAL_FEATURES = [
    "district",
    "police_station"
]

NUMERIC_FEATURES = [
    "year",
    "month",
    "high_severity_count",
    "latitude",
    "longitude",
    "previous_month_crime_count",
    "lag_2_crime_count",
    "lag_3_crime_count",
    "rolling_3_month_avg",
    "crime_trend"
]

TARGET = "next_month_crime_count"


def create_preprocessor():
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES
            ),
            (
                "numeric",
                "passthrough",
                NUMERIC_FEATURES
            )
        ]
    )


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    pipeline = Pipeline(
        steps=[
            ("preprocessor", create_preprocessor()),
            ("model", model)
        ]
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

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

    return {
        "name": name,
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    }


def compare_models():
    data = prepare_training_data()

    train_data = data[data["year"] < 2023].copy()
    test_data = data[data["year"] == 2023].copy()

    X_train = train_data[FEATURES]
    y_train = train_data[TARGET]

    X_test = test_data[FEATURES]
    y_test = test_data[TARGET]

    print("Training samples:", len(X_train))
    print("Testing samples:", len(X_test))

    # Persistence baseline
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

    models = [
        (
            "Random Forest",
            RandomForestRegressor(
                n_estimators=200,
                random_state=42,
                n_jobs=-1
            )
        ),
        (
            "Extra Trees",
            ExtraTreesRegressor(
                n_estimators=200,
                random_state=42,
                n_jobs=-1
            )
        ),
        (
            "Gradient Boosting",
            GradientBoostingRegressor(
                n_estimators=200,
                random_state=42
            )
        )
    ]

    results = []

    for name, model in models:
        print(f"\nTraining {name}...")

        result = evaluate_model(
            name,
            model,
            X_train,
            y_train,
            X_test,
            y_test
        )

        results.append(result)

    print("\nModel comparison")
    print("-------------------------------------------------------")
    print(
        f"{'Model':<20}"
        f"{'MAE':>10}"
        f"{'RMSE':>10}"
        f"{'R²':>10}"
    )
    print("-------------------------------------------------------")

    print(
        f"{'Naive Baseline':<20}"
        f"{baseline_mae:>10.2f}"
        f"{baseline_rmse:>10.2f}"
        f"{baseline_r2:>10.3f}"
    )

    for result in results:
        print(
            f"{result['name']:<20}"
            f"{result['mae']:>10.2f}"
            f"{result['rmse']:>10.2f}"
            f"{result['r2']:>10.3f}"
        )

    best_model = min(
        results,
        key=lambda result: result["mae"]
    )

    improvement = (
        (baseline_mae - best_model["mae"])
        / baseline_mae
    ) * 100

    print("\nBest model:", best_model["name"])
    print(
        f"MAE improvement over baseline: "
        f"{improvement:.2f}%"
    )


if __name__ == "__main__":
    compare_models()