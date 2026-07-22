# CrimeLens AI — Backend

Backend API for **CrimeLens AI**, a crime analysis and visualization platform.

The backend provides APIs for crime case management, filtering, analytics, district-level risk assessment, and crime hotspot detection.

## Tech Stack

- Python
- FastAPI
- MongoDB
- PyMongo
- Uvicorn
- Pydantic
- Swagger / OpenAPI

## Features

- Crime case CRUD operations
- Case filtering
- Crime analytics
- District-level risk scoring
- Crime hotspot detection
- MongoDB integration
- Seed data support
- CORS configuration
- Interactive Swagger API documentation

## Setup

### 1. Navigate to the backend

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file inside the `backend` directory and configure the required MongoDB connection settings.

Do not commit `.env` files containing credentials.

### 6. Run the backend

```bash
uvicorn app.main:app --reload
```

The API will run locally on port `8000`.

## API Documentation

FastAPI automatically provides interactive Swagger documentation.

After starting the server, open:

```text
http://127.0.0.1:8000/docs
```

## Main API Capabilities

### Cases

Supports creation, retrieval, updating, deletion, and filtering of crime case records.

### Analytics

Provides aggregated crime statistics and analytical data for the CrimeLens AI dashboard.

### Risk Assessment

```http
GET /api/risk/district
```

Calculates district-level crime risk information.

### Crime Hotspots

```http
GET /api/hotspots
```

Identifies crime hotspot areas based on available crime data.

## Seed Data

Seed data can be used to populate MongoDB with sample crime records for development and API testing.

## CORS

CORS support is configured so the CrimeLens AI frontend can communicate with the FastAPI backend.

## Testing

API endpoints can be tested directly through Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Project

CrimeLens AI