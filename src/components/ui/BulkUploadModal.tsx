import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkUploadDiamonds } from '../../api/diamond.api';
import { StandardModal } from './StandardModal';
import { Button } from './button';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
}

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
    const [uploadResult, setUploadResult] = useState<{
        insertedCount: number;
        failedCount: number;
        errors: { row: number, error: string }[];
    } | null>(null);

    const uploadMutation = useMutation({
        mutationFn: bulkUploadDiamonds,
        onSuccess: (data) => {
            setUploadResult(data);
            queryClient.invalidateQueries({ queryKey: ['diamonds'] });
            if (data.failedCount === 0) {
                toast.success(`Successfully uploaded ${data.insertedCount} diamonds!`);
            } else {
                toast.success(`Uploaded ${data.insertedCount} diamonds, with ${data.failedCount} errors.`);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to upload file. Please try again.');
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadResult(null);

            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Find the actual header row (skip branding/padding)
                const dataAOA = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                let headerRowIndex = 0;
                const requiredKeywords = ['SHAPE', 'WEIGHT', 'CARAT', 'COLOR', 'CLARITY'];

                for (let i = 0; i < Math.min(dataAOA.length, 20); i++) {
                    const row = dataAOA[i];
                    if (!Array.isArray(row)) continue;

                    const matches = row.filter(cell =>
                        cell && requiredKeywords.some(kw => cell.toString().toUpperCase().includes(kw))
                    ).length;

                    if (matches >= 3) {
                        headerRowIndex = i;
                        break;
                    }
                }

                let jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
                    range: headerRowIndex,
                    defval: ''
                });

                // Filter out empty rows
                jsonData = jsonData.filter(row => Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== ''));

                if (jsonData.length > 0) {
                    setPreviewHeaders(Object.keys(jsonData[0]));
                    setPreviewData(jsonData);
                } else {
                    setPreviewData([]);
                    setPreviewHeaders([]);
                }
            } catch (err) {
                toast.error('Failed to parse file for preview.');
            }
        }
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        if (previewData && previewData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(previewData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            const newFile = new File([excelBuffer], selectedFile.name, {
                type: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            uploadMutation.mutate(newFile);
        } else {
            uploadMutation.mutate(selectedFile);
        }
    };

    const resetAndClose = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setPreviewData(null);
        setPreviewHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    return (
        <StandardModal
            isOpen={isOpen}
            onClose={resetAndClose}
            maxWidth={previewData && !uploadResult ? '5xl' : 'md'}
            title={uploadResult ? "Upload Results" : previewData ? "Preview & Edit Data" : "Bulk Upload Diamonds"}
            description={uploadResult
                ? "Here is the summary of your bulk upload."
                : previewData ? `Review and adjust the ${previewData.length} records before importing.` : "Upload an Excel (.xlsx) or CSV file containing your diamond inventory."}
        >
            <div className="py-4">
                {!uploadResult ? (
                    !previewData ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <div
                                className="flex flex-col items-center cursor-pointer w-full h-full text-center"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedFile ? (
                                    <>
                                        <FileSpreadsheet className="h-12 w-12 text-zinc-900 mb-3" />
                                        <p className="text-zinc-900 font-medium">{selectedFile.name}</p>
                                        <p className="text-zinc-500 text-sm mt-1">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                        <p className="text-emerald-600 text-sm mt-4 font-medium hover:underline">
                                            Click to choose a different file
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-12 w-12 text-zinc-400 mb-3" />
                                        <p className="text-zinc-700 font-medium">Click to select file</p>
                                        <p className="text-zinc-500 text-sm mt-1">.xlsx, .xls, or .csv</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                                <span className="text-sm font-medium text-zinc-700">File: {selectedFile?.name}</span>
                                <Button variant="outline" size="sm" onClick={() => { setPreviewData(null); setSelectedFile(null); }}>
                                    Choose Different File
                                </Button>
                            </div>
                            <div className="overflow-x-auto max-h-[50vh] border border-zinc-200 rounded-lg custom-scrollbar">
                                <table className="w-full text-sm text-left relative">
                                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-100 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 min-w-[50px] font-medium border-b border-r border-zinc-200">#</th>
                                            {previewHeaders.map(h => (
                                                <th key={h} className="px-4 py-3 font-medium border-b border-r border-zinc-200 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 bg-white">
                                        {previewData.map((row, rIdx) => (
                                            <tr key={rIdx} className="hover:bg-zinc-50 transition-colors focus-within:bg-blue-50">
                                                <td className="px-4 py-2 text-zinc-400 border-r border-zinc-100 font-medium text-center">{rIdx + 1}</td>
                                                {previewHeaders.map(h => (
                                                    <td key={h} className="p-0 border-r border-zinc-100 last:border-r-0">
                                                        <input
                                                            type="text"
                                                            value={row[h] || ''}
                                                            onChange={(e) => {
                                                                const newData = [...previewData];
                                                                newData[rIdx] = { ...newData[rIdx], [h]: e.target.value };
                                                                setPreviewData(newData);
                                                            }}
                                                            className="w-full min-w-[100px] h-full px-3 py-2 bg-transparent border-none outline-none text-zinc-900 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-900">Success</p>
                                <p className="text-sm">Successfully imported {uploadResult.insertedCount} diamonds.</p>
                            </div>
                        </div>

                        {uploadResult.failedCount > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2 text-red-800 mb-2 font-semibold">
                                    <AlertCircle className="h-5 w-5" />
                                    {uploadResult.failedCount} rows failed to import
                                </div>
                                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {uploadResult.errors.map((err, idx) => (
                                            <li key={idx}><strong>Row {err.row}:</strong> {err.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={resetAndClose}>
                    {uploadResult ? "Close" : "Cancel"}
                </Button>
                {!uploadResult && (
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadMutation.isPending}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white"
                    >
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                    </Button>
                )}
            </div>
        </StandardModal>
    );
}
