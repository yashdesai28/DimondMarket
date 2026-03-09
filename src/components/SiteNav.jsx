// ─── Nav Component ────────────────────────────────────────────────────────────
export default function SiteNav({ left, right }) {
    return (
        <nav className="site-nav">
            <div className="nav-inner">{left}{right}</div>
        </nav>
    );
}
