import api from './axiosInstance';

export interface MetadataTag {
    code: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface GlobalMetadataConfig {
    shapes?: MetadataTag[];
    colors?: MetadataTag[];
    clarities?: MetadataTag[];
    shades?: MetadataTag[];
    lusters?: MetadataTag[];
    culets?: MetadataTag[];
    fluorescences?: MetadataTag[];
    labs?: MetadataTag[];
    locations?: MetadataTag[];
    cutGrades?: MetadataTag[];
    polishGrades?: MetadataTag[];
    symmetryGrades?: MetadataTag[];
    caratRanges?: MetadataTag[];
    priceBands?: MetadataTag[];
    origins?: MetadataTag[];
    marketingTags?: MetadataTag[];
    availabilityTags?: MetadataTag[];
}

export interface GlobalMetadata {
    id: string;
    config: GlobalMetadataConfig;
    updatedAt: string;
}

export const fetchMetadata = async (): Promise<GlobalMetadata> => {
    const response = await api.get('/metadata');
    return response.data.data;
};

export const updateMetadata = async (data: { config: GlobalMetadataConfig }): Promise<GlobalMetadata> => {
    const response = await api.put('/metadata/admin', data);
    return response.data.data;
};
