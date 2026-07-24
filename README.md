# CrimeLens AI

CrimeLens AI is an AI-powered crime intelligence and investigative assistance platform designed to support crime data management, analysis, visualization, forecasting, hotspot identification, and case-linkage analysis.

The system combines a React-based frontend, a FastAPI backend, MongoDB Atlas, and machine-learning-based crime forecasting into a unified crime intelligence dashboard.

## Features

### Crime Case Management

- Create, view, update, and delete crime cases
- Search and filter case records
- Track FIR number, crime type, district, police station, incident date, status, and severity
- MongoDB-backed persistent case storage

### Crime Analytics

- Overall crime statistics
- District-wise crime analysis
- Crime-type distribution
- Severity analysis
- Case-status analysis
- Interactive analytical charts and dashboard visualizations

### Crime Hotspot Detection

- Identifies locations with higher concentrations of reported crimes
- Groups crime records by district and police station
- Ranks hotspot locations using case statistics
- Provides geographical information for hotspot analysis

### Crime Risk Analysis

- District-level crime risk assessment
- Uses available crime statistics to estimate relative risk
- Supports Low, Medium, and High risk classification

### ML Crime Forecasting

CrimeLens AI includes a supervised machine-learning pipeline for forecasting next-month crime counts.

Predictions are generated at the police-station level and can also be aggregated to produce district-level forecasts.

The forecasting pipeline uses:

- Historical monthly crime counts
- Previous-month crime count
- Multi-month lag features
- Rolling crime averages
- Crime trends
- High-severity crime counts
- Geographic information
- District and police-station information

The production model uses `RandomForestRegressor`.

Current evaluation on the time-based test set:

| Metric | Random Forest | Naive Baseline |
| --- | ---: | ---: |
| MAE | 5.18 | 6.26 |
| RMSE | 7.26 | 8.29 |
| R² | 0.229 | -0.004 |

The Random Forest model improves MAE by approximately **17.20%** compared with the naive persistence baseline.

Predictions are analytical estimates and should not be interpreted as exact future crime counts.

### Case Linkage Analysis

CrimeLens AI can identify potentially related crime cases.

Cases are compared using factors including:

- Crime type
- District
- Police station
- Incident-date proximity

A linkage score is calculated and classified as:

- Low
- Medium
- High

The interface also explains the factors that contributed to each linkage score.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- JavaScript

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- PyMongo
- MongoDB Atlas

### Machine Learning

- Scikit-learn
- Pandas
- Joblib
- Random Forest Regression

## Architecture

```text
React Frontend
      |
      | HTTP / REST API
      v
FastAPI Backend
      |
      +-------------------+
      |                   |
      v                   v
MongoDB Atlas       ML Prediction Service
      |                   |
      |                   v
      |            Random Forest Model
      |
      +-- cases
      |
      +-- historical_cases
```

The operational crime records and historical ML dataset are stored separately.

- `cases` contains crime records used by the application.
- `historical_cases` contains historical records used by the forecasting pipeline.

## Project Structure

```text
CrimeLens_AI/
|
|-- backend/
|   |-- app/
|   |   |-- ml/
|   |   |   |-- models/
|   |   |   `-- training/
|   |   |
|   |   |-- routers/
|   |   |   |-- analytics.py
|   |   |   |-- cases.py
|   |   |   |-- hotspots.py
|   |   |   |-- linkage.py
|   |   |   |-- predictions.py
|   |   |   `-- risk.py
|   |   |
|   |   |-- services/
|   |   |-- utils/
|   |   |-- database.py
|   |   |-- main.py
|   |   `-- schemas.py
|   |
|   |-- seed.py
|   |-- seed_historical_data.py
|   |-- requirements.txt
|   `-- README.md
|
|-- data/
|   `-- crimelens_karnataka_dataset_v2_ml_ready.csv
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   |   `-- services/
|   |
|   |-- package.json
|   `-- vite.config.js
|
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` using `.env.example` as the reference.

Do not commit credentials or the `.env` file.

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

Interactive Swagger documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Historical Dataset Setup

The ML-ready historical dataset is located at:

```text
data/crimelens_karnataka_dataset_v2_ml_ready.csv
```

Load it into MongoDB using:

```bash
cd backend
python seed_historical_data.py
```

This populates the:

```text
historical_cases
```

collection.

The dataset contains approximately 50,000 historical crime records.

## Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend is normally available at:

```text
http://localhost:5173
```

To create a production build:

```bash
npm run build
```

## Main API Endpoints

| Feature | Endpoint |
| --- | --- |
| Cases | `GET /api/cases` |
| Create Case | `POST /api/cases` |
| Case Details | `GET /api/cases/{case_id}` |
| Update Case | `PUT /api/cases/{case_id}` |
| Delete Case | `DELETE /api/cases/{case_id}` |
| Analytics Summary | `GET /api/analytics/summary` |
| District Analytics | `GET /api/analytics/districts` |
| Crime Type Analytics | `GET /api/analytics/crime-types` |
| Severity Analytics | `GET /api/analytics/severity` |
| Status Analytics | `GET /api/analytics/status` |
| District Risk | `GET /api/risk/district` |
| Hotspots | `GET /api/hotspots` |
| Station Prediction | `GET /api/predictions/station` |
| District Prediction | `GET /api/predictions/district` |
| Case Linkage | `GET /api/linkage/{case_id}` |

Complete API documentation and request parameters are available through Swagger UI.

## ML Training

ML training utilities are located in:

```text
backend/app/ml/training/
```

Prepare training data:

```bash
python app/ml/training/prepare_training_data.py
```

Compare candidate models:

```bash
python app/ml/training/compare_models.py
```

Train the production model:

```bash
python app/ml/training/train_risk_model.py
```

The trained model is stored at:

```text
backend/app/ml/models/crime_risk_model.joblib
```

## Testing

The backend APIs have been tested through FastAPI Swagger UI.

Integration testing includes:

- MongoDB connectivity
- Case CRUD operations
- Case filtering
- Analytics endpoints
- Risk assessment
- Hotspot detection
- Station-level ML prediction
- District-level ML prediction
- Case linkage analysis
- Frontend/backend API communication

The frontend production build can be verified using:

```bash
npm run build
```

## Current Status

The major CrimeLens AI components are integrated:

- Backend API
- MongoDB database
- Crime analytics
- Crime risk assessment
- Hotspot detection
- ML forecasting
- Case linkage analysis
- React frontend
- Interactive dashboards
- Case management interface

## Future Improvements

Potential extensions include:

- Authentication and role-based access control
- Advanced geospatial crime mapping
- More sophisticated case-linkage models
- Improved forecasting models and larger datasets
- Explainable AI for crime predictions
- Real-time crime-data ingestion
- Deployment and cloud hosting
- Automated testing and CI/CD

## Disclaimer

CrimeLens AI is an academic and analytical project.

Crime forecasts, risk classifications, hotspot results, and case-linkage scores are computational estimates based on available data and should not be treated as definitive evidence or used as the sole basis for law-enforcement decisions.

## License

See the `LICENSE` file for licensing information.