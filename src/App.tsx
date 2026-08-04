import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Consultation from "./pages/Consultation";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import { BusinessProvider } from "./context/BusinessContext";

export default function App() {
  return (
    <BrowserRouter>
      <BusinessProvider>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route
          path="*"
          element={
            <main className="flex min-h-screen items-center justify-center bg-bg-warm">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-text-primary">
                  404 — Page Not Found
                </h1>
                <p className="mt-4 text-text-muted">
                  <a href="/" className="text-emerald-600 hover:text-emerald-700 underline">
                    Go back home
                  </a>
                </p>
              </div>
            </main>
          }
        />
      </Routes>
      </BusinessProvider>
    </BrowserRouter>
  );
}