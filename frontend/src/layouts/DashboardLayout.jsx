import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-950 text-white">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />

        <main className="min-w-0 flex-1 overflow-x-hidden p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;