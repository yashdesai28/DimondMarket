import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDiamonds,
  deleteDiamond,
  seedDiamonds,
  updateDiamond,
} from "../../api/diamond.api";
import type { Diamond } from "../../api/diamond.api";
import { fetchBranding } from "../../api/business.api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Trash2,
  ExternalLink,
  Plus,
  X,
  FileSpreadsheet,
  Sparkles,
  Upload,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Eye,
  Download,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import AddDiamondPanel from "../../components/ui/AddDiamondPanel";
import BulkUploadModal from "../../components/ui/BulkUploadModal";
import EditDiamondModal from "../../components/ui/EditDiamondModal";
import ViewDiamondModal from "../../components/ui/ViewDiamondModal";
import { Checkbox } from "../../components/ui/checkbox";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Inventory() {
  const { businessId } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [viewingDiamond, setViewingDiamond] = useState<Diamond | null>(null);
  const [hoveredCert, setHoveredCert] = useState<string | null>(null);
  const [copiedCert, setCopiedCert] = useState<string | null>(null);
  const [isCertLoading, setIsCertLoading] = useState(true);

  // Selection & Modal State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Filter State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedShape, setSelectedShape] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedClarity, setSelectedClarity] = useState<string>("");
  const [selectedCut, setSelectedCut] = useState<string>("");
  const [caratMin, setCaratMin] = useState<string>("");
  const [caratMax, setCaratMax] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: [
      "diamonds",
      businessId,
      page,
      search,
      selectedShape,
      selectedColor,
      selectedClarity,
    ],
    queryFn: () =>
      fetchDiamonds({
        businessId: businessId!,
        page,
        limit,
        search: search || undefined,
        shape: selectedShape || undefined,
        colors: selectedColor || undefined,
        clarities: selectedClarity || undefined,
        cut: selectedCut || undefined,
        caratMin: caratMin ? parseFloat(caratMin) : undefined,
        caratMax: caratMax ? parseFloat(caratMax) : undefined,
      }),
    enabled: !!businessId,
  });

  const diamonds = data?.diamonds || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { data: branding } = useQuery({
    queryKey: ["branding", businessId],
    queryFn: () => fetchBranding(businessId!),
    enabled: !!businessId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiamond,
    onSuccess: () => {
      toast.success("Diamond removed from inventory");
      queryClient.invalidateQueries({ queryKey: ["diamonds", businessId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete diamond");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateDiamond(id, { status }),
    onSuccess: () => {
      toast.success("Diamond status updated");
      queryClient.invalidateQueries({ queryKey: ["diamonds", businessId] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Diamond",
      description: "Are you sure you want to delete this diamond? This action cannot be undone.",
      onConfirm: () => deleteMutation.mutate(id),
      variant: "destructive",
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === diamonds.length && diamonds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(diamonds.map((d: Diamond) => d.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getExportData = () => {
    return selectedIds.size > 0 
      ? diamonds.filter((d: Diamond) => selectedIds.has(d.id))
      : diamonds;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCert(text);
    setTimeout(() => setCopiedCert(null), 2000);
    toast.success("Certificate number copied");
  };

  const generateFileName = () => {
    const companyName = branding?.name.replace(/\s+/g, '') || "DiamondCo";
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.getHours().toString().padStart(2, '0') + "-" + now.getMinutes().toString().padStart(2, '0');
    return `${companyName}_${date}_${time}`;
  };

  const seedMutation = useMutation({
    mutationFn: seedDiamonds,
    onSuccess: () => {
      toast.success("Successfully added 5 dummy diamonds");
      queryClient.invalidateQueries({ queryKey: ["diamonds", businessId] });
    },
    onError: () => toast.error("Failed to seed diamonds"),
  });

  const exportToExcel = () => {
    if (!diamonds || diamonds.length === 0) {
      toast.error("No inventory to export");
      return;
    }

    const businessName = branding?.name || "Diamond Co";
    const address = branding?.address || "";
    const ownerInfo = `Owner: ${branding?.ownerName || "N/A"}`;
    const contactInfo = `Contact: ${branding?.contactNumber || branding?.whatsappNumber || "N/A"}`;

    const aoaData: (string | number)[][] = [];

    // Header Rows
    aoaData.push([businessName]);
    if (address) aoaData.push([address]);
    aoaData.push([`${ownerInfo} | ${contactInfo}`]);
    aoaData.push([]); // Spacer

    // Table Headers
    const headers = [
      "SR.NO",
      "STOCK",
      "SHAPE",
      "WEIGHT",
      "COLOR",
      "CLARITY",
      "CUT",
      "POLISH",
      "SYMMETRY",
      "FL",
      "MEASUREMENTS",
      "PRICE",
      "REPORT",
    ];
    aoaData.push(headers);

    const dataToExport = getExportData();

    dataToExport.forEach((d, i) => {
      aoaData.push([
        i + 1,
        d.certificateNumber ? `STOCK-${d.certificateNumber.slice(-4)}` : `STK-${i + 1}`,
        d.shape.toUpperCase(),
        d.carat,
        d.color,
        d.clarity,
        d.cut || "",
        d.polish || "",
        d.symmetry || "",
        d.fluorescence || "",
        d.measurements || "",
        d.price,
        d.certificateNumber ? `${d.certificateLab || ""} ${d.certificateNumber}` : "",
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
    const workbook = XLSX.utils.book_new();

    // Merging logic for headers
    const merge = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Business Name
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Address
      { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Owner/Contact
    ];
    worksheet["!merges"] = merge;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `${generateFileName()}.xlsx`);
  };

  const exportToCSV = () => {
    const dataToExport = getExportData();
    if (dataToExport.length === 0) return;
    
    // Header for CSV
    const headers = ["Cert No", "Shape", "Carat", "Color", "Clarity", "Cut", "Price", "Status"];
    const rows = dataToExport.map(d => [
      d.certificateNumber,
      d.shape,
      d.carat,
      d.color,
      d.clarity,
      d.cut || "",
      d.price,
      d.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${generateFileName()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const dataToExport = getExportData();
    if (dataToExport.length === 0) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(branding?.name || "Diamond Inventory", 105, 20, { align: "center" });
    
    const tableData = dataToExport.map((d, i) => [
      i + 1,
      d.certificateNumber,
      d.shape,
      d.carat,
      d.color,
      d.clarity,
      `$${d.price.toLocaleString()}`,
      d.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["#", "Cert No", "Shape", "Carat", "Color", "Clarity", "Price", "Status"]],
      body: tableData,
    });

    doc.save(`${generateFileName()}.pdf`);
  };

  if (isLoading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="h-full bg-white text-zinc-900">
      {/* Page Header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Diamond Inventory
            </h1>
            <p className="text-zinc-500 mt-1">
              Manage and view your listed diamonds.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => {
                setConfirmConfig({
                  isOpen: true,
                  title: "Seed Data",
                  description: "This will add 5 dummy diamonds to your inventory for testing. Continue?",
                  onConfirm: () => seedMutation.mutate(),
                });
              }}
              disabled={seedMutation.isPending}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {seedMutation.isPending ? "Seeding..." : "Seed Data"}
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-200 text-emerald-700 hover:bg-emerald-50"
                onClick={exportToExcel}
                title="Export Excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-200 text-blue-700 hover:bg-blue-50"
                onClick={exportToCSV}
                title="Export CSV"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-200 text-red-700 hover:bg-red-50"
                onClick={exportToPDF}
                title="Export PDF"
              >
                <FileText className="h-4 w-4 text-red-600" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Bulk Upload
            </Button>
            <Button
              onClick={() => setShowAddPanel((prev) => !prev)}
              className={`transition-colors ${
                showAddPanel
                  ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              {showAddPanel ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Close
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add Diamond
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-zinc-100">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Certificate Number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2 pr-4 border-r border-zinc-200">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600">Filters</span>
            </div>

            <select
              className="text-sm border-zinc-200 rounded-lg bg-white h-9 px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
              value={selectedShape}
              onChange={(e) => {
                setSelectedShape(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Shapes</option>
              <option value="ROUND">Round</option>
              <option value="OVAL">Oval</option>
              <option value="PEAR">Pear</option>
              <option value="EMERALD">Emerald</option>
              <option value="RADIANT">Radiant</option>
              <option value="MARQUISE">Marquise</option>
              <option value="PRINCESS">Princess</option>
              <option value="CUSHION">Cushion</option>
            </select>

            <select
              className="text-sm border-zinc-200 rounded-lg bg-white h-9 px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
              value={selectedCut}
              onChange={(e) => {
                setSelectedCut(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Cuts</option>
              <option value="EX">Excellent</option>
              <option value="VG">Very Good</option>
              <option value="G">Good</option>
            </select>

            <div className="flex items-center gap-1.5 px-3 h-9 bg-white border border-zinc-200 rounded-lg">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Carat</span>
              <input 
                type="number" 
                placeholder="Min" 
                className="w-12 text-sm outline-none bg-transparent"
                value={caratMin}
                onChange={(e) => {
                  setCaratMin(e.target.value);
                  setPage(1);
                }}
              />
              <span className="text-zinc-300">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                className="w-12 text-sm outline-none bg-transparent"
                value={caratMax}
                onChange={(e) => {
                  setCaratMax(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="text-sm border-zinc-200 rounded-lg bg-white h-9 px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Colors</option>
              {['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="text-sm border-zinc-200 rounded-lg bg-white h-9 px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
              value={selectedClarity}
              onChange={(e) => {
                setSelectedClarity(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Clarities</option>
              {['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-zinc-900"
              onClick={() => {
                setSelectedShape("");
                setSelectedColor("");
                setSelectedClarity("");
                setSelectedCut("");
                setCaratMin("");
                setCaratMax("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Add Diamond Panel */}
      {showAddPanel && (
        <AddDiamondPanel
          businessId={businessId!}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        businessId={businessId!}
      />

      {/* Edit Diamond Modal */}
      {editingDiamond && (
        <EditDiamondModal
          isOpen={!!editingDiamond}
          onClose={() => setEditingDiamond(null)}
          diamond={editingDiamond}
          businessId={businessId!}
        />
      )}

      {/* View Diamond Modal */}
      {viewingDiamond && (
        <ViewDiamondModal
          isOpen={!!viewingDiamond}
          onClose={() => setViewingDiamond(null)}
          diamond={viewingDiamond}
        />
      )}

      {/* Inventory Table */}
      <div className="px-8 py-6">
        <Card className="bg-white border-zinc-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-900 text-base">
              Current Stock
              <span className="ml-2 text-zinc-400 font-normal text-sm">
                ({total} diamonds)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-600">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <Checkbox 
                        checked={diamonds.length > 0 && selectedIds.size === diamonds.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3">Cert No. / Added By</th>
                    <th className="px-6 py-3">Shape / Cut</th>
                    <th className="px-6 py-3">Carats</th>
                    <th className="px-6 py-3">Color / Clarity</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!diamonds || diamonds.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-16 text-zinc-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">💎</span>
                          <p className="font-medium text-zinc-500">
                            No diamonds yet
                          </p>
                          <p className="text-sm">
                            Click "Add Diamond" above to list your first stone.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    diamonds.map((d: Diamond) => (
                      <tr
                        key={d.id}
                        className={`border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${selectedIds.has(d.id) ? 'bg-zinc-50/80' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <Checkbox 
                            checked={selectedIds.has(d.id)}
                            onCheckedChange={() => toggleSelectOne(d.id)}
                          />
                        </td>
                        <td className="px-6 py-4 relative group/row">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-semibold">
                                {d.certificateLab}
                              </span>
                              <div 
                                className="relative cursor-help"
                                onMouseEnter={() => {
                                  setHoveredCert(d.certificateNumber || "");
                                  setIsCertLoading(true);
                                }}
                                onMouseLeave={() => setHoveredCert(null)}
                              >
                                <span className="text-zinc-900 font-medium border-b border-dotted border-zinc-300">
                                  {d.certificateNumber}
                                </span>
                                
                                {hoveredCert === d.certificateNumber && (
                                  <div className="absolute left-full top-0 ml-4 z-[999] w-72 p-3 bg-white rounded-xl shadow-2xl border border-zinc-100 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Certificate Preview</span>
                                        <span className="bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">{d.certificateLab}</span>
                                      </div>
                                      
                                      <div className="aspect-[3/4] rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden relative">
                                        {(d.certificateLab === 'IGI' || d.certificateLab === 'GIA') ? (
                                           <>
                                             {isCertLoading && (
                                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                                 <Loader2 className="h-6 w-6 animate-spin text-zinc-900 mb-2" />
                                                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading PDF...</span>
                                               </div>
                                             )}
                                             <embed 
                                               src={`http://localhost:4000/api/diamonds/certificate/${d.certificateLab}/${d.certificateNumber}`}
                                               type="application/pdf"
                                               className={`w-[300%] h-[300%] scale-[0.33] origin-top-left border-none pointer-events-none transition-opacity duration-300 ${isCertLoading ? 'opacity-0' : 'opacity-100'}`}
                                               onLoad={() => {
                                                  // Small delayed transition for smoother appearance
                                                  setTimeout(() => setIsCertLoading(false), 300);
                                               }}
                                             />
                                           </>
                                        ) : (
                                          <div className="text-center p-4">
                                            <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                            <p className="text-[10px] text-zinc-500 font-medium">Preview only available for IGI/GIA. Click to view report details.</p>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <a 
                                          href={`http://localhost:4000/api/diamonds/certificate/${d.certificateLab}/${d.certificateNumber}`}
                                          target="_blank"
                                          className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-lg transition-all"
                                        >
                                          <ExternalLink className="h-3 w-3" /> View Full
                                        </a>
                                        <a 
                                           href={`http://localhost:4000/api/diamonds/certificate/${d.certificateLab}/${d.certificateNumber}`}
                                           download={`certificate_${d.certificateNumber}.pdf`}
                                           className="flex items-center justify-center w-8 h-8 bg-zinc-900 text-white rounded-lg hover:shadow-lg transition-all"
                                        >
                                          <Download className="h-3.5 w-3.5" />
                                        </a>
                                      </div>
                                    </div>
                                    <div className="absolute -left-1 top-4 w-2 h-2 bg-white border-l border-b border-zinc-100 -rotate-45" />
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => handleCopy(d.certificateNumber || "")}
                                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
                                title="Copy Certificate"
                              >
                                {copiedCert === d.certificateNumber ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              Added by: {d.creator?.name || d.creator?.email?.split("@")[0] || "System"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {d.shape}
                          {d.cut ? ` • ${d.cut}` : ""}
                        </td>
                        <td className="px-6 py-4 font-medium">{d.carat} ct</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-zinc-900">
                            {d.color}
                          </span>
                          <span className="text-zinc-400 mx-1">/</span>
                          <span>{d.clarity}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-600">
                          ${d.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              d.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : d.status === "HOLD"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-orange-50 text-orange-700 border border-orange-200"
                            }`}
                          >
                            {d.status === "HOLD" ? "On Hold" : d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => setViewingDiamond(d)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Store"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Diamond"
                              className="h-8 w-8 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => setEditingDiamond(d)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(d.id)}
                              disabled={deleteMutation.isPending}
                              title="Delete"
                              className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50">
                <div className="text-sm text-zinc-500">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show a window of pages around current
                    let pageNum = page;
                    if (totalPages > 5) {
                      if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                    } else {
                      pageNum = i + 1;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${page === pageNum ? "bg-zinc-900" : ""}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-bold tracking-tight">
                {selectedIds.size} {selectedIds.size === 1 ? 'Diamond' : 'Diamonds'} Selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10 text-white shadow-2xl">
                  <DropdownMenuItem onClick={exportToExcel} className="hover:bg-white/10 cursor-pointer gap-2 py-2.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV} className="hover:bg-white/10 cursor-pointer gap-2 py-2.5">
                    <FileText className="h-4 w-4 text-blue-500" /> CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF} className="hover:bg-white/10 cursor-pointer gap-2 py-2.5">
                    <FileText className="h-4 w-4 text-red-500" /> PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  );
}
