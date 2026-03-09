import { useTheme } from "../theme";
import { nav } from "../router";

// ─── Diamond Card ─────────────────────────────────────────────────────────────
export default function DiamondCard({ biz, diamond: d }) {
    const t = useTheme();
    return (
        <div className="card" style={{ cursor: "pointer" }} onClick={() => nav(`/d/${biz.id}/${d.id}`)}>
            <div style={{
                height: "140px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.8rem",
                background: `linear-gradient(135deg,${t.accent}18,${t.accent}05)`, color: t.accent, borderBottom: `1px solid ${t.border}22`
            }}>◆</div>
            <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", marginBottom: ".25rem" }}>
                    <h3 style={{ fontFamily: biz.fontFamily, fontSize: ".98rem", color: t.textPrimary, flex: 1, lineHeight: 1.3 }}>{d.name}</h3>
                    <span style={{ color: t.accent, fontWeight: 700, fontSize: ".92rem", whiteSpace: "nowrap" }}>${d.price}</span>
                </div>
                <p style={{ fontSize: ".7rem", color: t.textSecondary, marginBottom: ".55rem" }}>{biz.name}</p>
                <p style={{ fontSize: ".74rem", color: t.textSecondary, lineHeight: 1.5, marginBottom: ".75rem" }}>{d.desc.slice(0, 80)}…</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".28rem" }}>
                    {[`${d.carat}ct`, d.shape, d.color, d.clarity, d.cut].map(tag => (
                        <span key={tag} className="badge">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
