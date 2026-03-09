import { createContext, useContext, useEffect } from "react";

export const DEFAULT_THEME = {
    bg: "#25343F",
    surface: "#1c2830",
    surfaceAlt: "#2e3f4c",
    border: "#BFC9D1",
    accent: "#FF9B51",
    accentHover: "#e8843a",
    textPrimary: "#EAEFEF",
    textSecondary: "#BFC9D1",
    textInverse: "#25343F",
};

export const ThemeContext = createContext(DEFAULT_THEME);
export const useTheme = () => useContext(ThemeContext);

export function useGlobalStyles(t) {
    useEffect(() => {
        const id = "dm-gs";
        let el = document.getElementById(id);
        if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
        el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      html,body { height:100%; }
      body { background:${t.bg}; color:${t.textPrimary}; font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
      a { text-decoration:none; color:inherit; cursor:pointer; }
      input,select,textarea,button { font-family:inherit; }

      .site-nav { position:sticky; top:0; z-index:200; background:${t.bg}f0; backdrop-filter:blur(14px); border-bottom:1px solid ${t.border}33; }
      .nav-inner { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.85rem 1.25rem; flex-wrap:wrap; }
      .nav-logo  { font-family:'Cormorant Garamond',serif; font-size:1.35rem; color:${t.accent}; letter-spacing:.04em; white-space:nowrap; }

      .btn { display:inline-flex; align-items:center; justify-content:center; gap:.4rem; border:none; border-radius:9px; cursor:pointer; font-weight:600; transition:all .17s; white-space:nowrap; line-height:1; }
      .btn-primary { background:${t.accent}; color:${t.textInverse}; padding:.65rem 1.4rem; font-size:.86rem; }
      .btn-primary:hover { background:${t.accentHover}; transform:translateY(-1px); }
      .btn-ghost   { background:transparent; color:${t.accent}; border:1.5px solid ${t.accent}55; padding:.58rem 1.1rem; font-size:.82rem; }
      .btn-ghost:hover { background:${t.accent}15; }
      .btn-danger  { background:#b83232; color:#fff; padding:.55rem 1rem; font-size:.8rem; }
      .btn-danger:hover { background:#9e2a2a; }
      .btn-sm { padding:.42rem .85rem; font-size:.78rem; border-radius:8px; }

      .card { background:${t.surface}; border:1px solid ${t.border}22; border-radius:14px; overflow:hidden; transition:transform .2s,box-shadow .2s; }
      .card:hover { transform:translateY(-4px); box-shadow:0 14px 40px rgba(0,0,0,.4); }

      .badge { display:inline-block; padding:.2rem .5rem; border-radius:5px; font-size:.68rem; font-weight:600; letter-spacing:.04em; text-transform:uppercase; background:${t.accent}20; color:${t.accent}; border:1px solid ${t.accent}30; }

      .field-label { display:block; font-size:.7rem; color:${t.textSecondary}; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.38rem; }
      .field-input { width:100%; padding:.58rem .85rem; background:${t.surfaceAlt}; border:1px solid ${t.border}33; border-radius:8px; color:${t.textPrimary}; font-size:.88rem; outline:none; transition:border-color .15s; }
      .field-input:focus { border-color:${t.accent}77; }

      .spec-row { display:flex; justify-content:space-between; align-items:center; padding:.65rem 0; border-bottom:1px solid ${t.border}22; font-size:.86rem; gap:.5rem; }
      .spec-label { color:${t.textSecondary}; font-size:.73rem; text-transform:uppercase; letter-spacing:.05em; }
      .spec-val   { color:${t.textPrimary}; font-weight:500; text-align:right; }

      .chip { display:inline-flex; align-items:center; justify-content:center; gap:.3rem; padding:.52rem .95rem; border-radius:50px; border:1.5px solid ${t.border}44; background:transparent; color:${t.textSecondary}; font-size:.78rem; cursor:pointer; transition:all .17s; font-weight:500; user-select:none; min-height:40px; }
      .chip:hover { border-color:${t.accent}66; color:${t.textPrimary}; background:${t.accent}10; }
      .chip.active { background:${t.accent}; color:${t.textInverse}; border-color:${t.accent}; font-weight:700; box-shadow:0 3px 12px ${t.accent}44; }

      .shape-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem; }
      .shape-chip { display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:12px; border:1.5px solid ${t.border}44; background:transparent; color:${t.textSecondary}; font-size:.72rem; cursor:pointer; transition:all .17s; font-weight:500; user-select:none; width:100%; height:72px; gap:.28rem; }
      .shape-chip:hover { border-color:${t.accent}66; color:${t.textPrimary}; background:${t.accent}10; }
      .shape-chip.active { background:${t.accent}; color:${t.textInverse}; border-color:${t.accent}; font-weight:700; box-shadow:0 3px 12px ${t.accent}44; }
      .shape-chip .si { font-size:1.2rem; line-height:1; }

      .chip-row { display:flex; flex-wrap:wrap; gap:.45rem; }
      .filter-title { font-size:.68rem; text-transform:uppercase; letter-spacing:.12em; color:${t.textSecondary}; margin-bottom:.7rem; font-weight:600; }
      .filter-block { margin-bottom:1.1rem; }
      .filter-block:last-child { margin-bottom:0; }

      .lp-wrap { display:block; }
      .lp-main { padding:0 1.25rem 3rem; }
      .filter-bar { background:${t.surface}; border:1px solid ${t.border}22; border-radius:14px; padding:1.1rem 1.25rem; margin-bottom:1.25rem; }

      @media(min-width:900px) {
        .lp-wrap { display:flex; align-items:flex-start; gap:0; }
        .lp-sidebar {
          width:30%; flex-shrink:0; position:sticky; top:56px; height:calc(100vh - 56px);
          background:${t.surface}; border:1px solid ${t.border}22; border-radius:14px;
          margin:1.25rem 0 1.25rem 1.25rem; display:flex; flex-direction:column; overflow:hidden;
        }
        .lp-sidebar-inner { flex:1; overflow-y:auto; padding:1.5rem; }
        .lp-sidebar-inner::-webkit-scrollbar { width:4px; }
        .lp-sidebar-inner::-webkit-scrollbar-track { background:transparent; }
        .lp-sidebar-inner::-webkit-scrollbar-thumb { background:${t.border}44; border-radius:4px; }
        .lp-sidebar.collapsed { width:0; padding:0; opacity:0; overflow:hidden; border-right:none; }
        .lp-main { flex:1; min-width:0; padding:1.25rem 1.75rem 3rem; }
        .mobile-only { display:none !important; }
      }

      @media(max-width:899px) {
        .lp-sidebar { display:none; }
        .desktop-only { display:none !important; }
      }

      .mobile-filter-toggle { display:flex; gap:.6rem; align-items:center; margin-bottom:.9rem; }
      .mobile-filter-panel { display:none; background:${t.surface}; border:1px solid ${t.border}22; border-radius:14px; padding:1.1rem; margin-bottom:1rem; }
      .mobile-filter-panel.open { display:block; }

      .d-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr)); gap:1.1rem; }
      @media(min-width:600px) { .d-grid { gap:1.25rem; } }

      .detail-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
      @media(min-width:768px) { .detail-grid { grid-template-columns:1fr 1fr; gap:2.5rem; } }

      .admin-wrap { display:flex; min-height:100vh; }
      .admin-sb { width:230px; background:${t.surface}; border-right:1px solid ${t.border}22; flex-shrink:0; display:flex; flex-direction:column; }
      .admin-main { flex:1; overflow-y:auto; padding:1.5rem; }
      .sb-biz { padding:.62rem 1.1rem; cursor:pointer; border-left:3px solid transparent; font-size:.84rem; color:${t.textSecondary}; transition:all .15s; }
      .sb-biz:hover { background:${t.surfaceAlt}; color:${t.textPrimary}; }
      .sb-biz.active { border-left-color:${t.accent}; background:${t.accent}12; color:${t.accent}; }
      .atab { padding:.48rem .95rem; background:transparent; border:none; color:${t.textSecondary}; cursor:pointer; font-size:.84rem; border-bottom:2px solid transparent; transition:all .15s; }
      .atab.active { color:${t.accent}; border-bottom-color:${t.accent}; }

      @media(max-width:767px) {
        .admin-wrap { flex-direction:column; }
        .admin-sb { width:100%; border-right:none; border-bottom:1px solid ${t.border}22; }
        .admin-main { padding:1rem; }
      }

      .toast { position:fixed; bottom:1.25rem; right:1.25rem; padding:.7rem 1.3rem; border-radius:9px; font-size:.82rem; z-index:9999; color:#fff; box-shadow:0 8px 28px rgba(0,0,0,.45); animation:fup .28s ease; }
      @keyframes fup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }

      ::-webkit-scrollbar { width:5px; }
      ::-webkit-scrollbar-track { background:${t.surface}; }
      ::-webkit-scrollbar-thumb { background:${t.border}44; border-radius:3px; }
    `;
    }, [t]);
}
