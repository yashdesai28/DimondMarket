import api from './axiosInstance';

export interface DashboardMetrics {
    totals: {
        businesses: number;
        diamonds: number;
        users: number;
        inquiries: number;
    };
    recentBusinesses: any[];
    recentInquiries: any[];
}

export const fetchAdminMetrics = async (): Promise<DashboardMetrics> => {
    const response = await api.get('/admin/metrics');
    return response.data.data;
};
