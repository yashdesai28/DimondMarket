import { useTheme } from "../theme";
import { SHAPE_CHIPS, CUT_CHIPS, COLOR_CHIPS, CLARITY_CHIPS } from "../data";

// ─── Filter Chips ─────────────────────────────────────────────────────────────
export default function FilterChips({ filters, setFilters, totalResults }) {
    const t = useTheme();
    const toggle = (key, val) => setFilters(f => ({
        ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }));
    const clearAll = () => setFilters({ shapes: [], cuts: [], colors: [], clarities: [] });
    const activeCount = Object.values(filters).flat().length;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: ".8rem", fontWeight: 600, color: t.textPrimary }}>
                    Filters
                    {activeCount > 0 && (
                        <span style={{ marginLeft: ".45rem", background: t.accent, color: t.textInverse, borderRadius: "50px", padding: ".08rem .5rem", fontSize: ".68rem", fontWeight: 700 }}>{activeCount}</span>
                    )}
                </span>
                {activeCount > 0 && (
                    <button className="btn btn-ghost btn-sm" style={{ padding: ".28rem .7rem", fontSize: ".72rem" }} onClick={clearAll}>Clear all</button>
                )}
            </div>
            <div className="filter-block">
                <div className="filter-title">Shape</div>
                <div className="shape-grid">
                    {SHAPE_CHIPS.map(s => (
                        <button key={s.value} className={`shape-chip ${filters.shapes.includes(s.value) ? "active" : ""}`}
                            onClick={() => toggle("shapes", s.value)}>
                            <span className="si">{s.icon}</span>
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="filter-block">
                <div className="filter-title">Cut</div>
                <div className="chip-row">
                    {CUT_CHIPS.map(c => (
                        <button key={c} className={`chip ${filters.cuts.includes(c) ? "active" : ""}`} onClick={() => toggle("cuts", c)}>{c}</button>
                    ))}
                </div>
            </div>
            <div className="filter-block">
                <div className="filter-title">Color Grade</div>
                <div className="chip-row">
                    {COLOR_CHIPS.map(c => (
                        <button key={c} className={`chip ${filters.colors.includes(c) ? "active" : ""}`} onClick={() => toggle("colors", c)}><b>{c}</b></button>
                    ))}
                </div>
            </div>
            <div className="filter-block">
                <div className="filter-title">Clarity</div>
                <div className="chip-row">
                    {CLARITY_CHIPS.map(c => (
                        <button key={c} className={`chip ${filters.clarities.includes(c) ? "active" : ""}`} onClick={() => toggle("clarities", c)}>{c}</button>
                    ))}
                </div>
            </div>
            <div style={{ marginTop: "1rem", paddingTop: ".85rem", borderTop: `1px solid ${t.border}22`, fontSize: ".75rem", color: t.textSecondary }}>
                <span style={{ color: t.accent, fontWeight: 600 }}>{totalResults}</span> diamond{totalResults !== 1 ? "s" : ""} found
            </div>
        </div>
    );
}
