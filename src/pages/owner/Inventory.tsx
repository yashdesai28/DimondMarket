import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDiamonds, deleteDiamond, type Diamond } from '../../api/diamond.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, ExternalLink, Plus, Download, X, FileSpreadsheet } from 'lucide-react';
import AddDiamondPanel from '../../components/ui/AddDiamondPanel';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function Inventory() {
    const { businessId } = useAuthStore();
    const queryClient = useQueryClient();
    const [showAddPanel, setShowAddPanel] = useState(false);

    const { data: diamonds, isLoading } = useQuery({
        queryKey: ['diamonds', businessId],
        queryFn: () => fetchDiamonds(businessId!),
        enabled: !!businessId,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDiamond,
        onSuccess: () => {
            toast.success('Diamond removed from inventory');
            queryClient.invalidateQueries({ queryKey: ['diamonds', businessId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete diamond');
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this diamond from inventory?')) {
            deleteMutation.mutate(id);
        }
    };

    const exportToExcel = () => {
        if (!diamonds || diamonds.length === 0) {
            toast.error('No inventory to export');
            return;
        }

        // Format data for Excel
        const exportData = diamonds.map(d => ({
            'Certificate Number': d.certificateNumber,
            'Lab': d.certificateLab,
            'Shape': d.shape,
            'Carat Weight': d.carat,
            'Color': d.color,
            'Clarity': d.clarity,
            'Cut': d.cut || '-',
            'Polish': d.polish || '-',
            'Symmetry': d.symmetry || '-',
            'Fluorescence': d.fluorescence || '-',
            'Measurements': d.measurements || '-',
            'Price ($)': d.price,
            'Status': d.status
        }));

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

        // Download file
        XLSX.writeFile(workbook, 'Diamond_Inventory.xlsx');
    };

    if (isLoading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="h-full bg-white text-zinc-900">
            {/* Page Header */}
            <div className="px-8 pt-8 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Diamond Inventory</h1>
                        <p className="text-zinc-500 mt-1">Manage and view your listed diamonds.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-zinc-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                            onClick={exportToExcel}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                        </Button>
                        <Button
                            onClick={() => setShowAddPanel(prev => !prev)}
                            className={`transition-colors ${showAddPanel
                                ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                                }`}
                        >
                            {showAddPanel
                                ? <><X className="mr-2 h-4 w-4" /> Close</>
                                : <><Plus className="mr-2 h-4 w-4" /> Add Diamond</>}
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

            {/* Inventory Table */}
            <div className="px-8 py-6">
                <Card className="bg-white border-zinc-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-zinc-900 text-base">
                            Current Stock
                            <span className="ml-2 text-zinc-400 font-normal text-sm">({diamonds?.length || 0} diamonds)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-zinc-600">
                                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3">Cert No.</th>
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
                                            <td colSpan={7} className="text-center py-16 text-zinc-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-4xl">💎</span>
                                                    <p className="font-medium text-zinc-500">No diamonds yet</p>
                                                    <p className="text-sm">Click "Add Diamond" above to list your first stone.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        diamonds.map((d: Diamond) => (
                                            <tr key={d.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-semibold">
                                                            {d.certificateLab}
                                                        </span>
                                                        <span className="text-zinc-900">{d.certificateNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 capitalize">
                                                    {d.shape}{d.cut ? ` • ${d.cut}` : ''}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{d.carat} ct</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-zinc-900">{d.color}</span>
                                                    <span className="text-zinc-400 mx-1">/</span>
                                                    <span>{d.clarity}</span>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-emerald-600">
                                                    ${d.price.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${d.status === 'AVAILABLE'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                        }`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
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
                                                            onClick={() => handleDelete(d.id)}
                                                            disabled={deleteMutation.isPending}
                                                            title="Delete"
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-600"
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
