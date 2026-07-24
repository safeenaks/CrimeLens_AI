import { useEffect, useState } from "react";
import { getHotspots } from "../services/api";

function Hotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHotspots() {
      try {
        const data = await getHotspots();
        setHotspots(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHotspots();
  }, []);

  function getRiskColor(level) {
    const value = level?.toLowerCase();

    if (value === "high") {
      return "text-red-400";
    }

    if (value === "medium") {
      return "text-yellow-400";
    }

    return "text-green-400";
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">
          Loading hotspots...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">
          Failed to load hotspots: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Crime Hotspots
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          High-risk locations identified from crime data
        </p>
      </div>

      {/* Summary */}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            Hotspot Locations
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {hotspots.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            Highest Hotspot Score
          </p>

          <p className="mt-3 text-3xl font-bold text-red-400">
            {hotspots.length > 0
              ? hotspots[0].hotspot_score
              : 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            High Severity Cases
          </p>

          <p className="mt-3 text-3xl font-bold text-cyan-400">
            {hotspots.reduce(
              (total, hotspot) =>
                total + hotspot.high_severity_cases,
              0
            )}
          </p>
        </div>

      </div>

      {/* Hotspot Table */}

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">

        <div className="border-b border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white">
            Hotspot Rankings
          </h2>
        </div>

        {hotspots.length === 0 ? (
          <div className="p-6">
            <p className="text-slate-400">
              No hotspot data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-slate-800">
                <tr className="text-sm text-slate-300">
                  <th className="px-6 py-4">
                    Rank
                  </th>

                  <th className="px-6 py-4">
                    District
                  </th>

                  <th className="px-6 py-4">
                    Police Station
                  </th>

                  <th className="px-6 py-4">
                    Total Cases
                  </th>

                  <th className="px-6 py-4">
                    High Severity
                  </th>

                  <th className="px-6 py-4">
                    Hotspot Score
                  </th>

                  <th className="px-6 py-4">
                    Risk Level
                  </th>
                </tr>
              </thead>

              <tbody>
                {hotspots.map((hotspot, index) => (
                  <tr
                    key={`${hotspot.district}-${hotspot.police_station}`}
                    className="border-t border-slate-700 text-sm"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-300">
                      #{index + 1}
                    </td>

                    <td className="px-6 py-4 text-white">
                      {hotspot.district}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {hotspot.police_station}
                    </td>

                    <td className="px-6 py-4 text-cyan-400">
                      {hotspot.total_cases}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {hotspot.high_severity_cases}
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {hotspot.hotspot_score}
                    </td>

                    <td
                      className={`px-6 py-4 font-semibold ${getRiskColor(
                        hotspot.risk_level
                      )}`}
                    >
                      {hotspot.risk_level || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Hotspots;