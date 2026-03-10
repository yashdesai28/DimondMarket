import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import BusinessList from '../pages/admin/BusinessList';
import BusinessFormPage from '../pages/admin/BusinessFormPage';
import MetadataManager from '../pages/admin/MetadataManager';
import OwnerLogin from '../pages/owner/Login';
import OwnerDashboard from '../pages/owner/Dashboard';
import Inventory from '../pages/owner/Inventory';
import AddDiamond from '../pages/owner/AddDiamond';
import Home from '../pages/Home';
import UserDiamondList from '../pages/UserDiamondList';
import UserDiamondDetail from '../pages/UserDiamondDetail';
import { AdminLayout } from '../components/layout/AdminLayout';
import { OwnerLayout } from '../components/layout/OwnerLayout';

// Simple Guard for Super Admin
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, role } = useAuthStore();
    if (!isAuthenticated() || role !== 'SUPER_ADMIN') {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

// Simple Guard for Business Owner
const OwnerGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, role } = useAuthStore();
    if (!isAuthenticated() || role !== 'OWNER') {
        return <Navigate to="/" replace />; // TODO: Redirect to their branded login
    }
    return children;
};

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diamonds" element={<UserDiamondList />} />
            <Route path="/diamond/:id" element={<UserDiamondDetail />} />

            {/* Super Admin Login - No sidebar */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Super Admin Dashboard & Management - With sidebar */}
            <Route
                path="/admin"
                element={
                    <AdminGuard>
                        <AdminLayout />
                    </AdminGuard>
                }
            >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="businesses" element={<BusinessList />} />
                <Route path="businesses/add" element={<BusinessFormPage />} />
                <Route path="businesses/:id/edit" element={<BusinessFormPage />} />
                <Route path="settings" element={<MetadataManager />} />
            </Route>

            {/* Owner Login - No sidebar */}
            <Route path="/:businessSlug/login" element={<OwnerLogin />} />

            {/* Owner Dashboard & Inventory - With sidebar */}
            <Route
                path="/:businessSlug"
                element={
                    <OwnerGuard>
                        <OwnerLayout />
                    </OwnerGuard>
                }
            >
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="add-diamond" element={<AddDiamond />} />
            </Route>
        </Routes>
    );
}
