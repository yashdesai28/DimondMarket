import api from './axiosInstance';

export interface Diamond {
    id: string;
    certificateNumber: string;
    certificateLab: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut?: string;
    polish?: string;
    symmetry?: string;
    fluorescence?: string;
    measurements?: string;
    price: number;
    images: string[];
    video?: string;
    certificateFile?: string;
    status: string;
    businessId: string;
}

export const fetchDiamonds = async (businessId: string): Promise<Diamond[]> => {
    const response = await api.get(`/diamonds?businessId=${businessId}`);
    return response.data.data.diamonds;
};

export const fetchDiamondById = async (id: string): Promise<Diamond> => {
    const response = await api.get(`/diamonds/${id}`);
    return response.data.data;
};

export const createDiamond = async (formData: FormData): Promise<Diamond> => {
    const response = await api.post('/diamonds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const deleteDiamond = async (id: string): Promise<void> => {
    await api.delete(`/diamonds/${id}`);
};

export const extractCertificateFile = async (file: File) => {
    const form = new FormData();
    form.append('certificate', file);
    const response = await api.post('/diamonds/extract-certificate', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const fetchByCertificateId = async (certificateNumber: string) => {
    const response = await api.post('/diamonds/fetch-by-certificate', { certificateNumber });
    return response.data;
};
