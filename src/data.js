// ─── Seed Data ────────────────────────────────────────────────────────────────
export const SEED = [
    {
        id: "lumiere", name: "Lumière Diamonds", tagline: "Where Light Meets Perfection", logo: "◆", contact: "info@lumierediamonds.com",
        fontKey: "Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300", fontFamily: "'Cormorant Garamond',serif",
        diamonds: [
            { id: "ld-001", name: "Étoile Solitaire", carat: "2.14", cut: "Excellent", color: "D", clarity: "IF", shape: "Round Brilliant", price: "48,500", cert: "GIA-2381940572", origin: "Botswana", desc: "A breathtaking round brilliant of exceptional purity. Fully fluorescence-free with a hearts-and-arrows pattern under the scope." },
            { id: "ld-002", name: "Aurora Pear", carat: "1.87", cut: "Very Good", color: "E", clarity: "VS1", shape: "Pear", price: "22,800", cert: "GIA-5193847261", origin: "Canada", desc: "A graceful pear with a long elegant silhouette. Ideal for pendant or east-west setting." },
            { id: "ld-003", name: "Céleste Cushion", carat: "3.02", cut: "Ideal", color: "F", clarity: "VVS2", shape: "Cushion", price: "61,200", cert: "GIA-7483920156", origin: "South Africa", desc: "A magnificent cushion with classic soft outline. Strong blue fluorescence enhances brightness in natural light." },
        ]
    },
    {
        id: "stonehaus", name: "StoneHaus", tagline: "Raw. Rare. Real.", logo: "⬡", contact: "hello@stonehaus.co",
        fontKey: "Josefin+Sans:wght@300;400;600", fontFamily: "'Josefin Sans',sans-serif",
        diamonds: [
            { id: "sh-001", name: "Forest Hex", carat: "1.50", cut: "Good", color: "G", clarity: "SI1", shape: "Hexagonal Step Cut", price: "14,200", cert: "IGI-489302174", origin: "Zimbabwe", desc: "A bold geometric hexagonal step cut. Clean architectural facets give it industrial-luxe appeal." },
            { id: "sh-002", name: "Terra Oval", carat: "2.31", cut: "Excellent", color: "E", clarity: "VS2", shape: "Oval", price: "31,600", cert: "GIA-3820174659", origin: "Botswana", desc: "An elongating oval brilliant that flatters every finger. Minimal bow-tie with outstanding depth." },
        ]
    },
    {
        id: "royalcut", name: "Royal Cut Co.", tagline: "Crown Jewels for Modern Royalty", logo: "♛", contact: "inquire@royalcutco.com",
        fontKey: "Cinzel:wght@400;600;700", fontFamily: "'Cinzel',serif",
        diamonds: [
            { id: "rc-001", name: "Sovereign Asscher", carat: "1.72", cut: "Excellent", color: "D", clarity: "VVS1", shape: "Asscher", price: "29,900", cert: "GIA-1029384756", origin: "Russia", desc: "An Art Deco–inspired Asscher with a deep hall-of-mirrors effect. Every glance is a new discovery." },
            { id: "rc-002", name: "Imperial Marquise", carat: "2.88", cut: "Ideal", color: "F", clarity: "VS1", shape: "Marquise", price: "44,000", cert: "GIA-6574839201", origin: "Angola", desc: "A regal marquise with dramatic pointed tips and face-up size that belies its carat weight." },
            { id: "rc-003", name: "Dynasty Princess", carat: "1.21", cut: "Very Good", color: "G", clarity: "VS2", shape: "Princess", price: "16,800", cert: "IGI-774839201", origin: "Canada", desc: "A crisp princess cut with sharp defined corners giving it modern authority." },
        ]
    },
];

// ─── Filter Config ────────────────────────────────────────────────────────────
export const SHAPE_CHIPS = [
    { value: "Round Brilliant", label: "Round", icon: "⬤" },
    { value: "Oval", label: "Oval", icon: "⬭" },
    { value: "Pear", label: "Pear", icon: "🫧" },
    { value: "Cushion", label: "Cushion", icon: "⬛" },
    { value: "Princess", label: "Princess", icon: "◼" },
    { value: "Asscher", label: "Asscher", icon: "⬡" },
    { value: "Marquise", label: "Marquise", icon: "◈" },
    { value: "Radiant", label: "Radiant", icon: "✦" },
    { value: "Emerald", label: "Emerald", icon: "▬" },
    { value: "Hexagonal Step Cut", label: "Hex", icon: "⬢" },
];
export const CUT_CHIPS = ["Ideal", "Excellent", "Very Good", "Good", "Fair"];
export const COLOR_CHIPS = ["D", "E", "F", "G", "H", "I", "J"];
export const CLARITY_CHIPS = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];

// ─── Font Options ─────────────────────────────────────────────────────────────
export const FONT_OPTIONS = [
    { label: "Cormorant Garamond", value: "Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300", family: "'Cormorant Garamond',serif" },
    { label: "Playfair Display", value: "Playfair+Display:ital,wght@0,400;0,700;1,400", family: "'Playfair Display',serif" },
    { label: "DM Serif Display", value: "DM+Serif+Display:ital@0;1", family: "'DM Serif Display',serif" },
    { label: "Cinzel", value: "Cinzel:wght@400;600;700", family: "'Cinzel',serif" },
    { label: "Josefin Sans", value: "Josefin+Sans:wght@300;400;600", family: "'Josefin Sans',sans-serif" },
    { label: "Raleway", value: "Raleway:wght@300;400;600;700", family: "'Raleway',sans-serif" },
    { label: "Montserrat", value: "Montserrat:wght@300;400;600;700", family: "'Montserrat',sans-serif" },
    { label: "Lora", value: "Lora:ital,wght@0,400;0,600;1,400", family: "'Lora',serif" },
];

export function injectFont(k) {
    const id = `f-${k.replace(/[^a-z]/gi, "")}`;
    if (document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${k}&display=swap`;
    document.head.appendChild(l);
}
