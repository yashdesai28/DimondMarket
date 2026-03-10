import { useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Diamond, Package, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDiamonds } from '../../api/diamond.api';

export default function OwnerDashboard() {
    const { businessId } = useAuthStore();

    const { data: diamonds, isLoading } = useQuery({
        queryKey: ['diamonds', businessId],
        queryFn: () => fetchDiamonds(businessId!),
        enabled: !!businessId,
    });

    // Calculate shape statistics
    const shapeStats = useMemo(() => {
        if (!diamonds) return [];

        const counts = diamonds.reduce((acc, d) => {
            const shape = d.shape || 'Unknown';
            if (!acc[shape]) acc[shape] = 0;
            acc[shape]++;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort by highest count first
            .map(([shape, count]) => ({ shape, count }));
    }, [diamonds]);

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;

    const totalValue = diamonds?.reduce((acc, d) => acc + (Number(d.price) || 0), 0) || 0;

    return (
        <div className="p-8 h-full bg-white text-zinc-900">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    {useAuthStore.getState().user?.name
                        ? `Welcome, ${useAuthStore.getState().user?.name}`
                        : 'Dashboard overview'}
                </h1>
                <p className="text-zinc-500 mt-1">Summary of your diamond inventory</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="bg-white border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Diamonds</CardTitle>
                        <Diamond className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{diamonds?.length || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Inventory Value</CardTitle>
                        <Package className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900">Inventory by Shape</h2>
                    <Card className="bg-white border-zinc-200">
                        <CardContent className="p-0">
                            {shapeStats.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">No diamonds found in inventory.</div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {shapeStats.map((stat) => (
                                        <li key={stat.shape} className="flex flex-row items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                                                    <Diamond className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-zinc-900 capitalize">{stat.shape}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <Hash className="h-4 w-4" />
                                                <span className="font-semibold text-zinc-900">{stat.count}</span>
                                                <span className="text-xs">stones</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900">Quick Actions</h2>
                    <Card className="bg-white border-zinc-200">
                        <CardContent className="p-6">
                            <p className="text-zinc-500 text-sm mb-4">Use the Inventory tab to manage your diamond listings and add new stones to your catalog.</p>
                            <div className="flex gap-3">
                                <a href={`/${businessId}/inventory`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2">
                                    Go to Inventory
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
