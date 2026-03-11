import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDiamond } from "../../api/diamond.api";
import type { Diamond } from "../../api/diamond.api";
import { StandardModal } from "./StandardModal";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import toast from "react-hot-toast";
import {
  Loader2,
  Upload,
  X,
  DollarSign,
  Tag,
  Image,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditDiamondModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamond: Diamond;
  businessId: string;
}

type StatusOption = {
  value: string;
  label: string;
  color: string;
  bg: string;
  border: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "AVAILABLE",
    label: "Available",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
  },
  {
    value: "HOLD",
    label: "On Hold",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  {
    value: "SOLD",
    label: "Sold",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function getStatusOption(value: string): StatusOption {
  return STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditDiamondModal({
  isOpen,
  onClose,
  diamond,
  businessId,
}: EditDiamondModalProps) {
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [formData, setFormData] = useState({
    certificateNumber: diamond.certificateNumber || "",
    certificateLab: diamond.certificateLab || "GIA",
    shape: diamond.shape,
    carat: String(diamond.carat),
    color: diamond.color,
    clarity: diamond.clarity,
    cut: diamond.cut || "Excellent",
    polish: diamond.polish || "Excellent",
    symmetry: diamond.symmetry || "Excellent",
    fluorescence: diamond.fluorescence || "None",
    measurements: diamond.measurements || "",
    price: String(diamond.price),
    videoUrl: diamond.videoUrl || "",
    status: diamond.status as string,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const updateForm = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ─── Mutation ──────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updateDiamond(diamond.id, formData),
    onSuccess: () => {
      toast.success("Diamond updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["diamonds", businessId] });
      queryClient.invalidateQueries({ queryKey: ["diamond", diamond.id] });
      handleClose();
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update diamond",
      );
    },
  });

  // ─── Image helpers ─────────────────────────────────────────────────────────

  const addImages = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files.");
      return;
    }

    const combined = [...newImages, ...imageFiles].slice(0, 10); // Max 10 images
    setNewImages(combined);

    const previews = combined.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) addImages(files);
    // Reset input so same file can be re-selected
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImageDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        data.append(k, String(v));
      }
    });

    newImages.forEach((img) => data.append("images", img));

    mutation.mutate(data);
  };

  // ─── Close / Reset ─────────────────────────────────────────────────────────

  const handleClose = () => {
    // Revoke any created object URLs to prevent memory leaks
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImages([]);
    setImagePreviews([]);
    onClose();
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const hasChanges = true; // For simplicity in complex edit modal

  const selectedStatus = getStatusOption(formData.status);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="3xl"
      title="Edit Diamond"
      description={`Update diamond details for ${diamond.certificateLab} ${diamond.certificateNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2 pb-6">
        {/* Certificate Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            Certificate & Grading
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Lab
              </Label>
              <select
                value={formData.certificateLab}
                onChange={(e) => updateForm("certificateLab", e.target.value)}
                disabled={!!diamond.certificateNumber}
                className={`w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${!!diamond.certificateNumber ? "bg-zinc-50 cursor-not-allowed text-zinc-500" : ""}`}
              >
                {["GIA", "IGI", "HRD", "AGS", "OTHER"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Certificate No.
              </Label>
              <Input
                value={formData.certificateNumber}
                onChange={(e) => updateForm("certificateNumber", e.target.value)}
                readOnly={!!diamond.certificateNumber}
                className={`h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400 ${!!diamond.certificateNumber ? "bg-zinc-50 cursor-not-allowed text-zinc-500" : ""}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Shape
              </Label>
              <Input
                value={formData.shape}
                onChange={(e) => updateForm("shape", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Carat
              </Label>
              <Input
                type="number"
                step="0.001"
                value={formData.carat}
                onChange={(e) => updateForm("carat", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Color
              </Label>
              <Input
                value={formData.color}
                onChange={(e) => updateForm("color", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Clarity
              </Label>
              <Input
                value={formData.clarity}
                onChange={(e) => updateForm("clarity", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Cut
              </Label>
              <Input
                value={formData.cut}
                onChange={(e) => updateForm("cut", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Polish
              </Label>
              <Input
                value={formData.polish}
                onChange={(e) => updateForm("polish", e.target.value)}
                className="h-10 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Status Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            Pricing, Status & Images
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  <DollarSign className="h-3.5 w-3.5" />
                  Price (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    className="pl-7 bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400 h-11 text-base font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  <Tag className="h-3.5 w-3.5" />
                  Status
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateForm("status", opt.value)}
                      className={`
                        flex flex-col items-center justify-center py-2 px-1 rounded-lg border-2 text-[11px] font-bold transition-all duration-150
                        ${
                          formData.status === opt.value
                            ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm`
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  <Image className="h-3.5 w-3.5" />
                  Add Images
                </Label>

                {/* New image previews */}
                {imagePreviews.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 group grow-0"
                      >
                        <img
                          src={src}
                          alt="Pre"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${imageDragOver ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50"}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setImageDragOver(true);
                    }}
                    onDragLeave={() => setImageDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-5 w-5 text-zinc-400 mx-auto mb-1" />
                    <span className="text-xs text-zinc-500">
                      Upload new images
                    </span>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Help */}
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${selectedStatus.bg} ${selectedStatus.border}`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              formData.status === "AVAILABLE"
                ? "bg-emerald-500"
                : formData.status === "HOLD" || formData.status === "ON_HOLD"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
          <span className={`text-sm font-medium ${selectedStatus.color}`}>
            Marked as <strong>{selectedStatus.label}</strong>
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-200 text-zinc-600"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || !hasChanges}
            className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[130px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </StandardModal>
  );
}
