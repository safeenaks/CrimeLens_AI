# CrimeLens AI

CrimeLens AI is an AI-powered crime intelligence and investigative assistance platform designed to support crime data management, analysis, visualization, forecasting, hotspot identification, criminal network analysis, and natural-language investigation.

The system combines a React-based frontend, FastAPI backend, MongoDB Atlas, machine-learning-based crime forecasting, and AI-assisted crime intelligence into a unified platform.

## Key Features

### Crime Case Management

- Create, view, update, and delete crime cases
- Search and filter crime records
- Track FIR number, crime type, district, police station, incident date, status, and severity
- MongoDB-backed persistent case storage

### AI Crime Forecasting

CrimeLens AI includes a supervised machine-learning pipeline for forecasting next-month crime counts.

Predictions are generated at the police-station level and aggregated to provide district-level forecasts.

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

The dashboard provides:

- District selection
- Predicted next-month crime count
- Number of police stations analyzed
- Low, Medium, and High risk summaries

Predictions are analytical estimates and should not be interpreted as exact future crime counts.

### AI Investigator

CrimeLens AI includes a natural-language investigative assistant that allows investigators to interact with crime data conversationally.

Instead of manually navigating multiple dashboards or database records, investigators can ask questions such as:

- Which district has the highest number of crimes?
- What are the top crime types?
- Which police station has the most cases?
- How many high-severity cases are there?

The AI Investigator provides:

- Natural-language crime queries
- Responses generated from verified CrimeLens data
- Context-aware conversations
- Suggested investigative questions
- English and Kannada support
- Voice-enabled interaction
- Text-to-speech response playback
- PDF conversation export

The AI Investigator is designed as a decision-support tool and does not replace investigator judgement.

### Crime Analytics

CrimeLens AI provides interactive crime statistics and visual analytics including:

- Overall crime statistics
- District-wise crime analysis
- Crime-type distribution
- Severity distribution
- Case-status analysis
- Interactive charts and dashboard visualizations

### Socio-Demographic Insights

CrimeLens AI analyzes historical crime records to identify demographic patterns associated with recorded victims.

The demographic intelligence module includes:

- Total historical records analyzed
- Victim age-data coverage
- Victim gender distribution
- Victim age-group distribution
- High-severity cases by victim gender
- Crime-type and victim-gender patterns

The historical dataset currently contains approximately **50,000 crime records**, allowing demographic patterns to be explored separately from the smaller operational case collection.

### Crime Hotspot Detection

CrimeLens AI identifies locations with higher concentrations of reported crimes.

The hotspot module:

- Groups crime records by district and police station
- Calculates crime concentration statistics
- Identifies high-severity case concentrations
- Ranks hotspot locations
- Provides geographical coordinates for visualization

### Crime Risk Analysis

CrimeLens AI provides district-level crime risk assessment based on available crime statistics.

Risk levels are classified as:

- Low
- Medium
- High

These classifications provide analytical indicators for comparing crime conditions across locations.

### Criminal Network & Case Linkage Analysis

CrimeLens AI identifies potentially related crime cases using evidence-based linkage analysis.

Cases are compared using factors including:

- Crime type
- District
- Police station
- Incident-date proximity
- Other available case characteristics

A linkage score is calculated to estimate the strength of the relationship between cases.

The criminal network analysis interface provides:

- Investigation case selection
- Configurable minimum linkage score
- Related-case identification
- Interactive criminal network visualization
- Linkage-strength analysis
- Explanation of factors contributing to case relationships

This allows investigators to explore possible relationships between incidents that may otherwise appear independent.

---

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

### Machine Learning & Data Analysis

- Scikit-learn
- Pandas
- Joblib
- Random Forest Regression

---

## System Architecture

```text
                    CrimeLens AI
                         |
              +----------+----------+
              |                     |
              v                     v
       React Frontend         FastAPI Backend
                                    |
                  +-----------------+-----------------+
                  |                 |                 |
                  v                 v                 v
            MongoDB Atlas     Analytics Engine    AI Investigator
                  |
          +-------+-------+
          |               |
          v               v
        cases      historical_cases
                          |
                          v
                  ML Prediction Service
                          |
                          v
                  Random Forest Model
```

Operational crime records and the historical ML dataset are stored separately.

- `cases` contains operational crime records used by the application.
- `historical_cases` contains historical records used by forecasting and demographic analytics.

---

## Project Structure

