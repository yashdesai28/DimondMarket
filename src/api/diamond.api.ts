import api from "./axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  videoUrl?: string;
  certificateFile?: string;
  status: "AVAILABLE" | "SOLD" | "ON_HOLD" | string;
  businessId: string;
  depthPercentage?: number;
  tablePercentage?: number;
  uploadMethod?: "MANUAL" | "CERTIFICATE_ID" | "CERTIFICATE_FILE" | "BULK";
  createdAt?: string;
  updatedAt?: string;
  creator?: { name: string; email: string };
}

export interface PaginatedResponse<T> {
  diamonds: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchDiamondsParams {
  businessId: string;
  page?: number;
  limit?: number;
  search?: string;
  shape?: string;
  colors?: string;
  clarities?: string;
  priceMin?: number;
  priceMax?: number;
  caratMin?: number;
  caratMax?: number;
  cut?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateDiamondPayload {
  price?: number;
  status?: string;
  images?: File[];
  video?: File;
  certificateFile?: File;
  [key: string]: string | number | File | File[] | undefined;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * GET /diamonds?businessId=...&page=1&limit=10
 * Returns paginated list. Falls back gracefully if the server returns a flat array.
 */
export const fetchDiamonds = async (
  params: FetchDiamondsParams | string,
  page = 1,
  limit = 50,
): Promise<PaginatedResponse<Diamond>> => {
  // Support legacy call-style: fetchDiamonds(businessId)
  const businessId = typeof params === "string" ? params : params.businessId;
  const resolvedPage =
    typeof params === "string" ? page : (params.page ?? page);
  const resolvedLimit =
    typeof params === "string" ? limit : (params.limit ?? limit);

  // Extract other params if object
  const otherParams = typeof params === "object" ? params : {};

  const response = await api.get("/diamonds", {
    params: {
      ...otherParams,
      businessId,
      page: resolvedPage,
      limit: resolvedLimit,
    },
  });

  const data = response.data?.data;

  // Handle { diamonds: [...], total, page, ... }
  if (data && Array.isArray(data.diamonds)) {
    return data;
  }

  // Handle flat array (fallback for unexpected responses)
  if (Array.isArray(data)) {
    return {
      diamonds: data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  }

  return {
    diamonds: [],
    total: 0,
    page: 1,
    limit: resolvedLimit,
    totalPages: 0,
  };
};

/**
 * GET /diamonds/:id
 */
export const fetchDiamondById = async (id: string): Promise<Diamond> => {
  const response = await api.get(`/diamonds/${id}`);
  return response.data.data;
};

/**
 * POST /diamonds  (multipart/form-data)
 */
export const createDiamond = async (formData: FormData): Promise<Diamond> => {
  const response = await api.post("/diamonds", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

/**
 * PUT /diamonds/:id  (multipart/form-data)
 * Accepts a pre-built FormData or an UpdateDiamondPayload object (which gets
 * converted into FormData automatically so file fields work correctly).
 */
export const updateDiamond = async (
  id: string,
  payload: FormData | UpdateDiamondPayload,
): Promise<Diamond> => {
  let body: FormData;

  if (payload instanceof FormData) {
    body = payload;
  } else {
    body = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue;

      if (key === "images" && Array.isArray(value)) {
        value.forEach((file: File) => body.append("images", file));
      } else if (value instanceof File) {
        body.append(key, value);
      } else {
        body.append(key, String(value));
      }
    }
  }

  const response = await api.put(`/diamonds/${id}`, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

/**
 * DELETE /diamonds/:id
 */
export const deleteDiamond = async (id: string): Promise<void> => {
  await api.delete(`/diamonds/${id}`);
};

/**
 * POST /diamonds/fetch-by-certificate  { certificateNumber, lab }
 */
export const fetchByCertificateId = async (
  certificateNumber: string,
  lab: string,
) => {
  const response = await api.post("/diamonds/fetch-by-certificate", {
    certificateNumber,
    lab,
  });
  return response.data;
};

/**
 * POST /diamonds/extract-certificate  (multipart/form-data)
 * Accepts a PDF or image file; returns OCR-extracted diamond fields.
 */
export const extractCertificateFile = async (file: File) => {
  const form = new FormData();
  form.append("certificate", file);
  const response = await api.post("/diamonds/extract-certificate", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * POST /diamonds/seed  — dev helper, adds dummy stock
 */
export const seedDiamonds = async (): Promise<void> => {
  await api.post("/diamonds/seed");
};

/**
 * POST /diamonds/bulk-upload  (multipart/form-data)
 */
export const bulkUploadDiamonds = async (
  file: File,
): Promise<{
  insertedCount: number;
  failedCount: number;
  errors: { row: number; error: string }[];
}> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post("/diamonds/bulk-upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};
