import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            CrimeLens AI
          </h1>

          <p className="text-slate-400 mt-3">
            Sign in to continue
          </p>
        </div>

        <form className="space-y-5">

          <div>
            <label className="block text-sm mb-2 text-slate-300">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition rounded-lg py-3 font-semibold"
          >
            Login
          </button>

        </form>

        <div className="mt-8 text-center">

          <Link
            to="/"
            className="text-cyan-400 hover:underline"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;