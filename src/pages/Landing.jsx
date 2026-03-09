import { useState } from "react";
import { useTheme } from "../theme";
import { nav } from "../router";
import SiteNav from "../components/SiteNav";
import FilterChips from "../components/FilterChips";
import DiamondCard from "../components/DiamondCard";

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing({ businesses }) {
    const t = useTheme();
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ shapes: [], cuts: [], colors: [], clarities: [] });
    const [sortBy, setSortBy] = useState("default");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const allDiamonds = businesses.flatMap(b => b.diamonds.map(d => ({ ...d, biz: b })));
    const activeCount = Object.values(filters).flat().length;

    const filtered = allDiamonds.filter(d => {
        const q = search.toLowerCase();
        const ms = !q || d.name.toLowerCase().includes(q) || d.biz.name.toLowerCase().includes(q) || d.shape.toLowerCase().includes(q);
        const msh = !filters.shapes.length || filters.shapes.includes(d.shape);
        const mc = !filters.cuts.length || filters.cuts.includes(d.cut);
        const mcl = !filters.colors.length || filters.colors.includes(d.color);
        const mcr = !filters.clarities.length || filters.clarities.includes(d.clarity);
        return ms && msh && mc && mcl && mcr;
    }).sort((a, b) => {
        const pa = parseFloat(a.price.replace(/,/g, "")), pb = parseFloat(b.price.replace(/,/g, ""));
        if (sortBy === "price-asc") return pa - pb;
        if (sortBy === "price-desc") return pb - pa;
        if (sortBy === "carat-desc") return parseFloat(b.carat) - parseFloat(a.carat);
        return 0;
    });

    return (
        <div style={{ minHeight: "100vh" }}>
            <SiteNav
                left={<span className="nav-logo">◆ DiamondMarket</span>}
                right={<button className="btn btn-ghost btn-sm" onClick={() => nav("/admin")}>Admin</button>}
            />
            <div style={{ background: `linear-gradient(160deg,${t.surfaceAlt}55,transparent)`, padding: "2.5rem 1.25rem 2rem", textAlign: "center" }}>
                <p style={{ fontSize: ".72rem", letterSpacing: ".3em", textTransform: "uppercase", color: t.accent, marginBottom: ".6rem" }}>The Premier Platform for</p>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: ".9rem" }}>
                    Diamond Listings
                </h1>
                <div style={{ maxWidth: "420px", margin: "0 auto", position: "relative" }}>
                    <span style={{ position: "absolute", left: ".95rem", top: "50%", transform: "translateY(-50%)", color: t.textSecondary, pointerEvents: "none" }}>🔍</span>
                    <input className="field-input" style={{ paddingLeft: "2.5rem", borderRadius: "50px", minHeight: "44px" }}
                        placeholder="Search diamonds, dealers, shapes…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            <div className="lp-wrap">
                <aside className={`lp-sidebar desktop-only ${sidebarOpen ? "" : "collapsed"}`}>
                    <div className="lp-sidebar-inner">
                        <FilterChips filters={filters} setFilters={setFilters} totalResults={filtered.length} />
                    </div>
                </aside>
                <div className="lp-main">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: ".75rem", flexWrap: "wrap" }}>
                        <button className="btn btn-ghost btn-sm desktop-only" onClick={() => setSidebarOpen(o => !o)}
                            style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}>
                            {sidebarOpen ? "◀ Hide Filters" : "▶ Show Filters"}
                            {!sidebarOpen && activeCount > 0 && (
                                <span style={{ background: t.accent, color: t.textInverse, borderRadius: "50px", padding: ".05rem .45rem", fontSize: ".68rem", fontWeight: 700 }}>{activeCount}</span>
                            )}
                        </button>
                        <button className="btn btn-ghost btn-sm mobile-only" onClick={() => setMobileOpen(o => !o)}
                            style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}>
                            {mobileOpen ? "🔼 Hide Filters" : "🔽 Show Filters"}
                            {!mobileOpen && activeCount > 0 && (
                                <span style={{ background: t.accent, color: t.textInverse, borderRadius: "50px", padding: ".05rem .45rem", fontSize: ".68rem", fontWeight: 700 }}>{activeCount}</span>
                            )}
                        </button>
                        <p style={{ fontSize: ".8rem", color: t.textSecondary, marginLeft: "auto" }}>
                            <span style={{ color: t.textPrimary, fontWeight: 600 }}>{filtered.length}</span> stone{filtered.length !== 1 ? "s" : ""}
                        </p>
                        <select className="field-input" style={{ width: "auto", minWidth: "150px", borderRadius: "50px", padding: ".42rem .9rem", fontSize: ".78rem" }}
                            value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price ↑</option>
                            <option value="price-desc">Price ↓</option>
                            <option value="carat-desc">Carat ↓</option>
                        </select>
                    </div>
                    <div className="mobile-only"
                        style={{ display: mobileOpen ? "block" : "none", background: t.surface, border: `1px solid ${t.border}22`, borderRadius: "14px", padding: "1.1rem", marginBottom: "1rem" }}>
                        <FilterChips filters={filters} setFilters={setFilters} totalResults={filtered.length} />
                    </div>
                    {filtered.length > 0
                        ? <div className="d-grid">{filtered.map(d => <DiamondCard key={d.id} biz={d.biz} diamond={d} />)}</div>
                        : <div style={{ textAlign: "center", padding: "3rem 1rem", color: t.textSecondary }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>◆</div>
                            <p style={{ marginBottom: "1rem" }}>No diamonds match your filters.</p>
                            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ shapes: [], cuts: [], colors: [], clarities: [] })}>Clear filters</button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
