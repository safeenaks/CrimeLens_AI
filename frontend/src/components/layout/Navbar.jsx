import { Bell, Search, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

      <div className="relative">

        <Search
          className="absolute left-3 top-3 text-slate-500"
          size={18}
        />

        <input
          type="text"
          placeholder="Search cases..."
          className="bg-slate-800 rounded-lg pl-10 pr-4 py-2 w-80 outline-none border border-slate-700 focus:border-cyan-500"
        />

      </div>

      <div className="flex items-center gap-6">

        <Bell className="cursor-pointer" />

        <UserCircle size={36} />

      </div>

    </header>
  );
}

export default Navbar;