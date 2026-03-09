import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shield, Store } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900 p-4">
            <div className="w-full max-w-2xl text-center space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Diamond Market</h1>
                    <p className="text-zinc-500 text-lg">Select a portal to continue</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <Card className="border-zinc-200 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/admin/login')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                                <Shield className="w-8 h-8 text-zinc-900" />
                            </div>
                            <CardTitle className="text-xl">Developer Portal</CardTitle>
                            <CardDescription className="text-zinc-500">Super admin access to manage businesses and system settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">Login as Dev</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/test-diamond-co/login')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                                <Store className="w-8 h-8 text-zinc-900" />
                            </div>
                            <CardTitle className="text-xl">Business Portal</CardTitle>
                            <CardDescription className="text-zinc-500">Owner access to manage diamond inventory and storefront.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" variant="outline">Login as Business</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
