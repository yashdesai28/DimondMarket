import { useState } from "react";
import { useTheme } from "../theme";
import { nav } from "../router";
import SiteNav from "../components/SiteNav";
import DiamondCard from "../components/DiamondCard";

// ─── Business Page ────────────────────────────────────────────────────────────
export default function BusinessPage({ biz }) {
    const t = useTheme();
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`${location.origin}${location.pathname}#/b/${biz.id}`).catch(() => { }); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div style={{ minHeight: "100vh" }}>
            <SiteNav
                left={<div style={{ display: "flex", alignItems: "center", gap: ".7rem", flexWrap: "wrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav("/")}>← All</button>
                    <span style={{ color: t.border, opacity: .4 }}>|</span>
                    <span style={{ fontSize: "1.1rem" }}>{biz.logo}</span>
                    <span style={{ fontFamily: biz.fontFamily, fontSize: ".95rem", color: t.textPrimary }}>{biz.name}</span>
                </div>}
                right={<button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "✓ Copied!" : "Share"}</button>}
            />
            <div style={{ textAlign: "center", padding: "2.5rem 1.25rem 1.75rem", background: `linear-gradient(160deg,${t.surfaceAlt}44,transparent)` }}>
                <div style={{ fontSize: "2.6rem", marginBottom: ".65rem", animation: "shimmer 3s ease infinite" }}>{biz.logo}</div>
                <h1 style={{ fontFamily: biz.fontFamily, fontSize: "clamp(1.7rem,5vw,2.8rem)", fontWeight: 300, color: t.textPrimary, marginBottom: ".35rem" }}>{biz.name}</h1>
                <p style={{ color: t.textSecondary, fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: "1rem" }}>{biz.tagline}</p>
                <div style={{ display: "inline-flex", gap: ".4rem", padding: ".38rem .85rem", border: `1px solid ${t.accent}44`, borderRadius: "8px", color: t.accent, fontSize: ".76rem" }}>✉ {biz.contact}</div>
            </div>
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.25rem 1.25rem 3rem" }}>
                <p style={{ fontSize: ".76rem", color: t.textSecondary, marginBottom: "1rem" }}>{biz.diamonds.length} listed stone{biz.diamonds.length !== 1 ? "s" : ""}</p>
                <div className="d-grid">{biz.diamonds.map(d => <DiamondCard key={d.id} biz={biz} diamond={d} />)}</div>
            </div>
        </div>
    );
}
