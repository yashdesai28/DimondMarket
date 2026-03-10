import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBusiness, updateBusiness, fetchBusinessById, checkSlugAvailability, fetchBusinessUsers, createBusinessUser, toggleBusinessUserStatus, resetBusinessUserPassword, removeBusinessUser, type BusinessUser } from '../../api/business.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { StandardModal } from '../../components/ui/StandardModal';
import { Loader } from '../../components/ui/Loader';
import { Info, Globe, Palette, Diamond, CheckCircle2, AlertCircle, Users, Power, PowerOff, Key, Trash2 } from 'lucide-react';
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractColors, setExtractColors] = useState(!isEditing); // Default to true for new, false for existing
    const [isSlugChecking, setIsSlugChecking] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        if (!logoFile) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(logoFile);
        setPreviewUrl(objectUrl);
        // Free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [logoFile]);

    // Users state
    const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    // Pagination state for users
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const userItemsPerPage = 5;

    // Modal States
    const [userToRemove, setUserToRemove] = useState<string | null>(null);
    const [userToReset, setUserToReset] = useState<string | null>(null);
    const [resetPasswordInput, setResetPasswordInput] = useState('');

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
        if (isEditing && businessToEdit) {
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
        } else if (!isEditing) {
            setFormData({
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
        }
    }, [businessToEdit, isEditing]);

    const loadUsers = async () => {
        if (!isEditing || !id) return;
        setIsUsersLoading(true);
        try {
            const data = await fetchBusinessUsers(id);
            setBusinessUsers(data);
        } catch (err: any) {
            toast.error('Failed to load users');
        } finally {
            setIsUsersLoading(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            loadUsers();
        }
    }, [isEditing, id]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createBusinessUser(id!, { name: newUserName, email: newUserEmail, password: newUserPassword });
            toast.success('User added successfully');
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleToggleUser = async (userId: string, currentStatus: boolean) => {
        try {
            await toggleBusinessUserStatus(id!, userId, !currentStatus);
            toast.success(currentStatus ? 'User deactivated' : 'User activated');
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        }
    };

    const handleResetPassword = (userId: string) => {
        setUserToReset(userId);
        setResetPasswordInput('');
    };

    const confirmResetPassword = async () => {
        if (!userToReset || resetPasswordInput.length < 6) return;
        try {
            await resetBusinessUserPassword(id!, userToReset, resetPasswordInput);
            toast.success('Password reset successfully');
            setUserToReset(null);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to reset password');
        }
    };

    const handleRemoveUser = (userId: string) => {
        setUserToRemove(userId);
    };

    const confirmRemoveUser = async () => {
        if (!userToRemove) return;
        try {
            await removeBusinessUser(id!, userToRemove);
            toast.success('User removed');
            setUserToRemove(null);
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to remove user');
        }
    };

    const saveMutation = useMutation({
        mutationFn: (data: FormData) => (isEditing ? updateBusiness(id!, data) : createBusiness(data)),
        onSuccess: () => {
            toast.success(isEditing ? 'Business updated successfully' : 'Business created successfully');
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
            navigate('/admin/businesses');
        },
        onError: (error: any) => {
            const data = error.response?.data;
            if (data?.details && Array.isArray(data.details)) {
                data.details.forEach((err: any) => {
                    toast.error(`${err.field}: ${err.message}`);
                });
            } else {
                const errorMsg = data?.error || data?.message || 'Failed to save business';
                toast.error(errorMsg);
            }
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

    if (isEditing && isLoading) return <Loader fullScreen text="Loading business details..." />;

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
                        {isEditing && (
                            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 text-indigo-600 data-[state=active]:text-indigo-700">
                                <Users className="w-4 h-4 mr-2" />
                                Users
                            </TabsTrigger>
                        )}
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
                                                    onChange={(e) => !isEditing && setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    disabled={isEditing}
                                                    className="h-12 border-slate-200 focus:ring-slate-900 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-50"
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

                                            {/* Slug URL */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slug URL (Auto-generated)</Label>
                                                    {formData.name && (
                                                        <div className="flex items-center gap-1.5 transition-all duration-300">
                                                            {isSlugChecking ? (
                                                                <div className="flex items-center text-[10px] text-slate-400 font-medium">
                                                                    <div className="w-2 h-2 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mr-1.5" />
                                                                    Verifying...
                                                                </div>
                                                            ) : isSlugAvailable === true ? (
                                                                <div className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Available
                                                                </div>
                                                            ) : isSlugAvailable === false ? (
                                                                <div className="flex items-center text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                    Taken
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative group">
                                                    <div className={`h-12 flex items-center px-4 rounded-md transition-all duration-300 border font-mono text-sm ${isSlugAvailable === true ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
                                                        isSlugAvailable === false ? 'bg-red-50/50 border-red-300 text-red-900 shadow-[0_0_8px_rgba(239,68,68,0.1)]' :
                                                            'bg-slate-50 border-slate-200 text-slate-600'
                                                        }`}>
                                                        <Globe className={`w-4 h-4 mr-2 transition-colors duration-300 ${isSlugAvailable === true ? 'text-emerald-600' :
                                                            isSlugAvailable === false ? 'text-red-600' :
                                                                'text-slate-400'
                                                            }`} />
                                                        <span className="opacity-60 text-xs">diamondmarket.com/</span>
                                                        <span className={`font-semibold transition-colors duration-300 ${isSlugAvailable === true ? 'text-emerald-700' : isSlugAvailable === false ? 'text-red-700 underline decoration-red-200' : ''}`}>
                                                            {generatedSlug || 'your-business-name'}
                                                        </span>

                                                        {isSlugAvailable === true && (
                                                            <div className="ml-auto animate-in zoom-in duration-500">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {isSlugAvailable === false && (
                                                            <div className="ml-auto animate-in zoom-in duration-500">
                                                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200/50">
                                                                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                                                </div>
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
                                        <div className="space-y-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logo / Image</Label>
                                            <div className="mt-2 flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative group">
                                                {(logoFile || businessToEdit?.logoUrl) ? (
                                                    <div className="relative">
                                                        <img
                                                            id="logo-preview-img"
                                                            src={previewUrl || businessToEdit?.logoUrl || ''}
                                                            alt="Logo"
                                                            className="w-32 h-32 object-contain rounded-lg shadow-sm bg-white p-2"
                                                            onLoad={(e) => {
                                                                if (!logoFile) return; // Only extract for new files
                                                                const img = e.currentTarget;
                                                                const canvas = document.createElement('canvas');
                                                                const ctx = canvas.getContext('2d');
                                                                if (!ctx) return;
                                                                canvas.width = img.width;
                                                                canvas.height = img.height;
                                                                ctx.drawImage(img, 0, 0, img.width, img.height);

                                                                if (!extractColors) return;

                                                                // Simple extraction: sample points from the image
                                                                // Top-left, center, bottom-right
                                                                try {
                                                                    const centerData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
                                                                    const topLeftData = ctx.getImageData(img.width / 4, img.height / 4, 1, 1).data;

                                                                    const rgbToHex = (r: number, g: number, b: number) =>
                                                                        '#' + [r, g, b].map(x => {
                                                                            const hex = x.toString(16);
                                                                            return hex.length === 1 ? '0' + hex : hex;
                                                                        }).join('');

                                                                    // Only update if the sampled pixels are somewhat opaque
                                                                    if (centerData[3] > 50) {
                                                                        setFormData(prev => ({ ...prev, primaryColor: rgbToHex(centerData[0], centerData[1], centerData[2]) }));
                                                                    }
                                                                    if (topLeftData[3] > 50) {
                                                                        setFormData(prev => ({ ...prev, secondaryColor: rgbToHex(topLeftData[0], topLeftData[1], topLeftData[2]) }));
                                                                    }
                                                                } catch (err) {
                                                                    console.log('Could not extract colors from image', err);
                                                                }
                                                            }}
                                                        />
                                                        {logoFile && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setLogoFile(null);
                                                                    // Also clear the file input value if needed, but react handles it mostly
                                                                }}
                                                                className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1.5 shadow-sm transition-colors"
                                                                title="Cancel logo upload"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                                        No Logo
                                                    </div>
                                                )}

                                                {!logoFile && (
                                                    <div className="w-full space-y-3">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            id="logo-upload-input"
                                                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                            className="bg-white file:bg-slate-100 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:text-sm file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                                                        />
                                                        <div className="flex items-center gap-2 px-1">
                                                            <input
                                                                type="checkbox"
                                                                id="extractColors"
                                                                checked={extractColors}
                                                                onChange={(e) => setExtractColors(e.target.checked)}
                                                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                            />
                                                            <label htmlFor="extractColors" className="text-sm text-slate-600 font-medium cursor-pointer">
                                                                Auto-extract colors from logo
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
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

                    {isEditing && (
                        <TabsContent value="users">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="border-slate-200 shadow-sm lg:col-span-2">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                        <CardTitle className="text-lg">Organization Users</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {isUsersLoading ? (
                                            <div className="p-8 text-center text-slate-500">Loading users...</div>
                                        ) : businessUsers.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500">No users found.</div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <div className="overflow-x-auto w-full">
                                                    <table className="w-full text-sm text-left text-zinc-600">
                                                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50">
                                                            <tr>
                                                                <th className="px-4 py-3 whitespace-nowrap">User Info</th>
                                                                <th className="px-4 py-3 whitespace-nowrap">Added Date</th>
                                                                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {businessUsers.slice((userCurrentPage - 1) * userItemsPerPage, userCurrentPage * userItemsPerPage).map(user => (
                                                                <tr key={user.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                                                                    <td className="px-4 py-3 font-medium">
                                                                        <div className="flex flex-col text-slate-900">
                                                                            <span>{user.email}</span>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                {!user.isActive && (
                                                                                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                                        Deactivated
                                                                                    </span>
                                                                                )}
                                                                                {user.role === 'OWNER' && (
                                                                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                                        Owner
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <Button
                                                                                variant={user.isActive ? "outline" : "default"}
                                                                                size="sm"
                                                                                onClick={() => handleToggleUser(user.id, user.isActive)}
                                                                                className={`whitespace-nowrap ${user.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                                                                            >
                                                                                {user.isActive ? <PowerOff className="w-3.5 h-3.5 mr-1" /> : <Power className="w-3.5 h-3.5 mr-1" />}
                                                                                <span className="hidden sm:inline">{user.isActive ? 'Revoke Access' : 'Restore Access'}</span>
                                                                            </Button>
                                                                            <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)} className="whitespace-nowrap">
                                                                                <Key className="w-3.5 h-3.5 sm:mr-1" />
                                                                                <span className="hidden sm:inline">Reset</span>
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {businessUsers.length > userItemsPerPage && (
                                                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-slate-500 w-full">
                                                        <div>
                                                            Showing {((userCurrentPage - 1) * userItemsPerPage) + 1} to {Math.min(userCurrentPage * userItemsPerPage, businessUsers.length)} of {businessUsers.length} users
                                                        </div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))}
                                                                disabled={userCurrentPage === 1}
                                                            >
                                                                Previous
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setUserCurrentPage(p => Math.min(Math.ceil(businessUsers.length / userItemsPerPage), p + 1))}
                                                                disabled={userCurrentPage === Math.ceil(businessUsers.length / userItemsPerPage)}
                                                            >
                                                                Next
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <form onSubmit={handleCreateUser}>
                                    <Card className="border-slate-200 shadow-sm sticky top-8">
                                        <CardHeader className="border-b border-slate-100 bg-indigo-50/30">
                                            <CardTitle className="text-lg text-indigo-900">Add New User</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newUserName">Full Name</Label>
                                                <Input
                                                    id="newUserName"
                                                    type="text"
                                                    required
                                                    value={newUserName}
                                                    onChange={e => setNewUserName(e.target.value)}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newUserEmail">Email Address</Label>
                                                <Input
                                                    id="newUserEmail"
                                                    type="email"
                                                    required
                                                    value={newUserEmail}
                                                    onChange={e => setNewUserEmail(e.target.value)}
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newUserPwd">Password</Label>
                                                <Input
                                                    id="newUserPwd"
                                                    type="password"
                                                    required
                                                    value={newUserPassword}
                                                    onChange={e => setNewUserPassword(e.target.value)}
                                                    placeholder="Minimum 6 characters"
                                                    minLength={6}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                                Create User
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </form>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
            {/* Reset Password Modal */}
            <StandardModal
                isOpen={!!userToReset}
                onClose={() => setUserToReset(null)}
                title="Reset User Password"
                description="Enter a new password for this user. They will be notified via email."
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            placeholder="At least 6 characters"
                            value={resetPasswordInput}
                            onChange={(e) => setResetPasswordInput(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setUserToReset(null)}>Cancel</Button>
                        <Button
                            onClick={confirmResetPassword}
                            disabled={resetPasswordInput.length < 6}
                            className="bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            Reset Password
                        </Button>
                    </div>
                </div>
            </StandardModal>

            {/* Remove User Modal */}
            <StandardModal
                isOpen={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                title="Remove User"
                description="This action cannot be undone."
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to completely remove this user from the organization?
                        They will immediately lose access to the system.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setUserToRemove(null)}>Cancel</Button>
                        <Button
                            onClick={confirmRemoveUser}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, Remove User
                        </Button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
}
