from datetime import datetime

from app.database import database


cases = [
    {
        "fir_number": "FIR-2026-0001",
        "crime_type": "Burglary",
        "description": "Burglary reported at a commercial establishment.",
        "district": "Ernakulam",
        "police_station": "Ernakulam Central Police Station",
        "latitude": 9.9816,
        "longitude": 76.2999,
        "incident_date": datetime(2026, 7, 10, 22, 30),
        "status": "Under Investigation",
        "severity": "High"
    },
    {
        "fir_number": "FIR-2026-0002",
        "crime_type": "Theft",
        "description": "Mobile phone theft reported near a public transport area.",
        "district": "Ernakulam",
        "police_station": "Ernakulam Central Police Station",
        "latitude": 9.9880,
        "longitude": 76.2800,
        "incident_date": datetime(2026, 7, 12, 18, 15),
        "status": "Resolved",
        "severity": "Medium"
    },
    {
        "fir_number": "FIR-2026-0003",
        "crime_type": "Cyber Crime",
        "description": "Online financial fraud complaint registered.",
        "district": "Ernakulam",
        "police_station": "Cyber Crime Police Station",
        "latitude": 10.0159,
        "longitude": 76.3419,
        "incident_date": datetime(2026, 7, 14, 11, 0),
        "status": "Under Investigation",
        "severity": "High"
    },
    {
        "fir_number": "FIR-2026-0004",
        "crime_type": "Theft",
        "description": "Two-wheeler theft reported from a parking area.",
        "district": "Thrissur",
        "police_station": "Thrissur East Police Station",
        "latitude": 10.5276,
        "longitude": 76.2144,
        "incident_date": datetime(2026, 7, 8, 20, 45),
        "status": "Unsolved",
        "severity": "Medium"
    },
    {
        "fir_number": "FIR-2026-0005",
        "crime_type": "Burglary",
        "description": "Residential burglary reported during nighttime.",
        "district": "Thrissur",
        "police_station": "Thrissur West Police Station",
        "latitude": 10.5210,
        "longitude": 76.2050,
        "incident_date": datetime(2026, 7, 15, 2, 10),
        "status": "Under Investigation",
        "severity": "High"
    },
    {
        "fir_number": "FIR-2026-0006",
        "crime_type": "Theft",
        "description": "Personal belongings reported stolen in a crowded area.",
        "district": "Kozhikode",
        "police_station": "Kasaba Police Station",
        "latitude": 11.2588,
        "longitude": 75.7804,
        "incident_date": datetime(2026, 7, 9, 17, 20),
        "status": "Resolved",
        "severity": "Low"
    },
    {
        "fir_number": "FIR-2026-0007",
        "crime_type": "Assault",
        "description": "Physical assault complaint registered following an altercation.",
        "district": "Kozhikode",
        "police_station": "Town Police Station",
        "latitude": 11.2500,
        "longitude": 75.7700,
        "incident_date": datetime(2026, 7, 16, 21, 40),
        "status": "Under Investigation",
        "severity": "High"
    },
    {
        "fir_number": "FIR-2026-0008",
        "crime_type": "Cyber Crime",
        "description": "Phishing-related financial fraud complaint registered.",
        "district": "Thiruvananthapuram",
        "police_station": "Cyber Crime Police Station",
        "latitude": 8.5241,
        "longitude": 76.9366,
        "incident_date": datetime(2026, 7, 11, 10, 30),
        "status": "Under Investigation",
        "severity": "Medium"
    },
    {
        "fir_number": "FIR-2026-0009",
        "crime_type": "Burglary",
        "description": "Break-in reported at a residential property.",
        "district": "Thiruvananthapuram",
        "police_station": "Museum Police Station",
        "latitude": 8.5100,
        "longitude": 76.9500,
        "incident_date": datetime(2026, 7, 17, 1, 25),
        "status": "Unsolved",
        "severity": "High"
    },
    {
        "fir_number": "FIR-2026-0010",
        "crime_type": "Theft",
        "description": "Property theft complaint registered.",
        "district": "Thiruvananthapuram",
        "police_station": "Cantonment Police Station",
        "latitude": 8.5000,
        "longitude": 76.9400,
        "incident_date": datetime(2026, 7, 18, 15, 0),
        "status": "Resolved",
        "severity": "Low"
    }
]


inserted = 0
skipped = 0

for case in cases:
    existing_case = database.cases.find_one(
        {"fir_number": case["fir_number"]}
    )

    if existing_case:
        skipped += 1
        print(f"Skipped: {case['fir_number']}")
    else:
        database.cases.insert_one(case)
        inserted += 1
        print(f"Inserted: {case['fir_number']}")


print("\nDatabase seeding completed.")
print(f"Inserted: {inserted}")
print(f"Skipped: {skipped}")