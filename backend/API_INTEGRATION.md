\# CrimeLens AI - Frontend API Integration



\## Base URL



Local FastAPI server:



http://127.0.0.1:8000



Swagger:



http://127.0.0.1:8000/docs





\## Dashboard



\### Summary Cards



GET /api/analytics/summary



Use for:

\- Total cases

\- High severity cases

\- Unsolved cases

\- Crime type summary





\## Analytics



GET /api/analytics/districts



Use for:

\- District-wise crime chart





GET /api/analytics/crime-types



Use for:

\- Crime type distribution chart





GET /api/analytics/severity



Use for:

\- Low / Medium / High severity chart





GET /api/analytics/status



Use for:

\- Case status chart





\## Cases



\### Get Cases



GET /api/cases



Optional filters:



\- district

\- crime\_type

\- case\_status

\- severity



Example:



GET /api/cases?district=Ernakulam\&severity=High





\### Get Single Case



GET /api/cases/{case\_id}





\### Create Case



POST /api/cases



Example body:



{

&#x20; "fir\_number": "FIR-2026-001",

&#x20; "crime\_type": "Theft",

&#x20; "description": "Case description",

&#x20; "district": "Ernakulam",

&#x20; "police\_station": "Central Police Station",

&#x20; "latitude": 9.9816,

&#x20; "longitude": 76.2999,

&#x20; "incident\_date": "2026-07-23T10:30:00",

&#x20; "status": "Under Investigation",

&#x20; "severity": "Medium"

}





\### Update Case



PUT /api/cases/{case\_id}





\### Delete Case



DELETE /api/cases/{case\_id}





\## District Risk



GET /api/risk/district?district=Ernakulam



Use for:

\- District risk score

\- Risk level

\- Total cases





\## Crime Hotspots



GET /api/hotspots



Use for:

\- Hotspot map markers

\- Police station hotspot ranking

\- Risk visualization



Each hotspot contains information including:



\- district

\- police\_station

\- latitude

\- longitude

\- total\_cases

\- high\_severity\_cases

\- hotspot\_score

\- risk\_level





\## Health Check



GET /health



Used to check whether the backend and MongoDB are available.





\## Validation



Severity values:



\- Low

\- Medium

\- High



Case status values:



\- Under Investigation

\- Solved

\- Unsolved

\- Closed



Latitude:



\- -90 to 90



Longitude:



\- -180 to 180





\## Common HTTP Responses



200 - Request successful



201 - Case created successfully



400 - Invalid case ID



404 - Case not found



409 - FIR number already exists



422 - Invalid request data



503 - Database temporarily unavailable

