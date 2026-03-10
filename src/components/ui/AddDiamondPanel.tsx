import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiamond, fetchByCertificateId, extractCertificateFile } from '../../api/diamond.api';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent } from './card';
import toast from 'react-hot-toast';
import {
    X,
    ChevronDown,
    Hash,
    FileUp,
    ClipboardList,
    Loader2,
    CheckCircle2,
    Search,
    Link,
    Upload,
} from 'lucide-react';

type Method = 'id' | 'file' | 'manual';

const SHAPES = ['Round', 'Princess', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Marquise', 'Radiant', 'Asscher', 'Heart'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const GRADES = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const FLUORESCENCES = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];
const LABS = ['GIA', 'IGI', 'HRD', 'AGS', 'EGL'];

const defaultForm = {
    certificateNumber: '',
    certificateLab: 'GIA',
    shape: 'Round',
    carat: '',
    color: 'D',
    clarity: 'FL',
    cut: 'Excellent',
    polish: 'Excellent',
    symmetry: 'Excellent',
    fluorescence: 'None',
    measurements: '',
    price: '',
    stockQuantity: '1',
    videoLink: '',
};

/* Moved outside of AddDiamondPanel to prevent unmount/remount on every state change, which causes input focus loss */
const SelectField = ({
    label, field, options, formData, updateForm,
}: { label: string; field: string; options: string[]; formData: any; updateForm: (f: string, v: string) => void }) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</Label>
        <select
            value={(formData as any)[field]}
            onChange={e => updateForm(field, e.target.value)}
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const TextField = ({
    label, field, type = 'text', placeholder = '', step, formData, updateForm,
}: { label: string; field: string; type?: string; placeholder?: string; step?: string; formData: any; updateForm: (f: string, v: string) => void }) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</Label>
        <Input
            type={type}
            step={step}
            placeholder={placeholder}
            value={(formData as any)[field]}
            onChange={e => updateForm(field, e.target.value)}
            className="h-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-zinc-400"
        />
    </div>
);

interface AddDiamondPanelProps {
    businessId: string;
    onClose: () => void;
}

