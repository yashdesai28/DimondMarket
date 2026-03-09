import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBusiness, updateBusiness, fetchBusinessById, checkSlugAvailability } from '../../api/business.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle2, Globe, Palette, Info, Diamond } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BusinessFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        ownerName: '',
        email: '',
        contactNumber: '+91 ',
        whatsappNumber: '+91 ',
        address: '',
        gstNo: '',
        ownerPassword: '',
        primaryColor: '#0f172a',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b',
        font: 'Inter'
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSlugChecking, setIsSlugChecking] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

    // Derived slug
    const generatedSlug = formData.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Debounced slug check
    useEffect(() => {
        if (!generatedSlug || isEditing) {
            setIsSlugAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSlugChecking(true);
            try {
                const available = await checkSlugAvailability(generatedSlug);
                setIsSlugAvailable(available);
            } catch (err) {
                setIsSlugAvailable(false);
            } finally {
                setIsSlugChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [generatedSlug, isEditing]);

    const { data: bData, isLoading } = useQuery({
        queryKey: ['business', id],
        queryFn: () => fetchBusinessById(id!),
        enabled: isEditing,
    });
    const businessToEdit = bData as any; // Cast for easier access to theme/ownerName

    useEffect(() => {
        if (businessToEdit) {
            setFormData({
                name: businessToEdit.name,
                tagline: businessToEdit.tagline || '',
                ownerName: businessToEdit.ownerName || '',
                email: businessToEdit.email,
                contactNumber: businessToEdit.contactNumber || '+91 ',
                whatsappNumber: businessToEdit.whatsappNumber || '+91 ',
                address: businessToEdit.address || '',
                gstNo: businessToEdit.gstNo || '',
                ownerPassword: '',
                primaryColor: businessToEdit.theme?.primaryColor || '#0f172a',
                secondaryColor: businessToEdit.theme?.secondaryColor || '#64748b',
                accentColor: businessToEdit.theme?.accentColor || '#f59e0b',
                font: businessToEdit.font || 'Inter'
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
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to save business';
            toast.error(errorMsg);
        },
    });

    const handlePhoneChange = (key: 'contactNumber' | 'whatsappNumber', value: string) => {
        if (!value.startsWith('+91 ')) {
            setFormData({ ...formData, [key]: '+91 ' + value.replace(/^\+91\s*/, '') });
        } else {
            setFormData({ ...formData, [key]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing && isSlugAvailable === false) {
            toast.error('The business URL slug is already taken. Please choose another name.');
            return;
        }

        const data = new FormData();

        // Basic Fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value && !['primaryColor', 'secondaryColor', 'accentColor', 'font'].includes(key)) {
                data.append(key, String(value));
            }
        });

        const theme = {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            accentColor: formData.accentColor,
        };
        data.append('theme', JSON.stringify(theme));
        data.append('font', formData.font);

        if (logoFile) {
            data.append('logo', logoFile);
        }
        saveMutation.mutate(data);
    };

    if (isEditing && isLoading) return <div className="p-8">Loading business details...</div>;

    return (
        <div className="p-8 h-full bg-[#f8fafc] text-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" className="p-0 h-auto text-slate-500 hover:text-slate-900" onClick={() => navigate('/admin/businesses')}>
                                ← Back to Businesses
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {isEditing ? formData.name : 'New Business'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isEditing ? 'Manage business information, branding, and inventory.' : 'Register a new business and create an owner account.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-slate-200" onClick={() => navigate('/admin/businesses')}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]" disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="info" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200">
                        <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <Info className="w-4 h-4 mr-2" />
                            Info
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <Palette className="w-4 h-4 mr-2" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="diamonds" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <Diamond className="w-4 h-4 mr-2" />
                            Diamonds
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* Business Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Business Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Royal Cut Co."
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* Tagline */}
                                            <div className="space-y-2">
                                                <Label htmlFor="tagline" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tagline</Label>
                                                <Input
                                                    id="tagline"
                                                    placeholder="Crown Jewels for Modern Royalty"
                                                    value={formData.tagline}
                                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* Slug Indicator */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slug URL (Auto-generated)</Label>
                                                <div className="relative">
                                                    <div className="h-12 flex items-center px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-mono text-sm">
                                                        <Globe className="w-4 h-4 mr-2 text-slate-400" />
                                                        /{generatedSlug}
                                                        {generatedSlug && (
                                                            <div className="ml-auto flex items-center text-xs font-medium">
                                                                {isSlugChecking ? (
                                                                    <span className="text-slate-400 animate-pulse">Checking...</span>
                                                                ) : isSlugAvailable === true ? (
                                                                    <div className="flex items-center text-green-600">
                                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                        Available
                                                                    </div>
                                                                ) : isSlugAvailable === false ? (
                                                                    <div className="flex items-center text-red-600">
                                                                        <Info className="w-4 h-4 mr-1" />
                                                                        Already Taken
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="inquire@royalcutco.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* Contact Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="contactNumber" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Number</Label>
                                                <Input
                                                    id="contactNumber"
                                                    placeholder="+91 98765 43210"
                                                    value={formData.contactNumber}
                                                    onChange={(e) => handlePhoneChange('contactNumber', e.target.value)}
                                                    required
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* WhatsApp Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="whatsappNumber" className="text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp Number</Label>
                                                <Input
                                                    id="whatsappNumber"
                                                    placeholder="+91 98765 43210"
                                                    value={formData.whatsappNumber}
                                                    onChange={(e) => handlePhoneChange('whatsappNumber', e.target.value)}
                                                    required
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* GST No */}
                                            <div className="space-y-2">
                                                <Label htmlFor="gstNo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">GST No.</Label>
                                                <Input
                                                    id="gstNo"
                                                    placeholder="22AAAAA0000A1Z5"
                                                    value={formData.gstNo}
                                                    onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                                                    className="h-12 border-slate-200 focus:ring-slate-900"
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Business Address</Label>
                                                <textarea
                                                    id="address"
                                                    rows={3}
                                                    placeholder="123 Diamond Towers, BKC, Mumbai"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div className="pt-6 border-t border-slate-100">
                                                <h3 className="text-sm font-semibold text-slate-900 mb-4">Initial Owner Account</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ownerName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Owner Full Name</Label>
                                                        <Input
                                                            id="ownerName"
                                                            placeholder="John Doe"
                                                            value={formData.ownerName}
                                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                            required
                                                            className="h-12 border-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ownerPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Password</Label>
                                                        <Input
                                                            id="ownerPassword"
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={formData.ownerPassword}
                                                            onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                                                            required
                                                            className="h-12 border-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="branding">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logo / Image</Label>
                                            <div className="mt-2 flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                                {businessToEdit?.logoUrl ? (
                                                    <img src={businessToEdit.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-lg" />
                                                ) : (
                                                    <div className="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                                        No Logo
                                                    </div>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Colors</Label>

                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="color"
                                                    value={formData.primaryColor}
                                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                                    className="w-12 h-12 p-1 border-none cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Primary Color</p>
                                                    <Input
                                                        value={formData.primaryColor}
                                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                                        placeholder="e.g. blue or #0000ff"
                                                        className="h-8 text-xs font-mono mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="color"
                                                    value={formData.secondaryColor}
                                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                    className="w-12 h-12 p-1 border-none cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Secondary Color</p>
                                                    <Input
                                                        value={formData.secondaryColor}
                                                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                        placeholder="e.g. gray or #666666"
                                                        className="h-8 text-xs font-mono mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="color"
                                                    value={formData.accentColor}
                                                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                                    className="w-12 h-12 p-1 border-none cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Accent Color</p>
                                                    <Input
                                                        value={formData.accentColor}
                                                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                                        placeholder="e.g. gold or #ffd700"
                                                        className="h-8 text-xs font-mono mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Typography</Label>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Primary Font</p>
                                                <select
                                                    value={formData.font}
                                                    onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                                >
                                                    <option value="Inter">Inter (Sans-serif)</option>
                                                    <option value="Roboto">Roboto</option>
                                                    <option value="Outfit">Outfit (Modern)</option>
                                                    <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="diamonds">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-12 text-center text-slate-500">
                                <div className="max-w-xs mx-auto space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                        <Diamond className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">Inventory Management</h3>
                                    <p className="text-sm">This section will show business specific diamond stock and settings in future updates.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
