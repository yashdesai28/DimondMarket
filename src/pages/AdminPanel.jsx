import { useState } from "react";
import { useTheme } from "../theme";
import { nav } from "../router";
import { FONT_OPTIONS } from "../data";
import { ThemeEditor, BizInfoEditor, BrandingEditor, DRow, DiamondForm } from "../components/AdminComponents";

// ─── Admin Panel ──────────────────────────────────────────────────────────────
export default function AdminPanel({ businesses, setBusinesses, showToast, theme, setTheme }) {
    const t = useTheme();
    const [selId, setSelId] = useState(null);
    const [tab, setTab] = useState("info");
    const [editBiz, setEditBiz] = useState(null);
    const [newDmd, setNewDmd] = useState(null);
    const [editDmd, setEditDmd] = useState(null);
    const [showTheme, setShowTheme] = useState(false);
    const biz = businesses.find(b => b.id === selId);

    const selectBiz = (id) => { setSelId(id); setTab("info"); setEditBiz(null); setNewDmd(null); setEditDmd(null); setShowTheme(false); };
    const toggleTheme = () => {
        setShowTheme(s => { const next = !s; if (next) { setSelId(null); setEditBiz(null); setNewDmd(null); setEditDmd(null); } return next; });
    };

    const saveBiz = u => { setBusinesses(p => p.map(b => b.id === u.id ? u : b)); setEditBiz(null); showToast("Saved!"); };
    const addBiz = () => {
        const nb = {
            id: `biz-${Date.now()}`, name: "New Business", tagline: "Your tagline", logo: "◆", contact: "hello@example.com",
            fontKey: FONT_OPTIONS[0].value, fontFamily: FONT_OPTIONS[0].family, diamonds: []
        };
        setBusinesses(p => [...p, nb]); selectBiz(nb.id); showToast("Created!");
    };
    const delBiz = id => {
        if (!confirm("Delete?")) return;
        setBusinesses(p => p.filter(b => b.id !== id)); setSelId(null); setEditBiz(null); setNewDmd(null); setEditDmd(null); showToast("Deleted.", "error");
    };
    const saveDmd = (d, isNew) => {
        setBusinesses(p => p.map(b => b.id !== selId ? b : { ...b, diamonds: isNew ? [...b.diamonds, d] : b.diamonds.map(x => x.id === d.id ? d : x) }));
        setNewDmd(null); setEditDmd(null); showToast(isNew ? "Added!" : "Updated!");
    };
    const delDmd = did => { if (!confirm("Remove?")) return; setBusinesses(p => p.map(b => b.id !== selId ? b : { ...b, diamonds: b.diamonds.filter(d => d.id !== did) })); showToast("Removed.", "error"); };

    return (
        <div className="admin-wrap">
            <aside className="admin-sb">
                <div style={{ padding: "1rem 1.1rem", borderBottom: `1px solid ${t.border}22` }}>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginBottom: ".55rem" }} onClick={() => nav("/")}>← Back to Site</button>
                    <div style={{ fontWeight: 700, color: t.accent, fontSize: ".95rem" }}>◆ Admin Panel</div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: ".6rem 0" }}>
                    <p style={{ fontSize: ".62rem", color: t.textSecondary, textTransform: "uppercase", letterSpacing: ".1em", padding: "0 1.1rem", margin: ".4rem 0" }}>Businesses</p>
                    {businesses.map(b => (
                        <div key={b.id} className={`sb-biz ${selId === b.id ? "active" : ""}`} onClick={() => selectBiz(b.id)}>{b.logo} {b.name}</div>
                    ))}
                    <div style={{ padding: ".55rem 1.1rem" }}>
                        <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={addBiz}>+ Add Business</button>
                    </div>
                </div>
                <div style={{ padding: ".7rem 1.1rem", borderTop: `1px solid ${t.border}22` }}>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={toggleTheme}>🎨 {showTheme ? "Hide" : "Global Theme"}</button>
                </div>
            </aside>
            <main className="admin-main">
                {showTheme && <ThemeEditor theme={theme} setTheme={setTheme} showToast={showToast} />}
                {!selId && !showTheme && (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", color: t.textSecondary }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>◆</div>
                        <p>Select a business from the sidebar, or use <strong style={{ color: t.accent }}>🎨 Global Theme</strong> to update colors.</p>
                    </div>
                )}
                {biz && (
                    <div>
                        <div style={{
                            background: t.surface, border: `1px solid ${t.border}22`, borderRadius: "12px", padding: "1rem 1.1rem",
                            display: "flex", flexWrap: "wrap", alignItems: "center", gap: ".9rem", marginBottom: "1.4rem"
                        }}>
                            <span style={{ fontSize: "1.7rem" }}>{biz.logo}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: biz.fontFamily, fontSize: ".98rem", color: t.textPrimary }}>{biz.name}</p>
                                <p style={{ fontSize: ".73rem", color: t.textSecondary }}>{biz.tagline}</p>
                            </div>
                            <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap" }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => nav(`/b/${biz.id}`)}>Preview →</button>
                                <button className="btn btn-danger btn-sm" onClick={() => delBiz(biz.id)}>Delete</button>
                            </div>
                        </div>
                        <div style={{ borderBottom: `1px solid ${t.border}22`, display: "flex", gap: ".2rem", marginBottom: "1.4rem", overflowX: "auto" }}>
                            {["info", "branding", "diamonds"].map(t_ => (
                                <button key={t_} className={`atab ${tab === t_ ? "active" : ""}`} onClick={() => setTab(t_)}>
                                    {t_.charAt(0).toUpperCase() + t_.slice(1)}
                                </button>
                            ))}
                        </div>
                        {tab === "info" && <BizInfoEditor biz={editBiz || biz} onSave={saveBiz} onChange={setEditBiz} />}
                        {tab === "branding" && <BrandingEditor biz={editBiz || biz} onSave={saveBiz} onChange={setEditBiz} />}
                        {tab === "diamonds" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".5rem" }}>
                                    <p style={{ fontSize: ".8rem", color: t.textSecondary }}>{biz.diamonds.length} diamond{biz.diamonds.length !== 1 ? "s" : ""}</p>
                                    <button className="btn btn-primary btn-sm" onClick={() => setNewDmd({ id: `d-${Date.now()}`, name: "", carat: "", cut: "Excellent", color: "D", clarity: "VS1", shape: "Round Brilliant", price: "", cert: "", origin: "", desc: "" })}>+ Add Diamond</button>
                                </div>
                                {newDmd && <DiamondForm diamond={newDmd} isNew onSave={d => saveDmd(d, true)} onCancel={() => setNewDmd(null)} />}
                                {biz.diamonds.map(d => editDmd?.id === d.id
                                    ? <DiamondForm key={d.id} diamond={editDmd} onSave={d => saveDmd(d, false)} onCancel={() => setEditDmd(null)} />
                                    : <DRow key={d.id} d={d} onEdit={() => setEditDmd(d)} onDelete={() => delDmd(d.id)} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
