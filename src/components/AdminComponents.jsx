import { useState, useEffect } from "react";
import { useTheme, DEFAULT_THEME } from "../theme";
import { FONT_OPTIONS, injectFont } from "../data";

// ─── Theme Editor ─────────────────────────────────────────────────────────────
export function ThemeEditor({ theme, setTheme, showToast }) {
    const t = useTheme();
    const [local, setLocal] = useState(theme);
    const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
    const fields = [
        { k: "bg", label: "Main Background" }, { k: "surface", label: "Card / Panel" }, { k: "surfaceAlt", label: "Lighter Surface" },
        { k: "border", label: "Border" }, { k: "accent", label: "🔑 Brand Accent" }, { k: "accentHover", label: "Accent Hover" },
        { k: "textPrimary", label: "Primary Text" }, { k: "textSecondary", label: "Secondary Text" }, { k: "textInverse", label: "Text on Accent" },
    ];
    return (
        <div style={{ background: t.surface, border: `1px solid ${t.border}22`, borderRadius: "13px", padding: "1.4rem", marginBottom: "1.75rem" }}>
            <h3 style={{ fontSize: ".95rem", color: t.textPrimary, marginBottom: "1.1rem" }}>🎨 Global Theme — change once, updates everywhere</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: ".9rem", marginBottom: "1.1rem" }}>
                {fields.map(({ k, label }) => (
                    <div key={k}>
                        <label className="field-label">{label}</label>
                        <div style={{ display: "flex", gap: ".45rem", alignItems: "center" }}>
                            <input type="color" value={local[k]} onChange={e => set(k, e.target.value)} style={{ width: "34px", height: "34px", border: "none", background: "none", cursor: "pointer", borderRadius: "6px", flexShrink: 0 }} />
                            <input className="field-input" value={local[k]} onChange={e => set(k, e.target.value)} style={{ flex: 1 }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: ".55rem", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => { setTheme(local); showToast("Theme applied!"); }}>Apply Theme</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setLocal(DEFAULT_THEME); setTheme(DEFAULT_THEME); showToast("Reset."); }}>Reset</button>
            </div>
        </div>
    );
}

// ─── Biz Info Editor ──────────────────────────────────────────────────────────
export function BizInfoEditor({ biz, onSave, onChange }) {
    const [f, setF] = useState(biz);
    useEffect(() => setF(biz), [biz]);
    const set = (k, v) => { const u = { ...f, [k]: v }; setF(u); onChange(u); };
    return (
        <div style={{ maxWidth: "460px" }}>
            {[["name", "Business Name"], ["tagline", "Tagline"], ["logo", "Logo / Icon"], ["contact", "Contact Email"]].map(([k, l]) => (
                <div key={k} style={{ marginBottom: ".9rem" }}>
                    <label className="field-label">{l}</label>
                    <input className="field-input" value={f[k]} onChange={e => set(k, e.target.value)} />
                </div>
            ))}
            <button className="btn btn-primary" onClick={() => onSave(f)}>Save Changes</button>
        </div>
    );
}

// ─── Branding Editor ──────────────────────────────────────────────────────────
export function BrandingEditor({ biz, onSave, onChange }) {
    const t = useTheme();
    const [f, setF] = useState(biz);
    useEffect(() => setF(biz), [biz]);
    const setFont = key => {
        const opt = FONT_OPTIONS.find(x => x.value === key); if (!opt) return;
        injectFont(opt.value);
        const u = { ...f, fontKey: opt.value, fontFamily: opt.family }; setF(u); onChange(u);
    };
    return (
        <div style={{ maxWidth: "520px" }}>
            <div style={{ marginBottom: "1.1rem" }}>
                <label className="field-label">Font Family</label>
                <select className="field-input" value={f.fontKey} onChange={e => setFont(e.target.value)}>
                    {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div style={{ marginTop: ".55rem", padding: ".75rem 1rem", background: t.surfaceAlt, borderRadius: "8px", fontFamily: f.fontFamily, fontSize: "1.1rem", color: t.accent }}>
                    {f.name} — The quick brown fox
                </div>
            </div>
            <p style={{ fontSize: ".73rem", color: t.textSecondary, marginBottom: ".9rem" }}>Use 🎨 Global Theme for site-wide color control.</p>
            <button className="btn btn-primary" onClick={() => onSave(f)}>Save Branding</button>
        </div>
    );
}

// ─── Diamond Row ──────────────────────────────────────────────────────────────
export function DRow({ d, onEdit, onDelete }) {
    const t = useTheme();
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem",
            padding: ".85rem .95rem", background: t.surfaceAlt, borderRadius: "10px", marginBottom: ".55rem", border: `1px solid ${t.border}22`
        }}>
            <div>
                <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: ".12rem" }}>{d.name || "Untitled"} <span style={{ color: t.accent, marginLeft: ".35rem" }}>${d.price}</span></p>
                <p style={{ fontSize: ".74rem", color: t.textSecondary }}>{d.carat}ct · {d.shape} · {d.color}/{d.clarity}</p>
            </div>
            <div style={{ display: "flex", gap: ".4rem" }}>
                <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={onDelete}>Remove</button>
            </div>
        </div>
    );
}

// ─── Diamond Form ─────────────────────────────────────────────────────────────
export function DiamondForm({ diamond, isNew, onSave, onCancel }) {
    const t = useTheme();
    const [f, setF] = useState(diamond);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const CUTS = ["Ideal", "Excellent", "Very Good", "Good", "Fair"];
    const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K"];
    const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];
    const SHAPES = ["Round Brilliant", "Princess", "Cushion", "Oval", "Pear", "Asscher", "Marquise", "Radiant", "Emerald", "Heart", "Hexagonal Step Cut"];
    return (
        <div style={{ padding: "1.1rem", background: t.surface, borderRadius: "12px", border: `1px solid ${t.accent}44`, marginBottom: ".9rem" }}>
            <h4 style={{ fontSize: ".85rem", color: t.accent, marginBottom: ".9rem", fontWeight: 600 }}>{isNew ? "Add Diamond" : `Edit: ${f.name}`}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: ".65rem" }}>
                {[["name", "Name", "Aurora Pear"], ["price", "Price", "24,500"], ["carat", "Carat", "1.50"], ["cert", "Certificate", "GIA-123"], ["origin", "Origin", "Botswana"]].map(([k, l, ph]) => (
                    <div key={k}><label className="field-label">{l}</label><input className="field-input" placeholder={ph} value={f[k]} onChange={e => set(k, e.target.value)} /></div>
                ))}
                {[["shape", "Shape", SHAPES], ["cut", "Cut", CUTS], ["color", "Color", COLORS], ["clarity", "Clarity", CLARITIES]].map(([k, l, opts]) => (
                    <div key={k}><label className="field-label">{l}</label>
                        <select className="field-input" value={f[k]} onChange={e => set(k, e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: ".65rem" }}><label className="field-label">Description</label>
                <textarea className="field-input" rows={3} style={{ resize: "vertical" }} value={f.desc} onChange={e => set("desc", e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: ".55rem", marginTop: ".65rem", flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={() => onSave(f)}>{isNew ? "Add" : "Save"}</button>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}
