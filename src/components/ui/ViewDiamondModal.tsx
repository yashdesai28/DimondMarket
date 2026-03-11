import type { Diamond } from "../../api/diamond.api";
import { StandardModal } from "./StandardModal";
import { Button } from "./button";
import { 
  BadgeCheck, 
  Layers, 
  Diamond as DiamondIcon, 
  FileText,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useState } from "react";

interface ViewDiamondModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamond: Diamond;
}

export default function ViewDiamondModal({ isOpen, onClose, diamond }: ViewDiamondModalProps) {
  const [isCertLoading, setIsCertLoading] = useState(true);

  const certUrl = (diamond.certificateLab === 'IGI' || diamond.certificateLab === 'GIA')
    ? `http://localhost:4000/api/diamonds/certificate/${diamond.certificateLab}/${diamond.certificateNumber}`
    : null;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      title="Diamond Details"
      description={`${diamond.certificateLab} ${diamond.certificateNumber} · ${diamond.carat}ct ${diamond.shape}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-2">
        {/* Column 1: Diamond Image & Basic Info */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 relative group">
            {diamond.images && diamond.images.length > 0 ? (
              <img 
                src={diamond.images[0]} 
                alt="Diamond" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                <DiamondIcon className="h-16 w-16 mb-2" />
                <span className="text-sm">No image available</span>
              </div>
            )}
            <div className="absolute top-4 right-4 capitalize px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold shadow-sm border border-zinc-100">
              {diamond.status.toLowerCase().replace('_', ' ')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Color</span>
              <span className="text-base font-bold text-zinc-900">{diamond.color}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Clarity</span>
              <span className="text-base font-bold text-zinc-900">{diamond.clarity}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Carat</span>
              <span className="text-base font-bold text-zinc-900">{diamond.carat}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Certificate Preview (Centrally Focus) */}
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BadgeCheck className="h-3 w-3" /> Certification & Lab
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-xs text-zinc-500">Lab</span>
                <span className="text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200 px-2 py-0.5 rounded uppercase">{diamond.certificateLab}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-xs text-zinc-500">Cert No</span>
                <span className="text-xs font-bold text-zinc-900">{diamond.certificateNumber}</span>
              </div>
            </div>
            
            {certUrl && (
              <div className="space-y-3">
                <div className="aspect-[3/4] rounded-2xl border border-zinc-200 bg-zinc-50 relative overflow-hidden h-[400px]">
                  {isCertLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-zinc-900 mb-2" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading PDF...</span>
                    </div>
                  )}
                  <embed 
                    src={certUrl} 
                    type="application/pdf"
                    className="w-full h-full"
                    onLoad={() => setIsCertLoading(false)}
                  />
                </div>
                <a 
                  href={certUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-bold text-zinc-700 transition-colors"
                >
                  <FileText className="h-4 w-4" /> View Full Report <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </section>
        </div>

        {/* Column 3: Technical Specs & Footer */}
        <div className="flex flex-col">
          <section className="flex-1 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="h-3 w-3" /> Technical Specs
              </h3>
              <div className="grid grid-cols-1 gap-y-3">
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Cut</span>
                  <span className="text-sm font-semibold text-zinc-900">{diamond.cut || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Polish</span>
                  <span className="text-sm font-semibold text-zinc-900">{diamond.polish || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Symmetry</span>
                  <span className="text-sm font-semibold text-zinc-900">{diamond.symmetry || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Fluorescence</span>
                  <span className="text-sm font-semibold text-zinc-900">{diamond.fluorescence || 'N/A'}</span>
                </div>
                <div className="flex flex-col py-1 border-b border-zinc-50">
                  <span className="text-xs text-zinc-500 mb-1">Measurements</span>
                  <span className="text-sm font-bold text-zinc-900">{diamond.measurements || 'N/A'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-zinc-100 mt-6 space-y-4">
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Asking Price</span>
                  <span className="text-2xl font-bold text-emerald-600">${diamond.price.toLocaleString()}</span>
               </div>
               {diamond.creator && (
                 <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Added By</span>
                    <span className="text-sm font-bold text-zinc-900">{diamond.creator.name || diamond.creator.email.split('@')[0]}</span>
                 </div>
               )}
            </div>
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11" onClick={onClose}>
              Close Details
            </Button>
          </section>
        </div>
      </div>
    </StandardModal>
  );
}
