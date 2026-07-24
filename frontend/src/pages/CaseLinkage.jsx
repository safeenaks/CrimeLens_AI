import { useEffect, useState } from "react";
import { getCases, getCaseLinkage } from "../services/api";

function CaseLinkage() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [linkageData, setLinkageData] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await getCases();
        setCases(data);

        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCases(false);
      }
    }

    loadCases();
  }, []);

  async function handleAnalyze() {
    if (!selectedCaseId) {
      return;
    }

    try {
      setAnalyzing(true);
      setError("");

      const data = await getCaseLinkage(selectedCaseId);

      setLinkageData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function getLinkageColor(level) {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-slate-300";
    }
  }

  if (loadingCases) {
    return (
      <div className="p-8">
        <p className="text-slate-400">
          Loading cases...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Case Linkage Analysis
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Identify potentially related crime cases
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Select Case
        </h2>

        <div className="flex flex-col gap-4 md:flex-row">
          <select
            value={selectedCaseId}
            onChange={(event) => {
              setSelectedCaseId(event.target.value);
              setLinkageData(null);
            }}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none"
          >
            {cases.map((crimeCase) => (
              <option
                key={crimeCase.id}
                value={crimeCase.id}
              >
                {crimeCase.fir_number} - {crimeCase.crime_type} -{" "}
                {crimeCase.district}
              </option>
            ))}
          </select>

          <button
            onClick={handleAnalyze}
            disabled={!selectedCaseId || analyzing}
            className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Analyze Linkage"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      {linkageData && (
        <>
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Source Case
            </h2>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-400">
                    FIR Number
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {linkageData.source_case.fir_number}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Crime Type
                  </p>

                  <p className="mt-1 text-white">
                    {linkageData.source_case.crime_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    District
                  </p>

                  <p className="mt-1 text-white">
                    {linkageData.source_case.district}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Police Station
                  </p>

                  <p className="mt-1 text-white">
                    {linkageData.source_case.police_station}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Potentially Linked Cases
            </h2>

            <p className="text-sm text-slate-400">
              {linkageData.total_linked_cases} matches found
            </p>
          </div>

          {linkageData.linked_cases.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
              No related cases were identified.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800">
                    <tr className="text-sm text-slate-300">
                      <th className="px-5 py-4">
                        FIR Number
                      </th>

                      <th className="px-5 py-4">
                        Crime Type
                      </th>

                      <th className="px-5 py-4">
                        District
                      </th>

                      <th className="px-5 py-4">
                        Police Station
                      </th>

                      <th className="px-5 py-4">
                        Score
                      </th>

                      <th className="px-5 py-4">
                        Linkage
                      </th>

                      <th className="px-5 py-4">
                        Reasons
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {linkageData.linked_cases.map((linkedCase) => (
                      <tr
                        key={linkedCase.id}
                        className="border-t border-slate-700 text-sm"
                      >
                        <td className="px-5 py-4 font-semibold text-white">
                          {linkedCase.fir_number}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {linkedCase.crime_type}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {linkedCase.district}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {linkedCase.police_station}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-cyan-400">
                            {linkedCase.linkage_score}
                          </span>
                          <span className="text-slate-500">
                            /100
                          </span>
                        </td>

                        <td
                          className={`px-5 py-4 font-semibold ${getLinkageColor(
                            linkedCase.linkage_level
                          )}`}
                        >
                          {linkedCase.linkage_level}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-56 flex-wrap gap-2">
                            {linkedCase.reasons.map(
                              (reason, index) => (
                                <span
                                  key={`${linkedCase.id}-${index}`}
                                  className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300"
                                >
                                  {reason}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CaseLinkage;