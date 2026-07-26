import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ForceGraph2D from "react-force-graph-2d";

import {
  Network,
  Search,
  ShieldAlert,
  Link2,
  FileText,
} from "lucide-react";

import {
  getCases,
  getCaseLinkage,
  getCaseLinkageNetwork,
} from "../services/api";

function CaseLinkage() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [linkageData, setLinkageData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [minimumScore, setMinimumScore] = useState(40);

  const [loadingCases, setLoadingCases] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const graphRef = useRef(null);
  const graphContainerRef = useRef(null);

  const [graphWidth, setGraphWidth] = useState(800);

  // --------------------------------------------------
  // Load cases
  // --------------------------------------------------

  useEffect(() => {
    async function loadCases() {
      try {
        setError("");

        const data = await getCases();

        setCases(data);

        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      } catch (err) {
        setError(
          err.message || "Unable to load cases."
        );
      } finally {
        setLoadingCases(false);
      }
    }

    loadCases();
  }, []);

  // --------------------------------------------------
  // Resize graph to its container
  // --------------------------------------------------

  useEffect(() => {
    const container = graphContainerRef.current;

    if (!container) {
      return;
    }

    function updateGraphWidth() {
      const width = container.clientWidth;

      if (width > 0) {
        setGraphWidth(width);
      }
    }

    updateGraphWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateGraphWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [networkData]);

  // --------------------------------------------------
  // Analyze linkage
  // --------------------------------------------------

  async function handleAnalyze() {
    if (!selectedCaseId) {
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setSelectedNode(null);

      const [linkageResult, networkResult] =
        await Promise.all([
          getCaseLinkage(selectedCaseId),

          getCaseLinkageNetwork(
            selectedCaseId,
            minimumScore
          ),
        ]);

      setLinkageData(linkageResult);
      setNetworkData(networkResult);

      setTimeout(() => {
        graphRef.current?.zoomToFit(
          600,
          80
        );
      }, 500);
    } catch (err) {
      setError(
        err.message ||
          "Unable to perform case linkage analysis."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // --------------------------------------------------
  // Graph data
  // --------------------------------------------------

  const graphData = useMemo(() => {
    if (!networkData) {
      return {
        nodes: [],
        links: [],
      };
    }

    return {
      nodes: (networkData.nodes || []).map(
        (node) => ({
          ...node,
        })
      ),

      links: (networkData.edges || []).map(
        (edge) => ({
          ...edge,
          source: edge.source,
          target: edge.target,
        })
      ),
    };
  }, [networkData]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

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

  function getLinkColor(level) {
    switch (level?.toLowerCase()) {
      case "high":
        return "#f87171";

      case "medium":
        return "#facc15";

      case "low":
        return "#4ade80";

      default:
        return "#64748b";
    }
  }

  function getNodeColor(node) {
    if (
      node.is_source ||
      node.id === selectedCaseId
    ) {
      return "#22d3ee";
    }

    if (
      selectedNode &&
      selectedNode.id === node.id
    ) {
      return "#f8fafc";
    }

    return "#818cf8";
  }

  function getNodeLabel(node) {
    return `
FIR: ${node.fir_number || "Unknown"}
Crime: ${node.crime_type || "Unknown"}
District: ${node.district || "Unknown"}
Station: ${node.police_station || "Unknown"}
Severity: ${node.severity || "Unknown"}
Status: ${node.status || "Unknown"}
    `;
  }

  function getLinkLabel(link) {
    const reasons =
      link.reasons?.join(", ") ||
      "No reasons available";

    return `
Linkage: ${link.level || "Unknown"}
Score: ${link.score ?? 0}/100
Reasons: ${reasons}
    `;
  }

  function handleNodeClick(node) {
    setSelectedNode(node);

    if (
      graphRef.current &&
      Number.isFinite(node.x) &&
      Number.isFinite(node.y)
    ) {
      graphRef.current.centerAt(
        node.x,
        node.y,
        500
      );

      graphRef.current.zoom(
        3,
        500
      );
    }
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loadingCases) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-400">
          Loading cases...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-w-0 w-full space-y-8">

      {/* Header */}

      <div>
        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-cyan-500/10 p-3">
            <Network
              className="text-cyan-400"
              size={26}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-white">
              Criminal Network Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Discover relationships between crime
              cases using evidence-based linkage
              analysis.
            </p>
          </div>

        </div>
      </div>

      {/* Selection */}

      <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-6">

        <h2 className="mb-4 text-lg font-semibold text-white">
          Select Investigation Case
        </h2>

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_190px_210px]">

          <select
            value={selectedCaseId}
            onChange={(event) => {
              setSelectedCaseId(
                event.target.value
              );

              setLinkageData(null);
              setNetworkData(null);
              setSelectedNode(null);
            }}
            className="min-w-0 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
          >
            {cases.map((crimeCase) => (
              <option
                key={crimeCase.id}
                value={crimeCase.id}
              >
                {crimeCase.fir_number} -{" "}
                {crimeCase.crime_type} -{" "}
                {crimeCase.district}
              </option>
            ))}
          </select>

          <select
            value={minimumScore}
            onChange={(event) => {
              setMinimumScore(
                Number(event.target.value)
              );
            }}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option value={25}>
              Minimum score: 25
            </option>

            <option value={40}>
              Minimum score: 40
            </option>

            <option value={55}>
              Minimum score: 55
            </option>

            <option value={75}>
              Minimum score: 75
            </option>
          </select>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={
              !selectedCaseId ||
              analyzing
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={18} />

            {analyzing
              ? "Analyzing..."
              : "Analyze Network"}
          </button>

        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

      </div>

      {/* Results */}

      {linkageData && networkData && (
        <>

          {/* Statistics */}

          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Cases in Network"
              value={
                networkData.node_count ??
                graphData.nodes.length
              }
              icon={<FileText size={20} />}
            />

            <StatCard
              title="Connections"
              value={
                networkData.edge_count ??
                graphData.links.length
              }
              icon={<Link2 size={20} />}
            />

            <StatCard
              title="High Links"
              value={
                networkData.summary
                  ?.high_links ?? 0
              }
              icon={<ShieldAlert size={20} />}
            />

            <StatCard
              title="Medium Links"
              value={
                networkData.summary
                  ?.medium_links ?? 0
              }
              icon={<Network size={20} />}
            />

          </div>

          {/* Source Case */}

          <div className="min-w-0">

            <h2 className="mb-4 text-lg font-semibold text-white">
              Source Case
            </h2>

            <div className="min-w-0 rounded-xl border border-cyan-500/30 bg-slate-900 p-6">

              <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                <Info
                  label="FIR Number"
                  value={
                    linkageData.source_case
                      .fir_number
                  }
                />

                <Info
                  label="Crime Type"
                  value={
                    linkageData.source_case
                      .crime_type
                  }
                />

                <Info
                  label="District"
                  value={
                    linkageData.source_case
                      .district
                  }
                />

                <Info
                  label="Police Station"
                  value={
                    linkageData.source_case
                      .police_station
                  }
                />

              </div>

            </div>

          </div>

          {/* Network */}

          <div className="min-w-0 w-full">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  Case Relationship Network
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Click a node to inspect the case.
                  Drag nodes to explore relationships.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">

                <Legend
                  color="bg-cyan-400"
                  label="Source Case"
                />

                <Legend
                  color="bg-red-400"
                  label="High Link"
                />

                <Legend
                  color="bg-yellow-400"
                  label="Medium Link"
                />

                <Legend
                  color="bg-green-400"
                  label="Low Link"
                />

              </div>

            </div>

            <div className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">

              {graphData.nodes.length > 0 ? (

                <div
                  ref={graphContainerRef}
                  className="h-[550px] min-w-0 w-full overflow-hidden"
                >

                  <ForceGraph2D
                    ref={graphRef}

                    graphData={graphData}

                    width={graphWidth}
                    height={550}

                    backgroundColor="#020617"

                    nodeLabel={getNodeLabel}

                    nodeColor={
                      getNodeColor
                    }

                    nodeRelSize={7}

                    nodeVal={(node) =>
                      node.is_source ? 2 : 1
                    }

                    linkColor={(link) =>
                      getLinkColor(
                        link.level
                      )
                    }

                    linkWidth={(link) =>
                      Math.max(
                        1.5,
                        (link.score || 0) /
                          20
                      )
                    }

                    linkLabel={getLinkLabel}

                    linkDirectionalParticles={
                      2
                    }

                    linkDirectionalParticleWidth={
                      2
                    }

                    linkDirectionalParticleSpeed={
                      0.005
                    }

                    cooldownTicks={100}

                    onEngineStop={() => {
                      graphRef.current?.zoomToFit(
                        500,
                        80
                      );
                    }}

                    onNodeClick={
                      handleNodeClick
                    }

                    nodeCanvasObject={(
                      node,
                      ctx,
                      globalScale
                    ) => {
                      const label =
                        node.fir_number ||
                        "Case";

                      const radius =
                        node.is_source
                          ? 9
                          : 7;

                      ctx.beginPath();

                      ctx.arc(
                        node.x,
                        node.y,
                        radius,
                        0,
                        2 * Math.PI,
                        false
                      );

                      ctx.fillStyle =
                        getNodeColor(node);

                      ctx.fill();

                      if (node.is_source) {
                        ctx.lineWidth = 2;

                        ctx.strokeStyle =
                          "#ffffff";

                        ctx.stroke();
                      }

                      const fontSize =
                        12 /
                        Math.sqrt(
                          globalScale
                        );

                      ctx.font =
                        `${fontSize}px Sans-Serif`;

                      ctx.textAlign =
                        "center";

                      ctx.textBaseline =
                        "middle";

                      ctx.fillStyle =
                        "#e2e8f0";

                      ctx.fillText(
                        label,
                        node.x,
                        node.y +
                          radius +
                          fontSize
                      );
                    }}
                  />

                </div>

              ) : (

                <div className="p-10 text-center text-slate-400">
                  No network connections were
                  found for this case.
                </div>

              )}

            </div>

          </div>

          {/* Selected Node */}

          {selectedNode && (

            <div className="min-w-0 rounded-xl border border-cyan-500/30 bg-slate-900 p-6">

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                <h2 className="text-lg font-semibold text-white">
                  Selected Case
                </h2>

                {selectedNode.is_source && (
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                    Source Case
                  </span>
                )}

              </div>

              <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">

                <Info
                  label="FIR Number"
                  value={
                    selectedNode.fir_number
                  }
                />

                <Info
                  label="Crime Type"
                  value={
                    selectedNode.crime_type
                  }
                />

                <Info
                  label="District"
                  value={
                    selectedNode.district
                  }
                />

                <Info
                  label="Police Station"
                  value={
                    selectedNode.police_station
                  }
                />

                <Info
                  label="Severity"
                  value={
                    selectedNode.severity
                  }
                />

                <Info
                  label="Status"
                  value={
                    selectedNode.status
                  }
                />

              </div>

            </div>

          )}

          {/* Linked Cases */}

          <div className="min-w-0 w-full">

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

              <h2 className="text-lg font-semibold text-white">
                Potentially Linked Cases
              </h2>

              <p className="text-sm text-slate-400">
                {
                  linkageData.total_linked_cases
                }{" "}
                matches found
              </p>

            </div>

            {linkageData.linked_cases
              .length === 0 ? (

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
                No related cases were identified.
              </div>

            ) : (

              <div className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900">

                <div className="w-full overflow-x-auto">

                  <table className="w-full min-w-[1050px] text-left">

                    <thead className="bg-slate-800">

                      <tr className="text-sm text-slate-300">

                        <th className="whitespace-nowrap px-5 py-4">
                          FIR Number
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Crime Type
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          District
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Police Station
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Score
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Linkage
                        </th>

                        <th className="px-5 py-4">
                          Reasons
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {linkageData.linked_cases.map(
                        (linkedCase) => (

                          <tr
                            key={
                              linkedCase.id
                            }
                            className="border-t border-slate-700 text-sm"
                          >

                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-white">
                              {
                                linkedCase.fir_number
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                              {
                                linkedCase.crime_type
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                              {
                                linkedCase.district
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                              {
                                linkedCase.police_station
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">

                              <span className="font-bold text-cyan-400">
                                {
                                  linkedCase.linkage_score
                                }
                              </span>

                              <span className="text-slate-500">
                                /100
                              </span>

                            </td>

                            <td
                              className={`whitespace-nowrap px-5 py-4 font-semibold ${getLinkageColor(
                                linkedCase.linkage_level
                              )}`}
                            >
                              {
                                linkedCase.linkage_level
                              }
                            </td>

                            <td className="px-5 py-4">

                              <div className="flex flex-wrap gap-2">

                                {(linkedCase.reasons || []).map(
                                  (
                                    reason,
                                    index
                                  ) => (

                                    <span
                                      key={`${linkedCase.id}-${index}`}
                                      className="whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300"
                                    >
                                      {reason}
                                    </span>

                                  )
                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}

// --------------------------------------------------
// Small UI components
// --------------------------------------------------

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-5">

      <div className="flex items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

        </div>

        <div className="shrink-0 rounded-lg bg-cyan-500/10 p-3 text-cyan-400">
          {icon}
        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="min-w-0">

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-white">
        {value || "N/A"}
      </p>

    </div>
  );
}

function Legend({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
      />

      <span className="whitespace-nowrap text-slate-400">
        {label}
      </span>

    </div>
  );
}

export default CaseLinkage;