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
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/admin/login'; // Simple redirect for now
        }
        return Promise.reject(error);
    }
);

export default api;
