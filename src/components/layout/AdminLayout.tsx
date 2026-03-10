import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Building2, LogOut, Shield, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';

import { verifySession } from '../../api/auth.api';

export function AdminLayout() {
    const { logout } = useAuthStore();
    const location = useLocation();

    // Verify token validity on navigation. The Axios Interceptor handles the failure redirect.
    useEffect(() => {
        verifySession().catch(() => { });
    }, [location.pathname]);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
        { name: 'Settings (Meta)', href: '/admin/settings', icon: Settings2 },
    ];

    return (
        <div className="flex h-screen bg-zinc-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-zinc-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200">
                    <Shield className="h-6 w-6 text-zinc-900 mr-2" />
                    <span className="text-lg font-bold text-zinc-900">Developer Portal</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-zinc-100 text-zinc-900'
                                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                            }`}
                                    >
                                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-zinc-200">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        onClick={() => {
                            logout();
                            window.location.href = '/';
                        }}
                    >
                        <LogOut className="mr-3 h-5 w-5 text-zinc-400" />
                        Log Out
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
