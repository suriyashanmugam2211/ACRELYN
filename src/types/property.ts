export type DataType = 'REAL_ADVERTISED' | 'DEMO_SYNTHETIC';

export interface Property {
  id: string;
  property_id: string;
  property_name: string;
  location: string;
  plot_area_sqft: number;
  price_inr: number;
  price_per_sqft_inr: number;
  facing: string;
  land_type: string;
  facilities: string;
  latitude: number | null;
  longitude: number | null;
  is_approximate_coord?: boolean;
  source_url: string | null;
  availability_status: string;
  verification_status: string;
  data_type: DataType;
  notes?: string;
  image_urls?: string[];
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Resolved' | 'Closed';

export interface Enquiry {
  id: string;
  property_id: string;
  customer_name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  name: string;
}

export interface FilterState {
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  facing: string;
  landType: string;
  availability: string;
  verification: string;
  dataType: 'ALL' | 'REAL_ADVERTISED' | 'DEMO_SYNTHETIC';
  location: string;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'area_asc'
  | 'area_desc'
  | 'recently_added';

export interface ImportSummary {
  totalProcessed: number;
  advertisedCount: number;
  demoCount: number;
  errorsCount: number;
  duplicateCount: number;
  message: string;
}
