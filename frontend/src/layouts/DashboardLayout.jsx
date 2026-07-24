import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="bg-slate-950 text-white min-h-screen flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-8 flex-1">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;