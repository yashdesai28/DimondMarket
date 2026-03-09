import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | null;

interface User {
    id: string;
    email: string;
    role: Role;
    businessId: string | null;
}

interface AuthState {
    token: string | null;
    user: User | null;
    role: Role;
    businessId: string | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            role: null,
            businessId: null,

            setAuth: (token, user) => set({ token, user, role: user.role, businessId: user.businessId }),

            logout: () => set({ token: null, user: null, role: null, businessId: null }),

            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'auth-storage',
        }
    )
);
