import api from './axiosInstance';

export interface Business {
    id: string;
    name: string;
    tagline?: string;
    slug: string;
    ownerName: string;
    contactNumber: string;
    email: string;
    whatsappNumber: string;
    address?: string;
    gstNo?: string;
    logoUrl?: string;
    font?: string;
    theme?: any; // JSON object from Prisma
    planType: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
    trialEndsAt?: string;
    planEndsAt?: string;
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

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    const { data } = await api.get(`/businesses/check-slug/${slug}`);
    return data.data.isAvailable;
};

export const fetchBranding = async (slug: string) => {
    const response = await api.get(`/businesses/slug/${slug}/branding`);
    return response.data.data;
};
