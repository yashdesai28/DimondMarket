import api from './axiosInstance';

export const adminLogin = async (credentials: any) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
};

export const adminLogout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const verifySession = async () => {
    const response = await api.get('/auth/verify');
    return response.data;
};
