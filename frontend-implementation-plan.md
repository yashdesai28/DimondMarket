# Diamond Management System – Frontend Implementation Plan

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Authentication & Routing](#authentication--routing)
4. [Pages & Components](#pages--components)
   - [Super Admin Portal](#super-admin-portal)
   - [Business Owner Portal](#business-owner-portal)
   - [Guest / Client Storefront](#guest--client-storefront)
5. [State Management](#state-management)
6. [API Integration Layer](#api-integration-layer)
7. [Key UI Features](#key-ui-features)
8. [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Vite) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Server State / Caching | TanStack Query (React Query) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| File Upload | react-dropzone |
| Tables / Grid | TanStack Table |
| PDF Viewer | react-pdf |
| Notifications | react-hot-toast |
| HTTP Client | Axios |
| Excel Export | SheetJS (xlsx) |
| Video Player | react-player |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── api/                        # Axios instances + API call functions
│   ├── axiosInstance.ts
│   ├── auth.api.ts
│   ├── business.api.ts
│   ├── diamond.api.ts
│   └── inquiry.api.ts
│
├── assets/                     # Static images, fonts
│
├── components/
│   ├── common/                 # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── FileDropzone.tsx
│   │   ├── PDFViewer.tsx
│   │   └── Badge.tsx
│   │
│   ├── diamond/                # Diamond-specific components
│   │   ├── DiamondCard.tsx
│   │   ├── DiamondGrid.tsx
│   │   ├── DiamondFilters.tsx
│   │   ├── DiamondTable.tsx    # Admin/owner grid (excel-style)
│   │   ├── DiamondDetailPanel.tsx
│   │   └── DiamondUploadForm/
│   │       ├── index.tsx
│   │       ├── ByCertificateID.tsx
│   │       ├── ByCertificateFile.tsx
│   │       └── ManualEntry.tsx
│   │
│   ├── business/
│   │   ├── BusinessForm.tsx
│   │   └── BusinessCard.tsx
│   │
│   └── layout/
│       ├── AdminLayout.tsx
│       ├── OwnerLayout.tsx
│       ├── GuestLayout.tsx
│       └── Navbar.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useDiamonds.ts
│   ├── useBusiness.ts
│   └── useTheme.ts
│
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── BusinessList.tsx
│   │   ├── AddBusiness.tsx
│   │   ├── EditBusiness.tsx
│   │   └── ThemeSettings.tsx
│   │
│   ├── owner/
│   │   ├── Login.tsx           # Dynamic branded login page
│   │   ├── Dashboard.tsx
│   │   ├── AddDiamond.tsx
│   │   └── Inventory.tsx
│   │
│   └── guest/
│       ├── Storefront.tsx      # Diamond listing page
│       └── DiamondDetail.tsx
│
├── store/                      # Zustand stores
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── filterStore.ts
│
├── types/                      # TypeScript interfaces
│   ├── diamond.types.ts
│   ├── business.types.ts
│   └── user.types.ts
│
├── utils/
│   ├── exportExcel.ts
│   ├── formatDiamond.ts
│   └── copyToClipboard.ts
│
├── router/
│   └── AppRouter.tsx
│
└── main.tsx
```

---

## Authentication & Routing

### Route Structure

```
/admin/*                        → Super Admin routes (JWT protected)
  /admin/dashboard
  /admin/businesses
  /admin/businesses/add
  /admin/businesses/:id/edit
  /admin/businesses/:id/theme

/:businessSlug/login            → Business Owner branded login page
/:businessSlug/dashboard        → Owner dashboard (JWT protected)
/:businessSlug/inventory        → Owner inventory management
/:businessSlug/add-diamond      → Add diamond page

/store/:businessSlug            → Guest storefront (public)
/store/:businessSlug/:diamondId → Guest diamond detail (public)
```

### Auth Flow

```
1. Super Admin
   POST /api/auth/admin/login
   → Receives JWT token
   → Stored in httpOnly cookie or localStorage
   → Guards all /admin/* routes

2. Business Owner
   POST /api/auth/owner/login  { businessSlug, email, password }
   → Receives JWT with { role: "owner", businessId }
   → Redirected to /:businessSlug/dashboard

3. Guest
   No auth required
   Access via public URL: /store/:businessSlug
```

### Route Guard Component

```tsx
// router/AppRouter.tsx

<Routes>
  {/* Super Admin - Protected */}
  <Route element={<AdminGuard />}>
    <Route path="/admin/*" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="businesses" element={<BusinessList />} />
      <Route path="businesses/add" element={<AddBusiness />} />
      <Route path="businesses/:id/edit" element={<EditBusiness />} />
    </Route>
  </Route>

  {/* Owner Login - Dynamic Branded */}
  <Route path="/:businessSlug/login" element={<OwnerLogin />} />

  {/* Owner Portal - Protected */}
  <Route element={<OwnerGuard />}>
    <Route path="/:businessSlug/*" element={<OwnerLayout />}>
      <Route path="dashboard" element={<OwnerDashboard />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="add-diamond" element={<AddDiamond />} />
    </Route>
  </Route>

  {/* Guest Storefront - Public */}
  <Route path="/store/:businessSlug" element={<Storefront />} />
  <Route path="/store/:businessSlug/:diamondId" element={<DiamondDetail />} />
</Routes>
```

---

## Pages & Components

### Super Admin Portal

#### Dashboard – `/admin/dashboard`

- Summary cards: total businesses, total diamonds across all businesses
- List of all businesses with quick actions (Edit, View Store, Set Theme)

#### Business List – `/admin/businesses`

- Table of all registered businesses
- Columns: Business Name, Owner, Email, WhatsApp, Status, Actions
- Add Business button → opens modal or navigates to `/admin/businesses/add`

#### Add / Edit Business Form

```tsx
// Fields in BusinessForm.tsx
- businessName       (text input)
- contactNumber      (tel input)
- ownerName          (text input)
- email              (email input)
- whatsappNumber     (tel input)
- logo               (image upload via FileDropzone)
- font               (select dropdown — Google Fonts list)
- theme              (theme picker — color swatches or preset themes)
```

**API Calls:**
```
POST   /api/businesses          → Create business
PUT    /api/businesses/:id      → Update business
GET    /api/businesses          → List all businesses
GET    /api/businesses/:id      → Get single business
DELETE /api/businesses/:id      → Delete business
PUT    /api/businesses/:id/theme → Set theme for business
```

---

### Business Owner Portal

#### Branded Login Page – `/:businessSlug/login`

- On page load, fetch business branding by slug
- Render company logo, font, and theme colors dynamically
- Login form: Email + Password

```tsx
// hooks/useBusiness.ts
const { data: branding } = useQuery(['branding', slug], () =>
  fetchBusinessBranding(slug)
);

// Apply theme dynamically
useEffect(() => {
  document.documentElement.style.setProperty('--primary', branding.primaryColor);
  document.documentElement.style.setProperty('--font', branding.font);
}, [branding]);
```

**API Call:**
```
GET /api/businesses/slug/:businessSlug/branding
```

---

#### Inventory Page – `/:businessSlug/inventory`

- Excel-style data grid (TanStack Table)
- Columns: Certificate No., Shape, Carat, Color, Clarity, Cut, Price, Actions
- Features:
  - Column sorting
  - Column-level text filters
  - Global search input
  - Pagination
  - Row selection (bulk delete)
  - Download Excel button (SheetJS export)
  - Copy Client Link button

```tsx
// utils/exportExcel.ts
import * as XLSX from 'xlsx';

export const exportDiamondsToExcel = (diamonds: Diamond[]) => {
  const ws = XLSX.utils.json_to_sheet(diamonds);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Diamonds');
  XLSX.writeFile(wb, 'diamond-inventory.xlsx');
};
```

**Copy Client Link:**
```tsx
// utils/copyToClipboard.ts
const storeUrl = `${window.location.origin}/store/${businessSlug}`;
navigator.clipboard.writeText(storeUrl);
toast.success('Client link copied!');
```

---

#### Add Diamond Page – `/:businessSlug/add-diamond`

Three tab-based upload options:

**Tab 1 – By Certificate ID**
```
Input: Certificate Number (text)
Button: Fetch Details
→ POST /api/diamonds/fetch-by-certificate  { certificateNumber }
→ Auto-fills form fields
→ Admin reviews → Submit
→ POST /api/diamonds
```

**Tab 2 – Upload Certificate File**
```
Input: File dropzone (PDF or image)
→ POST /api/diamonds/extract-certificate  (multipart/form-data)
→ Backend OCR returns extracted fields
→ Auto-fills form fields
→ Admin reviews → Submit
→ POST /api/diamonds
```

**Tab 3 – Manual Entry**
```
All fields filled manually
Optional: upload certificate file
Optional: enter certificate ID
→ POST /api/diamonds
```

**Diamond Form Fields:**
```
certificateNumber, certificateLab, shape, carat, color,
clarity, cut, polish, symmetry, fluorescence,
measurements, price, images[], video, certificateFile
```

---

### Guest / Client Storefront

#### Storefront – `/store/:businessSlug`

- Fetch business branding → apply theme, logo, font
- Fetch diamonds for that business
- Show diamond cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile)

**Diamond Card Component:**
```tsx
<DiamondCard>
  - Thumbnail image or video preview (muted autoplay loop)
  - Shape badge
  - Carat, Color, Clarity chips
  - Price (formatted currency)
  - "View Details" button
</DiamondCard>
```

**Filter Panel (DiamondFilters.tsx):**
```
Shape         → Multi-select checkbox group
Carat Range   → Dual range slider (min/max)
Color         → Multi-select (D, E, F, G, H, I, J ...)
Clarity       → Multi-select (FL, IF, VVS1, VVS2, VS1 ...)
Cut           → Multi-select (Excellent, Very Good, Good ...)
Price Range   → Dual range slider
Certificate   → Multi-select (GIA, IGI, HRD ...)
```

> All filtering is done **client-side** after initial data fetch using Zustand filter store — no extra API calls on each filter change.

```tsx
// store/filterStore.ts (Zustand)
interface FilterState {
  shapes: string[];
  caratRange: [number, number];
  colors: string[];
  clarities: string[];
  cuts: string[];
  priceRange: [number, number];
  labs: string[];
  searchQuery: string;
  setFilter: (key, value) => void;
  resetFilters: () => void;
}
```

**API Calls:**
```
GET /api/diamonds?businessId=xxx       → All diamonds for business
GET /api/businesses/slug/:slug/branding → Branding data
```

---

#### Diamond Detail Page – `/store/:businessSlug/:diamondId`

Layout: 2-column (media left, details right) on desktop, stacked on mobile.

**Left Column:**
- Video player (react-player) — autoplay, loop, muted
- Image gallery with thumbnail strip
- PDF Certificate viewer (react-pdf inline viewer)

**Right Column:**
- Diamond title: `{carat}ct {shape} Diamond`
- Full specifications table
- Certificate info (lab, number)
- Action buttons:
  - **Share** → copy current URL to clipboard
  - **Send Inquiry** → opens inquiry modal form
  - **Contact Seller** → opens contact modal / WhatsApp link

**Inquiry Modal Form:**
```
Name (required)
Email (required)
Phone (optional)
Message (textarea)
Submit → POST /api/inquiries
```

**API Calls:**
```
GET  /api/diamonds/:id          → Diamond details
POST /api/inquiries             → Submit inquiry
```

---

## State Management

### Zustand Stores

```
authStore.ts
  - token, user, role, businessId
  - login(), logout()

themeStore.ts
  - primaryColor, font, logo
  - setTheme(branding)

filterStore.ts
  - all filter values + search query
  - setFilter(), resetFilters()
  - computed: filteredDiamonds(diamonds[])
```

### TanStack Query (Server State)

```
useQuery(['diamonds', businessId], fetchDiamonds)
useQuery(['diamond', id], fetchDiamond)
useQuery(['businesses'], fetchBusinesses)
useQuery(['branding', slug], fetchBranding)

useMutation → createDiamond, updateDiamond, deleteDiamond
useMutation → createBusiness, updateBusiness
useMutation → submitInquiry
```

---

## API Integration Layer

```typescript
// api/axiosInstance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

```typescript
// api/diamond.api.ts
export const fetchDiamonds = (businessId: string) =>
  api.get(`/diamonds?businessId=${businessId}`).then(r => r.data);

export const fetchDiamondById = (id: string) =>
  api.get(`/diamonds/${id}`).then(r => r.data);

export const createDiamond = (data: FormData) =>
  api.post('/diamonds', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const fetchByCertificateId = (certNumber: string) =>
  api.post('/diamonds/fetch-by-certificate', { certificateNumber: certNumber });

export const extractCertificateFile = (file: File) => {
  const form = new FormData();
  form.append('certificate', file);
  return api.post('/diamonds/extract-certificate', form);
};

export const deleteDiamond = (id: string) =>
  api.delete(`/diamonds/${id}`);
```

---

## Key UI Features

### Dynamic Branding on Login Page

```tsx
// pages/owner/Login.tsx
const { slug } = useParams();
const { data } = useQuery(['branding', slug], () => fetchBranding(slug));

return (
  <div style={{ fontFamily: data?.font, '--primary': data?.primaryColor }}>
    <img src={data?.logoUrl} alt="Company Logo" />
    <LoginForm businessSlug={slug} />
  </div>
);
```

### Real-Time Client-Side Filtering

```tsx
// components/diamond/DiamondGrid.tsx
const allDiamonds = useDiamonds(businessId);
const filters = useFilterStore();

const filtered = useMemo(() =>
  allDiamonds.filter(d =>
    (filters.shapes.length === 0 || filters.shapes.includes(d.shape)) &&
    (d.carat >= filters.caratRange[0] && d.carat <= filters.caratRange[1]) &&
    (filters.colors.length === 0 || filters.colors.includes(d.color)) &&
    // ... other filters
    (d.certificateNumber.includes(filters.searchQuery) ||
     d.shape.includes(filters.searchQuery))
  ), [allDiamonds, filters]);
```

### WhatsApp Contact Integration

```tsx
const whatsappLink = `https://wa.me/${business.whatsappNumber}?text=${
  encodeURIComponent(`I'm interested in diamond: ${diamond.certificateNumber}`)
}`;
<a href={whatsappLink} target="_blank">Contact on WhatsApp</a>
```

---

## Environment Variables

```env
# .env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
```

---

*Frontend Implementation Plan v1.0 — Diamond Management and Listing System*
