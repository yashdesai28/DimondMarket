import { useParams, Link } from 'react-router-dom';
import { DUMMY_DIAMONDS } from '../lib/dummyData';
import type { DummyDiamond } from '../lib/dummyData';
import { ArrowLeft, Share2, Diamond } from 'lucide-react';

export default function UserDiamondDetail() {
    const { id } = useParams();
    const diamond = DUMMY_DIAMONDS.find((d: DummyDiamond) => d.id === id) || DUMMY_DIAMONDS[0];

    return (
        <div className="h-screen bg-[#1b2733] text-zinc-300 font-sans flex flex-col overflow-hidden custom-scrollbar-dark">

            {/* Top Navigation (Fixed at top) */}
            <div className="w-full border-b border-white/5 bg-[#1b2733] z-10 shrink-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link to="/diamonds" className="px-4 py-1.5 rounded-full border border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42]/10 transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> {diamond.businessName}
                        </Link>
                        <span className="text-zinc-500 hidden sm:inline">{diamond.title}</span>
                    </div>
                    <button className="px-5 py-2 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-medium">
                        Share <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Area (Scrolls nicely on mobile, split pane on desktop) */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden relative">
                <div className="max-w-7xl mx-auto h-full grid lg:grid-cols-[400px_1fr] gap-0 lg:gap-12">

                    {/* Left Side - Images/Media (Sticky on desktop) */}
                    <div className="p-6 lg:p-8 lg:h-full lg:overflow-y-auto custom-scrollbar-dark space-y-4 shrink-0">
                        <div className="bg-[#243342] rounded-3xl aspect-square flex items-center justify-center p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff8c42]/5 to-transparent mix-blend-overlay"></div>
                            <Diamond className="w-24 h-24 text-[#ff8c42] opacity-80 group-hover:scale-110 transition-transform duration-500" fill="#ff8c42" />
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <button key={i} className="aspect-square bg-[#243342] rounded-xl flex items-center justify-center border border-white/5 hover:border-[#ff8c42]/50 transition-colors">
                                    <Diamond className="w-6 h-6 text-[#ff8c42] opacity-50" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Information (Scrollable independently on desktop) */}
                    <div className="p-6 lg:p-8 lg:h-full lg:overflow-y-auto custom-scrollbar-dark flex flex-col">
                        <div className="mb-6 shrink-0">
                            <h3 className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-1.5">{diamond.businessName}</h3>
                            <h1 className="text-2xl font-serif text-white mb-2">{diamond.title.toUpperCase()}</h1>
                        </div>

                        {/* 2-Column Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1 mb-8 shrink-0">
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Carat</span>
                                <span className="text-sm text-white font-medium">{diamond.carat.toFixed(2)} ct</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Cut</span>
                                <span className="text-sm text-white font-medium">{diamond.cut}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Color</span>
                                <span className="text-sm text-white font-medium">{diamond.color}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Clarity</span>
                                <span className="text-sm text-white font-medium">{diamond.clarity}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Shape</span>
                                <span className="text-sm text-white font-medium">{diamond.shape}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Fluorescence</span>
                                <span className="text-sm text-white font-medium">{diamond.fluorescence}</span>
                            </div>
                        </div>

                        {/* Long Specs (Full Width) */}
                        <div className="space-y-1 mb-8 shrink-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b border-white/5 gap-2">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase">Measurements</span>
                                <span className="text-sm text-white font-medium">{diamond.measurements}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b border-white/5 gap-2">
                                <span className="text-[11px] font-bold tracking-[0.15em] text-[#8190a6] uppercase mt-1">Certificate</span>
                                <div className="text-right">
                                    <span className="text-sm text-[#ff8c42] font-bold block">{diamond.certificateNumber}</span>
                                    <span className="text-[10px] text-zinc-500">GIA Report</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#8190a6] text-xs leading-relaxed mb-8 shrink-0">
                            {diamond.description}
                        </p>

                        {/* Price and Actions - Pushed to bottom of available space, or scrollable */}
                        <div className="mt-auto shrink-0 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-[#8190a6] uppercase mb-1 flex items-center gap-2">
                                    Asking Price
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-[9px] text-emerald-500/80">Available</span>
                                </p>
                                <p className="text-3xl font-bold text-[#ff8c42]">${diamond.price.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-[#ff8c42] to-[#ff6b00] hover:to-[#e05b00] text-[#1b2733] text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,140,66,0.3)] hover:shadow-[0_0_25px_rgba(255,140,66,0.5)] hover:-translate-y-0.5">
                                    Inquire Now
                                </button>
                                <button className="px-6 py-3 bg-[#243342] border border-[#ff8c42]/20 text-sm hover:border-[#ff8c42]/60 hover:bg-[#ff8c42]/10 text-white font-bold rounded-xl transition-colors">
                                    Buy
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
