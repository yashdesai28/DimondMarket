import { useState } from "react";
import { useTheme } from "../theme";
import { nav } from "../router";
import SiteNav from "../components/SiteNav";

// ─── Diamond Detail Page ──────────────────────────────────────────────────────
export default function DiamondPage({ biz, diamond: d }) {
    const t = useTheme();
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`${location.origin}${location.pathname}#/d/${biz.id}/${d.id}`).catch(() => { }); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const specs = [
        { label: "Carat", value: `${d.carat} ct` }, { label: "Cut", value: d.cut }, { label: "Color", value: d.color },
        { label: "Clarity", value: d.clarity }, { label: "Shape", value: d.shape }, { label: "Origin", value: d.origin }, { label: "Certificate", value: d.cert }
    ];
    return (
        <div style={{ minHeight: "100vh" }}>
            <SiteNav
                left={<div style={{ display: "flex", alignItems: "center", gap: ".7rem", flexWrap: "wrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav(`/b/${biz.id}`)}>← {biz.name}</button>
                    <span style={{ color: t.textSecondary, fontSize: ".82rem" }}>{d.name}</span>
                </div>}
                right={<button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "✓ Copied!" : "Share"}</button>}
            />
            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
                <div className="detail-grid">
                    <div>
                        <div style={{
                            height: "clamp(230px,36vw,340px)", background: `linear-gradient(135deg,${t.accent}18,${t.accent}06)`,
                            borderRadius: "18px", border: `1px solid ${t.border}22`, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "clamp(4.5rem,10vw,7rem)", color: t.accent, marginBottom: "1rem", animation: "shimmer 2.5s ease infinite"
                        }}>◆</div>
                        <div style={{ padding: ".9rem", background: t.surface, border: `1px solid ${t.border}22`, borderRadius: "10px" }}>
                            <p className="field-label" style={{ marginBottom: ".3rem" }}>Certificate</p>
                            <p style={{ color: t.accent, fontWeight: 600, fontSize: ".85rem", letterSpacing: ".04em" }}>{d.cert}</p>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: ".68rem", color: t.accent, textTransform: "uppercase", letterSpacing: ".18em", marginBottom: ".45rem" }}>{biz.name}</p>
                        <h1 style={{ fontFamily: biz.fontFamily, fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 400, color: t.textPrimary, lineHeight: 1.2, marginBottom: ".3rem" }}>{d.name}</h1>
                        <p style={{ fontSize: ".73rem", color: t.textSecondary, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1.3rem" }}>{d.carat} Carat · {d.shape}</p>
                        {specs.map(s => (
                            <div key={s.label} className="spec-row">
                                <span className="spec-label">{s.label}</span>
                                <span className="spec-val">{s.value}</span>
                            </div>
                        ))}
                        <p style={{ fontSize: ".86rem", lineHeight: 1.75, color: t.textSecondary, margin: "1.3rem 0" }}>{d.desc}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${t.border}22`, padding: ".9rem 0", marginBottom: "1.3rem" }}>
                            <span className="field-label" style={{ marginBottom: 0 }}>Asking Price</span>
                            <span style={{ fontSize: "1.75rem", fontWeight: 700, color: t.accent, fontFamily: biz.fontFamily }}>${d.price}</span>
                        </div>
                        <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
                            <button className="btn btn-primary">Inquire Now</button>
                            <button className="btn btn-ghost" onClick={copy}>{copied ? "✓ Copied!" : "Share"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
