import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Analytics from "./pages/Analytics";
import Hotspots from "./pages/Hotspots";
import CaseLinkage from "./pages/CaseLinkage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Investigator from "./pages/Investigator";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/cases" element={<Cases />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/hotspots" element={<Hotspots />} />

          <Route
            path="/case-linkage"
            element={<CaseLinkage />}
          />
          <Route
            path="/investigator"
            element={<Investigator />}
          />
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;