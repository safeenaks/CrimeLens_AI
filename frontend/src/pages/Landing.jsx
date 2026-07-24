import { Link } from "react-router-dom";

function Landing() {
  const features = [
    {
      title: "AI Investigation",
      desc: "Ask questions in natural language and get instant crime insights powered by AI.",
      icon: "🤖",
    },
    {
      title: "Crime Analytics",
      desc: "Visualize crime patterns, severity trends, and district-wise statistics.",
      icon: "📊",
    },
    {
      title: "Hotspot Detection",
      desc: "Interactive maps highlighting high-risk areas using geospatial analysis.",
      icon: "📍",
    },
    {
      title: "Case Linkage",
      desc: "Identify similar crimes and discover hidden relationships between cases.",
      icon: "🔗",
    },
    {
      title: "Prediction",
      desc: "Predict crime trends using machine learning models.",
      icon: "📈",
    },
    {
      title: "Relationship Graph",
      desc: "Visualize criminal networks and investigation relationships.",
      icon: "🕸️",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-cyan-400">
          CrimeLens AI
        </h1>

        <div className="flex gap-8 text-slate-300">
          <a href="#features" className="hover:text-cyan-400">Features</a>
          <a href="#workflow" className="hover:text-cyan-400">Workflow</a>
          <a href="#about" className="hover:text-cyan-400">About</a>
        </div>

        <Link
          to="/login"
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg font-semibold"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center py-28 px-6">

        <p className="text-cyan-400 font-semibold uppercase tracking-widest">
          AI Powered Crime Investigation Platform
        </p>

        <h1 className="text-6xl font-extrabold mt-6 leading-tight">
          Smarter Crime Analysis
          <br />
          Faster Investigations
        </h1>

        <p className="max-w-3xl mx-auto mt-8 text-slate-400 text-lg">
          CrimeLens AI empowers law enforcement agencies with
          Artificial Intelligence, Crime Analytics, Hotspot Detection,
          Criminal Network Visualization, and Intelligent Case Linkage.
        </p>

        <div className="flex justify-center gap-6 mt-10">

          <Link
            to="/dashboard"
            className="bg-cyan-500 hover:bg-cyan-600 px-7 py-3 rounded-lg font-semibold"
          >
            Launch Dashboard
          </Link>

          <a
            href="#features"
            className="border border-cyan-500 text-cyan-400 px-7 py-3 rounded-lg hover:bg-cyan-500 hover:text-white"
          >
            Learn More
          </a>

        </div>

      </section>

      {/* Features */}

      <section id="features" className="px-10 py-20">

        <h2 className="text-4xl font-bold text-center mb-14">
          Core Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {features.map((item, index) => (

            <div
              key={index}
              className="bg-slate-900 rounded-xl p-8 border border-slate-800 hover:border-cyan-500 transition"
            >

              <div className="text-5xl mb-5">
                {item.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {item.title}
              </h3>

              <p className="text-slate-400">
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Workflow */}

      <section
        id="workflow"
        className="bg-slate-900 py-20 px-10"
      >

        <h2 className="text-4xl font-bold text-center mb-14">
          Investigation Workflow
        </h2>

        <div className="grid md:grid-cols-5 gap-8 text-center">

          {[
            "Upload FIR",
            "AI Analysis",
            "Case Linkage",
            "Hotspot Detection",
            "Investigation Summary",
          ].map((step, index) => (

            <div key={index}>

              <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center mx-auto text-2xl font-bold">
                {index + 1}
              </div>

              <p className="mt-5 font-semibold">
                {step}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* About */}

      <section
        id="about"
        className="py-24 px-10 text-center"
      >

        <h2 className="text-4xl font-bold">
          Why CrimeLens AI?
        </h2>

        <p className="max-w-4xl mx-auto mt-8 text-slate-400 leading-8">

          CrimeLens AI integrates Artificial Intelligence,
          Machine Learning, Crime Analytics,
          Relationship Graphs, and Geospatial Intelligence
          into a unified platform to assist investigators in
          solving crimes faster and making informed decisions.

        </p>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500">

        © 2026 CrimeLens AI

      </footer>

    </div>
  );
}

export default Landing;