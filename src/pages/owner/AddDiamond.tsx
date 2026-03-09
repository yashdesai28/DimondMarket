import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiamond, fetchByCertificateId, extractCertificateFile } from '../../api/diamond.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function AddDiamond() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'id' | 'file' | 'manual'>('manual');

    const [formData, setFormData] = useState({
        certificateNumber: '',
        certificateLab: 'GIA',
        shape: 'Round',
        carat: '',
        color: 'D',
        clarity: 'FL',
        cut: 'Excellent',
        polish: 'Excellent',
        symmetry: 'Excellent',
        price: '',
    });

    const [certIdInput, setCertIdInput] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);

    const saveMutation = useMutation({
        mutationFn: createDiamond,
        onSuccess: () => {
            toast.success('Diamond added successfully!');
            queryClient.invalidateQueries({ queryKey: ['diamonds'] });
            navigate('../inventory');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add diamond');
        },
    });

    const fetchIdMutation = useMutation({
        mutationFn: (id: string) => fetchByCertificateId(id),
        onSuccess: (data: any) => {
            toast.success('Details fetched successfully');
            setFormData({ ...formData, ...data.data });
            setActiveTab('manual'); // Switch to manual to review
        },
        onError: () => toast.error('Could not fetch certificate details'),
    });

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => extractCertificateFile(file),
        onSuccess: (data: any) => {
            toast.success('Certificate read successfully');
            setFormData({ ...formData, ...data.data });
            setActiveTab('manual'); // Switch to manual to review
        },
        onError: () => toast.error('Failed to parse certificate file'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v) data.append(k, String(v));
        });
        saveMutation.mutate(data);
    };

    return (
        <div className="p-8 h-full bg-white text-zinc-900 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Add New Diamond</h1>
                <p className="text-zinc-500 mt-1">List a new diamond in your inventory.</p>
            </div>

            <div className="flex gap-4 mb-6 border-b border-zinc-200 pb-2">
                <button
                    className={`pb-2 px-2 text-sm font-medium ${activeTab === 'id' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-600'}`}
                    onClick={() => setActiveTab('id')}
                >
                    By Certificate ID
                </button>
                <button
                    className={`pb-2 px-2 text-sm font-medium ${activeTab === 'file' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-600'}`}
                    onClick={() => setActiveTab('file')}
                >
                    Upload Certificate
                </button>
                <button
                    className={`pb-2 px-2 text-sm font-medium ${activeTab === 'manual' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-600'}`}
                    onClick={() => setActiveTab('manual')}
                >
                    Manual Entry
                </button>
            </div>

            <Card className="bg-white border-zinc-200">
                <CardHeader>
                    <CardTitle className="">Diamond Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {activeTab === 'id' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-600">Certificate Number (GIA, IGI, etc.)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={certIdInput}
                                        onChange={e => setCertIdInput(e.target.value)}
                                        placeholder="e.g. 1234567890"
                                        className="bg-white border-zinc-300"
                                    />
                                    <Button
                                        onClick={() => fetchIdMutation.mutate(certIdInput)}
                                        disabled={!certIdInput || fetchIdMutation.isPending}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white"
                                    >
                                        {fetchIdMutation.isPending ? 'Fetching...' : 'Fetch Details'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'file' && (
                        <div className="space-y-4 text-center py-8 border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50/50">
                            <Label className="text-zinc-600 mb-2 block">Upload PDF or Image Certificate</Label>
                            <Input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={e => setCertFile(e.target.files?.[0] || null)}
                                className="max-w-xs mx-auto text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200"
                            />
                            <Button
                                onClick={() => certFile && uploadFileMutation.mutate(certFile)}
                                disabled={!certFile || uploadFileMutation.isPending}
                                className="mt-6 bg-zinc-900 hover:bg-zinc-800 text-white"
                            >
                                {uploadFileMutation.isPending ? 'Processing Document...' : 'Extract Data'}
                            </Button>
                        </div>
                    )}

                    {activeTab === 'manual' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Certificate Lab</Label>
                                    <Input value={formData.certificateLab} onChange={e => setFormData({ ...formData, certificateLab: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Certificate Number</Label>
                                    <Input value={formData.certificateNumber} onChange={e => setFormData({ ...formData, certificateNumber: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Shape</Label>
                                    <Input value={formData.shape} onChange={e => setFormData({ ...formData, shape: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Carat Weight</Label>
                                    <Input type="number" step="0.01" value={formData.carat} onChange={e => setFormData({ ...formData, carat: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Color</Label>
                                    <Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Clarity</Label>
                                    <Input value={formData.clarity} onChange={e => setFormData({ ...formData, clarity: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Cut</Label>
                                    <Input value={formData.cut} onChange={e => setFormData({ ...formData, cut: e.target.value })} className="bg-white border-zinc-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-600">Price ($)</Label>
                                    <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="bg-white border-zinc-300" required />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-4">
                                <Button type="button" variant="outline" className="border-zinc-300 text-zinc-600" onClick={() => navigate('../inventory')}>Cancel</Button>
                                <Button type="submit" disabled={saveMutation.isPending} className="bg-zinc-900 hover:bg-zinc-800 text-white">
                                    {saveMutation.isPending ? 'Saving...' : 'Add to Inventory'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
