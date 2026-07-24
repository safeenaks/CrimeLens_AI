import {
  LayoutDashboard,
  FileText,
  BarChart3,
  MapPinned,
  Link2,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cases",
    path: "/cases",
    icon: FileText,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Hotspots",
    path: "/hotspots",
    icon: MapPinned,
  },
  {
    title: "Case Linkage",
    path: "/case-linkage",
    icon: Link2,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">

      <div className="p-6">

        <h1 className="text-3xl font-bold text-cyan-400">
          CrimeLens AI
        </h1>

      </div>

      <nav className="px-4 space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition
                ${
                  isActive
                    ? "bg-cyan-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={22} />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;