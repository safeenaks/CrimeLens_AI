import { useEffect, useState } from "react";
import {
  getAnalyticsSummary,
  getDistrictPrediction,
  getPredictionDistricts,
} from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [error, setError] = useState("");
  const [predictionError, setPredictionError] =
    useState("");

  const [predictionLoading, setPredictionLoading] =
    useState(false);


  // Load dashboard analytics
  

  // Load ML prediction whenever district changes
  // Load dashboard analytics and available ML districts

useEffect(() => {
  if (!selectedDistrict) {
    return;
  }

  async function loadPrediction() {
    try {
      setPredictionLoading(true);
      setPredictionError("");
      setPrediction(null);

      const predictionData =
        await getDistrictPrediction(
          selectedDistrict
        );

      setPrediction(predictionData);
    } catch (err) {
      setPredictionError(err.message);
    } finally {
      setPredictionLoading(false);
    }
  }

  loadPrediction();
}, [selectedDistrict]);

useEffect(() => {
  async function loadDashboard() {
    try {
      const [summaryData, districtData] =
        await Promise.all([
          getAnalyticsSummary(),
          getPredictionDistricts(),
        ]);

      setSummary(summaryData);

      const availableDistricts =
        districtData.districts || [];

      setDistricts(availableDistricts);

      if (availableDistricts.length > 0) {
        const defaultDistrict =
          availableDistricts.includes("Mysuru")
            ? "Mysuru"
            : availableDistricts[0];

        setSelectedDistrict(defaultDistrict);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  loadDashboard();
}, []);

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">
          Failed to load dashboard: {error}
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8">
        <p className="text-slate-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Dashboard heading */}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Crime analysis overview
        </p>
      </div>

      {/* Analytics cards */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            Total Cases
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {summary.total_cases}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            High Severity Cases
          </p>

          <p className="mt-3 text-3xl font-bold text-cyan-400">
            {summary.high_severity_cases}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            Unsolved Cases
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {summary.unsolved_cases}
          </p>
        </div>

      </div>

      {/* AI Forecast section */}

      <div className="mt-10">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold text-white">
            AI Crime Forecast
          </h2>

          {/* District selector */}

          <select
            value={selectedDistrict}
            onChange={(event) =>
              setSelectedDistrict(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            {districts.map((district) => (
              <option
                key={district}
                value={district}
              >
                {district}
              </option>
            ))}
          </select>

        </div>

        {/* Prediction loading */}

        {predictionLoading && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">
              Loading AI prediction...
            </p>
          </div>
        )}

        {/* Prediction error */}

        {predictionError &&
          !predictionLoading && (
            <div className="rounded-xl border border-red-800 bg-slate-900 p-6">
              <p className="text-red-400">
                Failed to load prediction:{" "}
                {predictionError}
              </p>
            </div>
          )}

        {/* District prediction */}

        {prediction &&
          !predictionLoading && (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  District
                </p>

                <h3 className="mt-1 text-2xl font-bold text-white">
                  {prediction.district}
                </h3>

                <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">

                  {/* Predicted crime count */}

                  <div>
                    <p className="text-sm text-slate-400">
                      Predicted Next Month Crimes
                    </p>

                    <p className="mt-2 text-3xl font-bold text-cyan-400">
                      {
                        prediction.predicted_next_month_crime_count
                      }
                    </p>
                  </div>

                  {/* Police station count */}

                  <div>
                    <p className="text-sm text-slate-400">
                      Police Stations
                    </p>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {prediction.station_count}
                    </p>
                  </div>

                  {/* Risk summary */}

                  <div>
                    <p className="text-sm text-slate-400">
                      Risk Summary
                    </p>

                    <div className="mt-2 space-y-1">

                      <p className="text-green-400">
                        Low:{" "}
                        {
                          prediction
                            .risk_summary
                            .low
                        }
                      </p>

                      <p className="text-yellow-400">
                        Medium:{" "}
                        {
                          prediction
                            .risk_summary
                            .medium
                        }
                      </p>

                      <p className="text-red-400">
                        High:{" "}
                        {
                          prediction
                            .risk_summary
                            .high
                        }
                      </p>

                    </div>
                  </div>

                </div>
              </div>

              {/* Police Station Forecasts */}

              <div className="mt-8">

                <h3 className="mb-4 text-lg font-semibold text-white">
                  Police Station Forecasts
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-700">

                  <table className="w-full text-left">

                    <thead className="bg-slate-800">

                      <tr>
                        <th className="px-6 py-4 text-sm font-medium text-slate-300">
                          Police Station
                        </th>

                        <th className="px-6 py-4 text-sm font-medium text-slate-300">
                          Predicted Crimes
                        </th>

                        <th className="px-6 py-4 text-sm font-medium text-slate-300">
                          Risk Level
                        </th>
                      </tr>

                    </thead>

                    <tbody className="bg-slate-900">

                      {prediction.station_predictions.map(
                        (station) => (
                          <tr
                            key={
                              station.police_station
                            }
                            className="border-t border-slate-700"
                          >

                            <td className="px-6 py-4 text-white">
                              {
                                station.police_station
                              }
                            </td>

                            <td className="px-6 py-4 font-semibold text-cyan-400">
                              {
                                station.predicted_count
                              }
                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={
                                  station.risk_level ===
                                  "High"
                                    ? "font-semibold text-red-400"
                                    : station.risk_level ===
                                      "Medium"
                                    ? "font-semibold text-yellow-400"
                                    : "font-semibold text-green-400"
                                }
                              >
                                {
                                  station.risk_level
                                }
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              </div>
            </>
          )}

      </div>
    </div>
  );
}

export default Dashboard;