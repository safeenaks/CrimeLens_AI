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
  getDemographicAnalytics,
} from "../services/api";


function Analytics() {
  const [districts, setDistricts] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [demographics, setDemographics] = useState(null);

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
          demographicData,
        ] = await Promise.all([
          getDistrictAnalytics(),
          getCrimeTypeAnalytics(),
          getSeverityAnalytics(),
          getStatusAnalytics(),
          getDemographicAnalytics(),
        ]);

        setDistricts(districtData);
        setCrimeTypes(crimeTypeData);
        setSeverity(severityData);
        setStatuses(statusData);
        setDemographics(demographicData);

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
      <div className="text-slate-400">
        Loading analytics...
      </div>
    );
  }


  if (error) {
    return (
      <div className="text-red-400">
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

  const genderColors = [
    "#06b6d4",
    "#8b5cf6",
    "#64748b",
    "#22c55e",
  ];


  const knownAgePercentage =
    demographics?.total_records
      ? (
          (
            demographics.known_age_records /
            demographics.total_records
          ) * 100
        ).toFixed(1)
      : "0.0";


  return (
    <div>

      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="mb-8">

        <h1 className="text-2xl font-semibold text-white">
          Crime Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Crime statistics, distributions and
          socio-demographic intelligence
        </p>

      </div>


      {/* ================================================= */}
      {/* Existing Crime Analytics */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Crime Type Distribution */}

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


        {/* Severity Distribution */}

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
                  labelStyle={{
                    color: "#ffffff",
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


      {/* ================================================= */}
      {/* Socio-Demographic Intelligence */}
      {/* ================================================= */}

      {demographics && (
        <>

          <div className="mb-6 mt-12">

            <h2 className="text-xl font-semibold text-white">
              Socio-Demographic Insights
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Victim demographic patterns derived from
              historical crime records
            </p>

          </div>


          {/* Summary Cards */}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Historical Records
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {demographics.total_records?.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Records analyzed
              </p>

            </div>


            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Known Victim Ages
              </p>

              <p className="mt-2 text-2xl font-bold text-cyan-400">
                {demographics.known_age_records?.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Records with valid age information
              </p>

            </div>


            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Age Data Coverage
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {knownAgePercentage}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Historical records with known victim age
              </p>

            </div>

          </div>


          {/* Demographic Charts */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Gender Distribution */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

              <h3 className="mb-2 text-lg font-semibold text-white">
                Victim Gender Distribution
              </h3>

              <p className="mb-5 text-sm text-slate-400">
                Distribution of historical cases by
                recorded victim gender
              </p>

              <div className="h-80">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={demographics.gender_distribution}
                      dataKey="total_cases"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label={({ gender }) => gender}
                    >

                      {demographics.gender_distribution.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.gender}-${index}`}
                            fill={
                              genderColors[
                                index % genderColors.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

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

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* Age Distribution */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

              <h3 className="mb-2 text-lg font-semibold text-white">
                Victim Age Distribution
              </h3>

              <p className="mb-5 text-sm text-slate-400">
                Cases grouped by known victim age
              </p>

              <div className="h-80">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={demographics.age_distribution}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                    />

                    <XAxis
                      dataKey="age_group"
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
                      name="Cases"
                      fill="#06b6d4"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* High Severity by Gender */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

              <h3 className="mb-2 text-lg font-semibold text-white">
                High-Severity Cases by Gender
              </h3>

              <p className="mb-5 text-sm text-slate-400">
                Victim gender distribution among
                high-severity incidents
              </p>

              <div className="h-80">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      demographics.high_severity_by_gender
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                    />

                    <XAxis
                      dataKey="gender"
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
                      dataKey="high_severity_cases"
                      name="High Severity Cases"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* Crime Types by Gender */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

              <h3 className="mb-2 text-lg font-semibold text-white">
                Crime Patterns by Victim Gender
              </h3>

              <p className="mb-5 text-sm text-slate-400">
                Most frequent crime-type and victim-gender
                combinations
              </p>

              <div className="max-h-80 overflow-y-auto">

                {demographics.crime_types_by_gender?.length === 0 ? (

                  <p className="text-sm text-slate-400">
                    No demographic crime pattern data
                    available.
                  </p>

                ) : (

                  <div className="space-y-3">

                    {demographics.crime_types_by_gender.map(
                      (item, index) => (

                        <div
                          key={`${item.gender}-${item.crime_type}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3"
                        >

                          <div>

                            <p className="font-medium text-white">
                              {item.crime_type}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Victim gender: {item.gender}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-semibold text-cyan-400">
                              {item.total_cases?.toLocaleString()}
                            </p>

                            <p className="text-xs text-slate-500">
                              cases
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

          </div>

        </>
      )}

    </div>
  );
}


export default Analytics;