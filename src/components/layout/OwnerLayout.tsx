import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { verifySession } from '../../api/auth.api';
import { LayoutDashboard, Gem, LogOut, Store, ChevronLeft, Menu, LifeBuoy } from 'lucide-react';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchBranding } from '../../api/business.api';

export function OwnerLayout() {
    const { logout } = useAuthStore();
    const location = useLocation();
    const { businessSlug } = useParams();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Optionally load branding for logo in sidebar
    const { data: branding } = useQuery({
        queryKey: ['branding', businessSlug],
        queryFn: () => fetchBranding(businessSlug!),
        enabled: !!businessSlug,
    });

    const navigation = [
        { name: 'Dashboard', href: `/${businessSlug}/dashboard`, icon: LayoutDashboard },
        { name: 'Inventory', href: `/${businessSlug}/inventory`, icon: Gem },
        { name: 'Support', href: `/${businessSlug}/support`, icon: LifeBuoy },
    ];

    // Verify token validity on navigation. The Axios Interceptor handles the failure redirect.
    useEffect(() => {
        verifySession().catch(() => { });
        setIsMobileMenuOpen(false); // Close menu on navigation
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden relative">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-50">
                <div className="flex items-center">
                    {branding?.logoUrl ? (
                        <img src={branding.logoUrl} alt={branding.name} className="h-8 object-contain" />
                    ) : (
                        <div className="flex items-center">
                            <Store className="h-6 w-6 text-zinc-900 mr-2" />
                            <span className="font-bold text-zinc-900">{branding?.name || 'Owner Portal'}</span>
                        </div>
                    )}
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <ChevronLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div 
                className={`bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 z-50
                    ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64' : 'hidden lg:flex'}
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                `}
            >
                <div className={`h-16 hidden lg:flex items-center border-b border-zinc-200 shrink-0 ${
                    isCollapsed ? 'justify-center' : 'px-6'
                }`}>
                    {!isCollapsed && (
                        <div className="flex items-center flex-1 overflow-hidden mr-2">
                            {branding?.logoUrl ? (
                                <img src={branding.logoUrl} alt={branding.name} className="h-8 object-contain" />
                            ) : (
                                <>
                                    <Store className="h-6 w-6 text-zinc-900 mr-2 shrink-0" />
                                    <span className="text-lg font-bold text-zinc-900 truncate">
                                        {branding?.name || 'Owner Portal'}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`h-8 w-8 text-zinc-400 hover:text-zinc-900 ${isCollapsed ? '' : 'ml-auto'}`}
                    >
                        {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Mobile specific header in sidebar */}
                <div className="lg:hidden h-16 flex items-center px-6 border-b border-zinc-200 shrink-0">
                    <span className="font-bold text-zinc-900">Navigation</span>
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
                                        title={isCollapsed ? item.name : undefined}
                                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-zinc-100 text-zinc-900'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                        } ${isCollapsed && !isMobileMenuOpen ? 'lg:justify-center' : ''}`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-zinc-900' : 'text-zinc-400'} ${isCollapsed && !isMobileMenuOpen ? '' : 'mr-3'}`} />
                                        {(!isCollapsed || isMobileMenuOpen) && <span>{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-zinc-200 shrink-0">
                    <Button
                        variant="ghost"
                        title={isCollapsed ? "Log Out" : undefined}
                        className={`w-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 ${isCollapsed && !isMobileMenuOpen ? 'lg:justify-center px-0' : 'justify-start'}`}
                        onClick={() => {
                            logout();
                            window.location.href = '/';
                        }}
                    >
                        <LogOut className={`h-5 w-5 text-zinc-400 ${isCollapsed && !isMobileMenuOpen ? '' : 'mr-3'}`} />
                        {(!isCollapsed || isMobileMenuOpen) && <span>Log Out</span>}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-16 lg:pt-0">
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
