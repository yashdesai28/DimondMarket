import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DUMMY_DIAMONDS } from '../lib/dummyData';
import type { DummyDiamond } from '../lib/dummyData';
import { Diamond, SlidersHorizontal } from 'lucide-react';

const SHAPES = ['Round', 'Cushion', 'Marquise', 'Oval', 'Princess', 'Radiant', 'Pear', 'Asscher', 'Emerald', 'Hex'];
const CUTS = ['Ideal', 'Excellent', 'Very Good', 'Good', 'Fair'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];

// Basic icons for shapes
const ShapeIcon = ({ shape }: { shape: string }) => {
    switch (shape.toLowerCase()) {
        case 'round': return <div className="w-4 h-4 rounded-full bg-current" />;
        case 'cushion': return <div className="w-4 h-4 rounded-sm bg-current" />;
        case 'marquise': return <div className="w-4 h-4 rounded-full bg-current scale-y-150 scale-x-75 transform rotate-45" />;
        case 'oval': return <div className="w-4 h-5 rounded-[50%] bg-current" />;
        case 'princess': return <div className="w-4 h-4 bg-current" />;
        case 'pear': return <div className="w-4 h-5 rounded-t-full rounded-b-md bg-current" />;
        case 'emerald': return <div className="w-3.5 h-5 bg-current" />;
        case 'hex': return <div className="w-4 h-4 bg-current rotate-45 cut-corners" />;
        default: return <div className="w-4 h-4 bg-current rounded-sm" />;
    }
};

export default function UserDiamondList() {
    const [selectedShape, setSelectedShape] = useState<string | null>(null);
    const [selectedCut, setSelectedCut] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filter Logic
    const filteredDiamonds = DUMMY_DIAMONDS.filter((d: DummyDiamond) => {
        if (selectedShape && d.shape.toLowerCase() !== selectedShape.toLowerCase()) return false;
        if (selectedCut && d.cut.toLowerCase() !== selectedCut.toLowerCase()) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#1b2733] text-zinc-300 font-sans">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Diamond className="h-6 w-6 text-[#ff8c42]" fill="#ff8c42" />
                    <span className="text-xl font-serif text-[#ff8c42] tracking-wide">DiamondMarket</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/login" className="px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium hover:bg-white/5 transition-colors">
                        Admin
                    </Link>
                </div>
            </header>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Mobile Filter Toggle */}
                <button
                    className="md:hidden absolute bottom-6 right-6 z-50 bg-[#ff8c42] text-[#1b2733] p-4 rounded-full shadow-lg"
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                    <SlidersHorizontal className="h-6 w-6" />
                </button>

                {/* Left Sidebar - Filters */}
                <aside className={`
                    absolute md:relative z-40 w-72 mt-8 md:mt-10 mb-8 md:mb-10 ml-6 md:ml-8 rounded-2xl bg-[#243342] shadow-2xl border border-white/5 flex flex-col transition-transform duration-300
                    h-[calc(100%-64px)] md:h-[calc(100%-80px)]
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-8 overflow-y-auto h-full space-y-8 custom-scrollbar-filter">
                        <div>
                            <h2 className="text-white font-semibold text-lg mb-6">Filters</h2>

                            {/* Shape Filter */}
                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-4">Shape</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {SHAPES.map(shape => (
                                        <button
                                            key={shape}
                                            onClick={() => setSelectedShape(selectedShape === shape ? null : shape)}
                                            className={`
                                                flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                                                ${selectedShape === shape
                                                    ? 'border-[#ff8c42] bg-[#ff8c42]/10 text-[#ff8c42]'
                                                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            <div className="mb-2"><ShapeIcon shape={shape} /></div>
                                            <span className="text-[11px] font-medium">{shape}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cut Filter */}
                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-4">Cut</h3>
                                <div className="flex flex-wrap gap-2">
                                    {CUTS.map(cut => (
                                        <button
                                            key={cut}
                                            onClick={() => setSelectedCut(selectedCut === cut ? null : cut)}
                                            className={`
                                                px-4 py-2 rounded-full border text-sm transition-all
                                                ${selectedCut === cut
                                                    ? 'border-[#ff8c42] bg-[#ff8c42]/10 text-[#ff8c42]'
                                                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {cut}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional placeholders to show complete sidebar */}
                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-4">Color Grade</h3>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => <button key={c} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-sm hover:border-[#ff8c42]">{c}</button>)}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-4">Clarity</h3>
                                <div className="flex flex-wrap gap-2">
                                    {CLARITIES.map(c => <button key={c} className="px-3 py-1.5 rounded-md border border-white/10 text-[11px] font-medium tracking-wide hover:border-[#ff8c42]">{c}</button>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Side - Diamond Grid */}
                <main className="flex-1 overflow-y-auto bg-[#1b2733] p-8 md:p-10 custom-scrollbar-dark">

                    {/* Top action bar */}
                    <div className="flex justify-between items-center mb-8">
                        <button className="flex items-center text-[#ff8c42] text-sm font-medium hover:text-[#e07b3a] transition-colors">
                            <span className="mr-2">◄</span> Hide Filters
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{filteredDiamonds.length} stones</span>
                            <select className="bg-[#243342] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff8c42]">
                                <option>Sort: Default</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Carat: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDiamonds.map((diamond) => (
                            <Link
                                to={`/diamond/${diamond.id}`}
                                key={diamond.id}
                                className="group block bg-[#243342] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl"
                            >
                                {/* Img Placeholder Area */}
                                <div className="aspect-square bg-[#1b2733] w-full flex items-center justify-center p-8 group-hover:bg-[#1f2d3a] transition-colors">
                                    <Diamond className="w-24 h-24 text-[#ff8c42] opacity-80" fill="#ff8c42" />
                                </div>

                                {/* Info Box */}
                                <div className="p-5 border-t border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-serif text-lg text-white">{diamond.title}</h3>
                                        <span className="text-[#ff8c42] font-bold text-lg">${diamond.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mb-4">{diamond.businessName}</p>

                                    <p className="text-sm text-zinc-300 line-clamp-2 mb-4">
                                        {diamond.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 rounded border border-[#ff8c42]/30 text-[#ff8c42] text-[10px] font-bold tracking-wider">
                                            {diamond.carat.toFixed(2)}CT
                                        </span>
                                        <span className="px-2 py-1 rounded border border-[#ff8c42]/30 text-[#ff8c42] text-[10px] font-bold tracking-wider uppercase">
                                            {diamond.shape}
                                        </span>
                                        <span className="px-2 py-1 rounded border border-[#ff8c42]/30 text-[#ff8c42] text-[10px] font-bold tracking-wider">
                                            {diamond.color}
                                        </span>
                                        <span className="px-2 py-1 rounded border border-[#ff8c42]/30 text-[#ff8c42] text-[10px] font-bold tracking-wider">
                                            {diamond.clarity}
                                        </span>
                                        <span className="px-2 py-1 rounded border border-[#ff8c42]/30 text-[#ff8c42] text-[10px] font-bold tracking-wider uppercase">
                                            {diamond.cut}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredDiamonds.length === 0 && (
                        <div className="text-center py-24 text-zinc-400">
                            No diamonds match your current filters. Try relaxing your criteria.
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
