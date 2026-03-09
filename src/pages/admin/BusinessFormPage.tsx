import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBusiness, updateBusiness, fetchBusinessById } from '../../api/business.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function BusinessFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        contactNumber: '',
        whatsappNumber: '',
        ownerPassword: '', // Only for creation
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Fetch data if editing
    const { data: businessToEdit, isLoading } = useQuery({
        queryKey: ['business', id],
        queryFn: () => fetchBusinessById(id!),
        enabled: isEditing,
    });

    useEffect(() => {
        if (businessToEdit) {
            setFormData({
                name: businessToEdit.name,
                ownerName: businessToEdit.ownerName,
                email: businessToEdit.email,
                contactNumber: businessToEdit.contactNumber,
                whatsappNumber: businessToEdit.whatsappNumber,
                ownerPassword: '', // Don't populate password
            });
        }
    }, [businessToEdit]);

    const saveMutation = useMutation({
        mutationFn: (data: FormData) => (isEditing ? updateBusiness(id!, data) : createBusiness(data)),
        onSuccess: () => {
            toast.success(isEditing ? 'Business updated successfully' : 'Business created successfully');
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
            navigate('/admin/businesses');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to save business');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        if (logoFile) {
            data.append('logo', logoFile);
        }
        saveMutation.mutate(data);
    };

    if (isEditing && isLoading) return <div className="p-8">Loading business details...</div>;

    return (
        <div className="p-8 h-full bg-white text-zinc-900 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Business' : 'Add New Business'}</h1>
                <p className="text-zinc-500 mt-1">
                    {isEditing ? 'Update business details and settings.' : 'Register a new business and create an owner account.'}
                </p>
            </div>

            <Card className="bg-white border-zinc-200">
                <CardHeader>
                    <CardTitle className="">Business Details</CardTitle>
                    <CardDescription className="text-zinc-500">Basic information about the business entity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-600">Business Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo" className="text-zinc-600">Company Logo (Optional)</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    className="bg-white border-zinc-300 file:text-zinc-900 file:bg-zinc-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactNumber" className="text-zinc-600">Company Phone</Label>
                                <Input
                                    id="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsappNumber" className="text-zinc-600">WhatsApp Number</Label>
                                <Input
                                    id="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>
                        </div>

                        <hr className="border-zinc-200 !my-8" />

                        <div className="space-y-2 mb-4">
                            <h3 className="text-lg font-medium">Owner Account details</h3>
                            <p className="text-sm text-zinc-500">This account will be used to log into the Business Owner Portal.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ownerName" className="text-zinc-600">Owner Full Name</Label>
                                <Input
                                    id="ownerName"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-600">Owner Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>

                            {!isEditing && (
                                <div className="space-y-2">
                                    <Label htmlFor="ownerPassword" className="text-zinc-600">Initial Password</Label>
                                    <Input
                                        id="ownerPassword"
                                        type="password"
                                        value={formData.ownerPassword}
                                        onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                                        required
                                        className="bg-white border-zinc-300"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-end gap-4">
                            <Button type="button" variant="outline" className="text-zinc-600 border-zinc-300" onClick={() => navigate('/admin/businesses')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Saving...' : (isEditing ? 'Update Business' : 'Create Business')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
