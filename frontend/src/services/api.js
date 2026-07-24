const API_BASE_URL = "http://127.0.0.1:8000";

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    let message = "API request failed";

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Response did not contain JSON error details
    }

    throw new Error(message);
  }

  return response.json();
}

// Analytics

export function getAnalyticsSummary() {
  return request("/api/analytics/summary");
}

export function getDistrictAnalytics() {
  return request("/api/analytics/districts");
}

export function getCrimeTypeAnalytics() {
  return request("/api/analytics/crime-types");
}

export function getSeverityAnalytics() {
  return request("/api/analytics/severity");
}

export function getStatusAnalytics() {
  return request("/api/analytics/status");
}

// Hotspots

export function getHotspots() {
  return request("/api/hotspots");
}

// Risk

export function getDistrictRisk(district) {
  return request(
    `/api/risk/district?district=${encodeURIComponent(district)}`
  );
}

// ML Predictions

export function getStationPrediction(policeStation) {
  return request(
    `/api/predictions/station?police_station=${encodeURIComponent(
      policeStation
    )}`
  );
}

export function getDistrictPrediction(district) {
  return request(
    `/api/predictions/district?district=${encodeURIComponent(
      district
    )}`
  );
}