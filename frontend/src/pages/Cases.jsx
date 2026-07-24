import { useEffect, useMemo, useState } from "react";
import {
  createCase,
  deleteCase,
  getCases,
} from "../services/api";

const initialFormData = {
  fir_number: "",
  crime_type: "",
  description: "",
  district: "",
  police_station: "",
  latitude: "",
  longitude: "",
  incident_date: "",
  status: "Under Investigation",
  severity: "Medium",
};

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await getCases();
        setCases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  const districts = useMemo(() => {
    return [
      ...new Set(
        cases
          .map((crimeCase) => crimeCase.district)
          .filter(Boolean)
      ),
    ].sort();
  }, [cases]);

  const crimeTypes = useMemo(() => {
    return [
      ...new Set(
        cases
          .map((crimeCase) => crimeCase.crime_type)
          .filter(Boolean)
      ),
    ].sort();
  }, [cases]);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        cases
          .map((crimeCase) => crimeCase.status)
          .filter(Boolean)
      ),
    ].sort();
  }, [cases]);

  const severities = useMemo(() => {
    return [
      ...new Set(
        cases
          .map((crimeCase) => crimeCase.severity)
          .filter(Boolean)
      ),
    ].sort();
  }, [cases]);

  const filteredCases = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return cases.filter((crimeCase) => {
      const matchesSearch =
        !searchValue ||
        crimeCase.fir_number
          ?.toLowerCase()
          .includes(searchValue) ||
        crimeCase.crime_type
          ?.toLowerCase()
          .includes(searchValue) ||
        crimeCase.district
          ?.toLowerCase()
          .includes(searchValue) ||
        crimeCase.police_station
          ?.toLowerCase()
          .includes(searchValue);

      const matchesDistrict =
        !districtFilter ||
        crimeCase.district === districtFilter;

      const matchesCrimeType =
        !crimeTypeFilter ||
        crimeCase.crime_type === crimeTypeFilter;

      const matchesStatus =
        !statusFilter ||
        crimeCase.status === statusFilter;

      const matchesSeverity =
        !severityFilter ||
        crimeCase.severity === severityFilter;

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesCrimeType &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [
    cases,
    search,
    districtFilter,
    crimeTypeFilter,
    statusFilter,
    severityFilter,
  ]);

  function clearFilters() {
    setSearch("");
    setDistrictFilter("");
    setCrimeTypeFilter("");
    setStatusFilter("");
    setSeverityFilter("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAddCase(event) {
    event.preventDefault();

    setSubmitting(true);
    setActionError("");

    try {
      const caseData = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        incident_date: new Date(
          formData.incident_date
        ).toISOString(),
      };

      const newCase = await createCase(caseData);

      setCases((previous) => [
        newCase,
        ...previous,
      ]);

      setFormData(initialFormData);
      setShowAddForm(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCase(caseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case?"
    );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deleteCase(caseId);

      setCases((previous) =>
        previous.filter(
          (crimeCase) => crimeCase.id !== caseId
        )
      );
    } catch (err) {
      setActionError(err.message);
    }
  }

  function getSeverityColor(severity) {
    switch (severity?.toLowerCase()) {
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

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "resolved":
      case "solved":
      case "closed":
        return "text-green-400";

      case "unsolved":
        return "text-red-400";

      case "under investigation":
        return "text-yellow-400";

      default:
        return "text-slate-300";
    }
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">
          Loading cases...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">
          Failed to load cases: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Crime Cases
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            View and manage registered crime cases
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm((previous) => !previous);
            setActionError("");
          }}
          className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {showAddForm ? "Cancel" : "+ Add Case"}
        </button>
      </div>

      {/* Action Error */}

      {actionError && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-400">
          {actionError}
        </div>
      )}

      {/* Add Case Form */}

      {showAddForm && (
        <form
          onSubmit={handleAddCase}
          className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-6"
        >
          <h2 className="mb-5 text-lg font-semibold text-white">
            Register New Case
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              type="text"
              name="fir_number"
              value={formData.fir_number}
              onChange={handleFormChange}
              placeholder="FIR Number"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="text"
              name="crime_type"
              value={formData.crime_type}
              onChange={handleFormChange}
              placeholder="Crime Type"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleFormChange}
              placeholder="District"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="text"
              name="police_station"
              value={formData.police_station}
              onChange={handleFormChange}
              placeholder="Police Station"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              name="latitude"
              value={formData.latitude}
              onChange={handleFormChange}
              placeholder="Latitude"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              name="longitude"
              value={formData.longitude}
              onChange={handleFormChange}
              placeholder="Longitude"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <input
              type="datetime-local"
              name="incident_date"
              value={formData.incident_date}
              onChange={handleFormChange}
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="Under Investigation">
                Under Investigation
              </option>

              <option value="Solved">
                Solved
              </option>

              <option value="Unsolved">
                Unsolved
              </option>

              <option value="Closed">
                Closed
              </option>
            </select>

            <select
              name="severity"
              value={formData.severity}
              onChange={handleFormChange}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>
            </select>
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Case description"
            required
            rows="4"
            className="mt-4 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Registering..."
                : "Register Case"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormData(initialFormData);
                setActionError("");
              }}
              className="rounded-lg border border-slate-600 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary Cards */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Total Cases
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {cases.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            High Severity
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {
              cases.filter(
                (crimeCase) =>
                  crimeCase.severity?.toLowerCase() ===
                  "high"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Unsolved Cases
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {
              cases.filter(
                (crimeCase) =>
                  crimeCase.status?.toLowerCase() ===
                  "unsolved"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search and Filters */}

      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Search & Filter Cases
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            type="text"
            placeholder="Search FIR, crime, district, station..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />

          <select
            value={districtFilter}
            onChange={(event) =>
              setDistrictFilter(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="">
              All Districts
            </option>

            {districts.map((district) => (
              <option
                key={district}
                value={district}
              >
                {district}
              </option>
            ))}
          </select>

          <select
            value={crimeTypeFilter}
            onChange={(event) =>
              setCrimeTypeFilter(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="">
              All Crime Types
            </option>

            {crimeTypes.map((crimeType) => (
              <option
                key={crimeType}
                value={crimeType}
              >
                {crimeType}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="">
              All Statuses
            </option>

            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="">
              All Severities
            </option>

            {severities.map((severity) => (
              <option
                key={severity}
                value={severity}
              >
                {severity}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Showing {filteredCases.length} of{" "}
          {cases.length} cases
        </p>
      </div>

      {/* Cases Table */}

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-white">
            Case Records
          </h2>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No cases match the selected filters.
          </div>
        ) : (
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
                    Incident Date
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Severity
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCases.map((crimeCase) => (
                  <tr
                    key={crimeCase.id}
                    className="border-t border-slate-700 text-sm transition hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {crimeCase.fir_number}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {crimeCase.crime_type}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {crimeCase.district}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {crimeCase.police_station}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                      {formatDate(
                        crimeCase.incident_date
                      )}
                    </td>

                    <td
                      className={`px-5 py-4 font-medium ${getStatusColor(
                        crimeCase.status
                      )}`}
                    >
                      {crimeCase.status}
                    </td>

                    <td
                      className={`px-5 py-4 font-semibold ${getSeverityColor(
                        crimeCase.severity
                      )}`}
                    >
                      {crimeCase.severity}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteCase(
                            crimeCase.id
                          )
                        }
                        className="rounded-md border border-red-500/50 px-3 py-2 font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
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

export default Cases;