import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Diamond, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDiamonds } from '../../api/diamond.api';

export default function OwnerDashboard() {
    const { businessId } = useAuthStore();

    const { data: diamonds, isLoading } = useQuery({
        queryKey: ['diamonds', businessId],
        queryFn: () => fetchDiamonds(businessId!),
        enabled: !!businessId,
    });

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;

    const totalValue = diamonds?.reduce((acc, d) => acc + (Number(d.price) || 0), 0) || 0;

    return (
        <div className="p-8 h-full bg-white text-zinc-900">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard overview</h1>
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

            <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
            <Card className="bg-white border-zinc-200">
                <CardContent className="p-6">
                    <p className="text-zinc-500 text-sm">Use the Inventory tab to manage your diamonds and the Add Diamond tab to list new stones.</p>
                </CardContent>
            </Card>
        </div>
    );
}
