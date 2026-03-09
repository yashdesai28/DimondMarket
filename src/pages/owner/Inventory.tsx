import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDiamonds, deleteDiamond, type Diamond } from '../../api/diamond.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, ExternalLink, Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inventory() {
    const { businessId } = useAuthStore();
    const queryClient = useQueryClient();

    // If super admin is viewing, they need a way to pass businessId, 
    // but for simplicity, Owner runs this code with their businessId.
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

    const exportToCSV = () => {
        if (!diamonds) return;
        const headers = ['Certificate', 'Shape', 'Carat', 'Color', 'Clarity', 'Price'];
        const rows = diamonds.map(d => [d.certificateNumber, d.shape, d.carat, d.color, d.clarity, d.price]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "diamond_inventory.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (isLoading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="p-8 h-full bg-white text-zinc-900">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Diamond Inventory</h1>
                    <p className="text-zinc-500 mt-1">Manage and view your listed diamonds.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-zinc-300 text-zinc-600" onClick={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Diamond
                    </Button>
                </div>
            </div>

            <Card className="bg-white border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Current Stock ({diamonds?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-zinc-600">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-md">Cert No.</th>
                                    <th className="px-4 py-3">Details</th>
                                    <th className="px-4 py-3">Cts</th>
                                    <th className="px-4 py-3">Color / Clarity</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right rounded-tr-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diamonds?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-zinc-500">
                                            Inventory is empty. Add a diamond to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    diamonds?.map((d: Diamond) => (
                                        <tr key={d.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                                            <td className="px-4 py-3 font-medium flex gap-2 items-center">
                                                <span className="bg-white px-2 py-1 rounded text-xs">{d.certificateLab}</span>
                                                {d.certificateNumber}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{d.shape} {d.cut && `• ${d.cut}`}</td>
                                            <td className="px-4 py-3">{d.carat}</td>
                                            <td className="px-4 py-3">{d.color} / {d.clarity}</td>
                                            <td className="px-4 py-3 font-mono text-emerald-400">${d.price.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" title="View Store">
                                                        <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-zinc-900" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} disabled={deleteMutation.isPending} title="Delete">
                                                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
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
    );
}
