import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: 'http://192.168.29.217:4000/api', // Force backend URL
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global auth errors
        const status = error.response?.status;
        const errorMessage = error.response?.data?.error;

        if (status === 401 || (status === 403 && errorMessage === 'User account is deactivated')) {
            useAuthStore.getState().logout();
            window.location.href = '/'; // Redirect to root on unauthorized/deactivated
        }
        return Promise.reject(error);
    }
);

export default api;