export default function AddDiamondPanel({ businessId, onClose }: AddDiamondPanelProps) {
    const queryClient = useQueryClient();
    const [method, setMethod] = useState<Method>('id');
    const [formData, setFormData] = useState(defaultForm);
    const [certIdInput, setCertIdInput] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);
    const [prefilled, setPrefilled] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateForm = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const saveMutation = useMutation({
        mutationFn: createDiamond,
        onSuccess: () => {
            toast.success('Diamond added to inventory!');
            queryClient.invalidateQueries({ queryKey: ['diamonds', businessId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add diamond');
        },
    });

    const fetchIdMutation = useMutation({
        mutationFn: (id: string) => fetchByCertificateId(id),
        onSuccess: (data: any) => {
            const d = data?.data || data;
            setFormData(prev => ({ ...prev, ...d }));
            setPrefilled(true);
            setMethod('manual');
            toast.success('Details fetched — please review and submit.');
        },
        onError: () => toast.error('Could not fetch certificate details'),
    });

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => extractCertificateFile(file),
        onSuccess: (data: any) => {
            const d = data?.data || data;
            setFormData(prev => ({ ...prev, ...d }));
            setPrefilled(true);
            setMethod('manual');
            toast.success('Certificate data extracted — please review and submit.');
        },
        onError: () => toast.error('Failed to extract certificate data'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => { if (v) data.append(k, String(v)); });
        saveMutation.mutate(data);
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setCertFile(file);
    };

    const methods: { key: Method; label: string; icon: React.ReactNode; description: string }[] = [
        { key: 'id', label: 'Certificate ID', icon: <Hash className="h-4 w-4" />, description: 'Fetch by GIA / IGI number' },
        { key: 'file', label: 'Upload Certificate', icon: <FileUp className="h-4 w-4" />, description: 'OCR extract from PDF / image' },
        { key: 'manual', label: 'Manual Entry', icon: <ClipboardList className="h-4 w-4" />, description: 'Fill all fields yourself' },
    ];

    return (
        <div className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-white animate-in slide-in-from-top-2 duration-300">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                        <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-900">Add New Diamond</h2>
                        <p className="text-xs text-zinc-500">Select a method to add a diamond to your inventory</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="px-8 py-6">
                {/* Method Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {methods.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setMethod(m.key)}
                            className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 text-left transition-all duration-200 ${method === m.key
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                }`}
                        >
                            <div className={`p-1.5 rounded-md ${method === m.key ? 'bg-white/20' : 'bg-zinc-100'}`}>
                                {m.icon}
                            </div>
                            <span className="text-sm font-semibold">{m.label}</span>
                            <span className={`text-xs ${method === m.key ? 'text-zinc-300' : 'text-zinc-400'}`}>{m.description}</span>
                        </button>
                    ))}
                </div>

                {/* Method: Certificate ID */}
                {method === 'id' && (
                    <Card className="border-zinc-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="text-center mb-6">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
                                        <Search className="h-6 w-6 text-zinc-600" />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900">Fetch by Certificate Number</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Enter a GIA or IGI certificate number to auto-fill diamond details</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Certificate Number</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={certIdInput}
                                            onChange={e => setCertIdInput(e.target.value)}
                                            placeholder="e.g. 2496786926"
                                            className="bg-white border-zinc-200 text-zinc-900"
                                            onKeyDown={e => e.key === 'Enter' && certIdInput && fetchIdMutation.mutate(certIdInput)}
                                        />
                                        <Button
                                            onClick={() => fetchIdMutation.mutate(certIdInput)}
                                            disabled={!certIdInput || fetchIdMutation.isPending}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
                                        >
                                            {fetchIdMutation.isPending
                                                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Fetching...</>
                                                : <><Search className="h-4 w-4 mr-2" />Fetch Details</>}
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-400 text-center">Supports GIA, IGI, HRD, AGS certificate numbers</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Method: Upload Certificate */}
                {method === 'file' && (
                    <Card className="border-zinc-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="text-center mb-4">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
                                        <FileUp className="h-6 w-6 text-zinc-600" />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900">Upload Certificate File</h3>
                                    <p className="text-sm text-zinc-500 mt-1">AI/OCR will extract diamond details automatically</p>
                                </div>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${dragOver ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50/50'
                                        } ${certFile ? 'border-emerald-400 bg-emerald-50' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,image/*,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={e => setCertFile(e.target.files?.[0] || null)}
                                    />
                                    {certFile ? (
                                        <div className="space-y-2">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                                            <p className="font-medium text-emerald-700 text-sm">{certFile.name}</p>
                                            <p className="text-xs text-emerald-500">
                                                {(certFile.size / 1024).toFixed(1)} KB — Click to change
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="h-8 w-8 text-zinc-400 mx-auto" />
                                            <p className="text-sm font-medium text-zinc-600">Drop file here or click to browse</p>
                                            <p className="text-xs text-zinc-400">Supports PDF, JPG, PNG</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => certFile && uploadFileMutation.mutate(certFile)}
                                    disabled={!certFile || uploadFileMutation.isPending}
                                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
                                >
                                    {uploadFileMutation.isPending
                                        ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Extracting data...</>
                                        : <><FileUp className="h-4 w-4 mr-2" />Extract Diamond Data</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Method: Manual Entry / Review Form */}
                {method === 'manual' && (
                    <Card className="border-zinc-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            {prefilled && (
                                <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span className="text-sm text-emerald-700 font-medium">Fields pre-filled from certificate — please review before submitting.</span>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Section: Certificate Info */}
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Certificate Information</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <SelectField label="Lab" field="certificateLab" options={LABS} formData={formData} updateForm={updateForm} />
                                        <div className="col-span-2 md:col-span-2 space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Certificate Number</Label>
                                            <Input
                                                value={formData.certificateNumber}
                                                onChange={e => updateForm('certificateNumber', e.target.value)}
                                                placeholder="e.g. 2496786926"
                                                className="bg-white border-zinc-200 text-zinc-900"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section: 4Cs & Grading */}
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">4Cs &amp; Grading</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <SelectField label="Shape" field="shape" options={SHAPES} formData={formData} updateForm={updateForm} />
                                        <TextField label="Carat Weight" field="carat" type="number" step="0.001" placeholder="e.g. 1.50" formData={formData} updateForm={updateForm} />
                                        <SelectField label="Color" field="color" options={COLORS} formData={formData} updateForm={updateForm} />
                                        <SelectField label="Clarity" field="clarity" options={CLARITIES} formData={formData} updateForm={updateForm} />
                                        <SelectField label="Cut" field="cut" options={GRADES} formData={formData} updateForm={updateForm} />
                                        <SelectField label="Polish" field="polish" options={GRADES} formData={formData} updateForm={updateForm} />
                                        <SelectField label="Symmetry" field="symmetry" options={GRADES} formData={formData} updateForm={updateForm} />
                                        <SelectField label="Fluorescence" field="fluorescence" options={FLUORESCENCES} formData={formData} updateForm={updateForm} />
                                    </div>
                                </div>

                                {/* Section: Physical Details + Pricing & Stock + Video — 4 in one row */}
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Measurements, Pricing &amp; Stock</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <TextField label="Measurements" field="measurements" placeholder="e.g. 6.40×6.43×3.96" formData={formData} updateForm={updateForm} />
                                        <TextField label="Price ($)" field="price" type="number" step="0.01" placeholder="e.g. 5000.00" formData={formData} updateForm={updateForm} />
                                        <TextField label="Stock Qty" field="stockQuantity" type="number" placeholder="e.g. 1" formData={formData} updateForm={updateForm} />
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                                                <Link className="h-3 w-3" /> Video Link
                                            </Label>
                                            <Input
                                                type="url"
                                                placeholder="https://..."
                                                value={formData.videoLink}
                                                onChange={e => updateForm('videoLink', e.target.value)}
                                                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-zinc-200 text-zinc-600"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saveMutation.isPending}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[140px]"
                                    >
                                        {saveMutation.isPending
                                            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                                            : 'Add to Inventory'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
