// ─── Hash Router ──────────────────────────────────────────────────────────────
export function hashRoute() {
    const parts = (window.location.hash.replace("#", "") || "/").split("/").filter(Boolean);
    if (!parts.length) return { page: "landing" };
    if (parts[0] === "admin") return { page: "admin" };
    if (parts[0] === "b" && parts[1]) return { page: "business", bid: parts[1] };
    if (parts[0] === "d" && parts[1] && parts[2]) return { page: "diamond", bid: parts[1], did: parts[2] };
    return { page: "landing" };
}

export const nav = (p) => { window.location.hash = p; };
