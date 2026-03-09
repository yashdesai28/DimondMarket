import { useState, useEffect } from "react";
import { ThemeContext, DEFAULT_THEME, useGlobalStyles } from "./theme";
import { SEED, injectFont } from "./data";
import { hashRoute } from "./router";
import Landing from "./pages/Landing";
import BusinessPage from "./pages/BusinessPage";
import DiamondPage from "./pages/DiamondPage";
import AdminPanel from "./pages/AdminPanel";

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [businesses, setBusinesses] = useState(() => { try { return JSON.parse(localStorage.getItem("dm_v4")) || SEED; } catch { return SEED; } });
  const [route, setRoute] = useState(hashRoute);
  const [toast, setToast] = useState(null);

  useGlobalStyles(theme);
  useEffect(() => { businesses.forEach(b => injectFont(b.fontKey)); }, [businesses]);
  useEffect(() => { const h = () => setRoute(hashRoute()); window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h); }, []);
  useEffect(() => { try { localStorage.setItem("dm_v4", JSON.stringify(businesses)); } catch { } }, [businesses]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };
  const biz = businesses.find(b => b.id === route.bid);
  const diamond = biz?.diamonds.find(d => d.id === route.did);

  return (
    <ThemeContext.Provider value={theme}>
      {toast && <div className="toast" style={{ background: toast.type === "error" ? "#b83232" : "#1e7a45" }}>{toast.msg}</div>}
      {route.page === "landing" && <Landing businesses={businesses} />}
      {route.page === "business" && biz && <BusinessPage biz={biz} />}
      {route.page === "diamond" && biz && diamond && <DiamondPage biz={biz} diamond={diamond} />}
      {route.page === "admin" && <AdminPanel businesses={businesses} setBusinesses={setBusinesses} showToast={showToast} theme={theme} setTheme={setTheme} />}
      {route.page === "business" && !biz && <NotFound />}
    </ThemeContext.Provider>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#BFC9D1" }}>
      <span style={{ fontSize: "3rem" }}>◆</span>
      <h2 style={{ color: "#EAEFEF" }}>Business not found</h2>
      <button className="btn btn-ghost btn-sm" onClick={() => { window.location.hash = "/"; }}>← Return to marketplace</button>
    </div>
  );
}