```text
CrimeLens_AI/
|
|-- backend/
|   |-- app/
|   |   |
|   |   |-- ml/
|   |   |   |-- models/
|   |   |   `-- training/
|   |   |
|   |   |-- routers/
|   |   |   |-- analytics.py
|   |   |   |-- cases.py
|   |   |   |-- hotspots.py
|   |   |   |-- investigator.py
|   |   |   |-- linkage.py
|   |   |   |-- predictions.py
|   |   |   `-- risk.py
|   |   |
|   |   |-- services/
|   |   |   `-- investigator_service.py
|   |   |
|   |   |-- utils/
|   |   |-- config.py
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
|   |
|   |-- src/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |   |-- Analytics.jsx
|   |   |   |-- CaseLinkage.jsx
|   |   |   |-- Cases.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Hotspots.jsx
|   |   |   |-- Investigator.jsx
|   |   |   |-- Landing.jsx
|   |   |   |-- Login.jsx
|   |   |   `-- Settings.jsx
|   |   |
|   |   `-- services/
|   |
|   |-- package.json
|   `-- vite.config.js
|
|-- .gitignore
|-- LICENSE
`-- README.md
```

---

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

The backend runs locally at:

```text
http://127.0.0.1:8000
```

Swagger documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Historical Dataset Setup

The ML-ready historical dataset is located at:

```text
data/crimelens_karnataka_dataset_v2_ml_ready.csv
```

Load the historical records into MongoDB:

```bash
cd backend
python seed_historical_data.py
```

This populates the:

```text
historical_cases
```

collection.

The dataset contains approximately **50,000 historical crime records**.

The historical collection supports:

- ML crime forecasting
- Historical crime analysis
- Victim demographic analysis
- Crime-pattern intelligence

---

## Frontend Setup

Navigate to:

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

Create a production build using:

```bash
npm run build
```

---

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
| Demographic Analytics | `GET /api/analytics/demographics` |
| Hotspots | `GET /api/hotspots` |
| District Risk | `GET /api/risk/district` |
| Station Prediction | `GET /api/predictions/station` |
| District Prediction | `GET /api/predictions/district` |
| Case Linkage | `GET /api/linkage/{case_id}` |
| Linkage Network | `GET /api/linkage/{case_id}/network` |
| AI Investigator | `POST /api/investigator/ask` |

Complete API documentation and request parameters are available through FastAPI Swagger UI.

---

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

---

## Testing

Backend APIs have been tested through FastAPI Swagger UI.

Integration testing includes:

- MongoDB connectivity
- Case CRUD operations
- Case filtering
- Crime analytics
- Socio-demographic analytics
- Risk assessment
- Hotspot detection
- Station-level ML prediction
- District-level ML prediction
- Case linkage analysis
- Criminal network analysis
- AI Investigator queries
- Frontend/backend API communication

The frontend production build can be verified using:

```bash
npm run build
```

---

## Deployment

CrimeLens AI has been deployed as a full-stack web application.

The deployment architecture consists of:

```text
User
  |
  v
Deployed React Frontend
  |
  | REST API
  v
Deployed FastAPI Backend
  |
  v
MongoDB Atlas
```

The deployed application provides access to the major CrimeLens AI functionality, including crime forecasting, analytics, case management, hotspot analysis, criminal network analysis, and the AI Investigator.

---

## Current Status

The major CrimeLens AI components are implemented and integrated:

- Crime case management
- MongoDB database integration
- Crime analytics dashboard
- Socio-demographic intelligence
- Crime risk assessment
- Hotspot detection
- ML-based crime forecasting
- Police-station and district predictions
- Case linkage analysis
- Interactive criminal network analysis
- AI Investigator
- Natural-language crime queries
- Context-aware conversations
- English and Kannada interaction
- Voice interaction and response playback
- PDF conversation export
- React frontend
- FastAPI backend
- Production deployment

---

## Future Improvements

Potential extensions include:

- Authentication and role-based access control
- Advanced geospatial crime mapping
- More sophisticated case-linkage models
- Improved forecasting models and larger datasets
- Explainable AI for crime predictions
- Real-time crime-data ingestion
- Automated testing and CI/CD
- Additional regional-language support
- Advanced investigative report generation

---

## Disclaimer

CrimeLens AI is an academic and analytical project.

Crime forecasts, risk classifications, hotspot results, demographic patterns, AI-generated responses, and case-linkage scores are computational estimates derived from available data.

They should support, not replace, investigator judgement and should not be treated as definitive evidence or used as the sole basis for law-enforcement decisions.

---

## License

See the `LICENSE` file for licensing information.