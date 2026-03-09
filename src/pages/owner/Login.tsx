import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBranding } from '../../api/business.api';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axiosInstance';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function OwnerLogin() {
    const { businessSlug } = useParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('testowner@diamond.com'); // Prefilled Owner
    const [password, setPassword] = useState('Password123'); // Prefilled Owner
    const [loading, setLoading] = useState(false);

    // Fetch business branding
    const { data: branding, isLoading: loadingBranding } = useQuery({
        queryKey: ['branding', businessSlug],
        queryFn: () => fetchBranding(businessSlug!),
        enabled: !!businessSlug,
    });

    // Apply dynamic theme safely
    useEffect(() => {
        if (branding?.primaryColor) {
            document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
        }
        // Cleanup on unmount or slug change
        return () => {
            document.documentElement.style.removeProperty('--color-primary');
        };
    }, [branding]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/owner/login', { businessSlug, email, password });
            setAuth(data.data.token, data.data.user);
            toast.success('Login successful');
            navigate(`/${businessSlug}/dashboard`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (loadingBranding) {
        return <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900">Loading portal...</div>;
    }

    if (!branding) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900">
                <h1 className="text-2xl font-bold mb-2">Business Not Found</h1>
                <p className="text-zinc-500">The portal "{businessSlug}" does not exist.</p>
                <Button variant="link" onClick={() => navigate('/')} className="mt-4 text-zinc-900">Return Home</Button>
            </div>
        );
    }

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-white text-zinc-900"
            style={{ fontFamily: branding.font || 'Inter' }}
        >
            <div className="w-full max-w-md p-4">
                {/* Dynamic Logo */}
                <div className="flex justify-center mb-8">
                    {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt={branding.name} className="h-16 object-contain" />
                    ) : (
                        <h1 className="text-3xl font-bold">{branding.name}</h1>
                    )}
                </div>

                <Card className="border-zinc-200 bg-white shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">Owner Portal</CardTitle>
                        <CardDescription className="text-zinc-500">Sign in to manage your inventory.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-600">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-600">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white border-zinc-300"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-white font-semibold mt-4"
                                style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
