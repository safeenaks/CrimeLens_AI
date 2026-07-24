import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getDistrictAnalytics,
  getCrimeTypeAnalytics,
  getSeverityAnalytics,
  getStatusAnalytics,
} from "../services/api";

function Analytics() {
  const [districts, setDistricts] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [
          districtData,
          crimeTypeData,
          severityData,
          statusData,
        ] = await Promise.all([
          getDistrictAnalytics(),
          getCrimeTypeAnalytics(),
          getSeverityAnalytics(),
          getStatusAnalytics(),
        ]);

        setDistricts(districtData);
        setCrimeTypes(crimeTypeData);
        setSeverity(severityData);
        setStatuses(statusData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400">
        Failed to load analytics: {error}
      </div>
    );
  }

  const severityColors = [
    "#ef4444",
    "#facc15",
    "#22c55e",
    "#06b6d4",
  ];

  return (
    <div className="p-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Crime Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Crime statistics and distribution analysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Crime Types */}

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Crime Type Distribution
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeTypes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="crime_type"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="total_cases"
                  fill="#06b6d4"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity */}

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Severity Distribution
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severity}
                  dataKey="total_cases"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {severity.map((entry, index) => (
                    <Cell
                      key={entry.severity}
                      fill={
                        severityColors[
                          index % severityColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Status */}

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Case Status
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statuses}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="status"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="total_cases"
                  fill="#22c55e"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Distribution */}

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Cases by District
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districts}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="district"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="total_cases"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;