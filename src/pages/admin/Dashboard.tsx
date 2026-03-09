import { useQuery } from '@tanstack/react-query';
import { fetchAdminMetrics } from '../../api/admin.api';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Diamond, Briefcase, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AdminDashboard() {
    const { logout } = useAuthStore();

    const { data: metrics, isLoading, isError } = useQuery({
        queryKey: ['adminMetrics'],
        queryFn: fetchAdminMetrics,
    });

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;
    if (isError) return <div className="p-8 text-red-500">Failed to load metrics.</div>;

    const totals = metrics?.totals || { businesses: 0, diamonds: 0, users: 0, inquiries: 0 };

    return (
        <div className="p-8 h-full bg-white text-zinc-900">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Platform overview and statistics</p>
                </div>
                <Button variant="outline" className="text-zinc-600 border-zinc-300" onClick={logout}>
                    Log Out
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard title="Total Businesses" value={totals.businesses} icon={<Briefcase className="h-4 w-4 text-zinc-500" />} />
                <MetricCard title="Total Diamonds" value={totals.diamonds} icon={<Diamond className="h-4 w-4 text-zinc-500" />} />
                <MetricCard title="Total Users" value={totals.users} icon={<Users className="h-4 w-4 text-zinc-500" />} />
                <MetricCard title="Total Inquiries" value={totals.inquiries} icon={<MessageSquare className="h-4 w-4 text-zinc-500" />} />
            </div>

            {/* Placeholder for Business List Section */}
            <h2 className="text-2xl font-semibold mb-4">Managed Businesses</h2>
            <Card className="bg-white border-zinc-200">
                <CardContent className="p-6">
                    <p className="text-zinc-500 text-sm">Business Management table will go here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <Card className="bg-white border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
