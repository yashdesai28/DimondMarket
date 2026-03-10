import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchBusinesses, deleteBusiness, type Business } from '../../api/business.api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { StandardModal } from '../../components/ui/StandardModal';
import { Loader } from '../../components/ui/Loader';
import { useState } from 'react';

export default function BusinessList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { data: businesses, isLoading } = useQuery({
        queryKey: ['businesses'],
        queryFn: fetchBusinesses,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBusiness,
        onSuccess: () => {
            toast.success('Business deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
            setBusinessToDelete(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete business');
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    if (isLoading) return <Loader fullScreen text="Loading businesses..." />;

    return (
        <div className="p-8 h-full bg-white text-zinc-900">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
                    <p className="text-zinc-500 mt-1">Manage all registered businesses and their owner accounts.</p>
                </div>
                <Button onClick={() => navigate('/admin/businesses/add')} className="bg-zinc-900 hover:bg-zinc-800 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Business
                </Button>
            </div>

            <Card className="bg-white border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Registered Businesses ({businesses?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left text-zinc-600">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-md whitespace-nowrap">Business Name</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Owner</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Email</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 text-right rounded-tr-md whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {businesses?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-zinc-500">
                                            No businesses found. Click "Add Business" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    businesses?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((b: Business) => (
                                        <tr key={b.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                                            <td className="px-4 py-3 font-medium flex items-center gap-3">
                                                {b.logoUrl ? (
                                                    <img src={b.logoUrl} alt={b.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold ring-1 ring-zinc-700 shrink-0">
                                                        {b.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-[120px]">
                                                    <div className="text-slate-900 truncate">{b.name}</div>
                                                    <div className="text-xs text-zinc-500 font-mono text-[10px] mt-0.5 truncate">/{b.slug}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">{b.ownerName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{b.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${b.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {b.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => window.open(`/${b.slug}/login`, '_blank')} title="Owner Portal">
                                                        <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-zinc-900" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/businesses/${b.id}/edit`)} title="Edit Business">
                                                        <Edit className="h-4 w-4 text-zinc-900 hover:text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setBusinessToDelete(b)} disabled={deleteMutation.isPending} title="Delete Business">
                                                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {businesses && businesses.length > itemsPerPage && (
                        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-slate-500 w-full">
                            <div>
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, businesses.length)} of {businesses.length} businesses
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(businesses.length / itemsPerPage), p + 1))}
                                    disabled={currentPage === Math.ceil(businesses.length / itemsPerPage)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <StandardModal
                isOpen={!!businessToDelete}
                onClose={() => setBusinessToDelete(null)}
                title="Remove Business"
                description="This action cannot be undone."
            >
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600">
                        Are you sure you want to permanently delete <strong>{businessToDelete?.name}</strong>?
                        This will erase all of their data, inventory, and users.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <Button
                            variant="outline"
                            onClick={() => setBusinessToDelete(null)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => businessToDelete && handleDelete(businessToDelete.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Removing...' : 'Yes, Delete Permanently'}
                        </Button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
}
