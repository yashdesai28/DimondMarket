import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function AdminLogin() {
    const [email, setEmail] = useState('admin@diamond.com'); // Prefilled Dev Email
    const [password, setPassword] = useState('Admin@1234'); // Prefilled Dev Password
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await adminLogin({ email, password });
            setAuth(data.token, data.user);
            toast.success('Login successful');
            navigate('/admin/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900">
            <Card className="w-[400px] border-zinc-200 bg-white shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Developer Portal</CardTitle>
                    <CardDescription className="text-zinc-500">Sign in to manage the Diamond Market platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-600">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="developer@admin.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white border-zinc-300 placeholder:text-zinc-500"
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
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-colors mt-4"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
