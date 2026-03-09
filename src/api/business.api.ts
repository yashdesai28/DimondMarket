import api from './axiosInstance';

export interface Business {
    id: string;
    name: string;
    slug: string;
    contactNumber: string;
    ownerName: string;
    email: string;
    whatsappNumber: string;
    logoUrl?: string;
    font?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const fetchBusinesses = async (): Promise<Business[]> => {
    const response = await api.get('/businesses');
    return response.data.data;
};

export const fetchBusinessById = async (id: string): Promise<Business> => {
    const response = await api.get(`/businesses/${id}`);
    return response.data.data;
};

export const createBusiness = async (formData: FormData): Promise<Business> => {
    const response = await api.post('/businesses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const updateBusiness = async (id: string, formData: FormData): Promise<Business> => {
    const response = await api.put(`/businesses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const deleteBusiness = async (id: string): Promise<void> => {
    await api.delete(`/businesses/${id}`);
};

export const fetchBranding = async (slug: string) => {
    const response = await api.get(`/businesses/slug/${slug}/branding`);
    return response.data.data;
};
