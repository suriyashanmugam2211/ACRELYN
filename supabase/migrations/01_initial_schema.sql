-- ==============================================================================
-- ACRELYN — DATABASE SCHEMA & ROW LEVEL SECURITY MIGRATION
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROPERTIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) UNIQUE NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    plot_area_sqft NUMERIC(12, 2) NOT NULL CHECK (plot_area_sqft > 0),
    price_inr NUMERIC(15, 2) NOT NULL CHECK (price_inr > 0),
    price_per_sqft_inr NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND(price_inr / plot_area_sqft, 2)) STORED,
    facing VARCHAR(50) DEFAULT 'Not specified',
    land_type VARCHAR(100) DEFAULT 'Residential plot',
    facilities TEXT DEFAULT 'Not specified',
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    source_url TEXT NULL,
    availability_status VARCHAR(100) NOT NULL DEFAULT 'Available',
    verification_status VARCHAR(100) NOT NULL DEFAULT 'Advertised listing; not independently verified',
    data_type VARCHAR(50) NOT NULL DEFAULT 'DEMO_SYNTHETIC' CHECK (data_type IN ('REAL_ADVERTISED', 'DEMO_SYNTHETIC')),
    notes TEXT NULL,
    image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    cover_image TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast searching, filtering, and map bounding box queries
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON public.properties (property_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties (location);
CREATE INDEX IF NOT EXISTS idx_properties_data_type ON public.properties (data_type);
CREATE INDEX IF NOT EXISTS idx_properties_price_inr ON public.properties (price_inr);
CREATE INDEX IF NOT EXISTS idx_properties_plot_area ON public.properties (plot_area_sqft);
CREATE INDEX IF NOT EXISTS idx_properties_coords ON public.properties (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);

-- ------------------------------------------------------------------------------
-- 2. ENQUIRIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Resolved', 'Closed')),
    admin_notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_enquiry_property FOREIGN KEY (property_id) REFERENCES public.properties (property_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enquiries_property_id ON public.enquiries (property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ADMIN USERS TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    full_name VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROPERTIES POLICIES:
-- 1. Public can read all published property listings
CREATE POLICY "Public users can view properties"
    ON public.properties FOR SELECT
    USING (true);

-- 2. Only authenticated administrators can insert, update, or delete properties
CREATE POLICY "Admins can insert properties"
    ON public.properties FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update properties"
    ON public.properties FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete properties"
    ON public.properties FOR DELETE
    USING (public.is_admin());

-- ENQUIRIES POLICIES:
-- 1. Public users can insert enquiries (customer enquiry submission)
CREATE POLICY "Public visitors can submit enquiries"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

-- 2. Only authorized administrators can view customer enquiries (protects customer privacy!)
CREATE POLICY "Only admins can view enquiries"
    ON public.enquiries FOR SELECT
    USING (public.is_admin());

-- 3. Only admins can update enquiry status or add notes
CREATE POLICY "Only admins can update enquiries"
    ON public.enquiries FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Only admins can delete enquiries
CREATE POLICY "Only admins can delete enquiries"
    ON public.enquiries FOR DELETE
    USING (public.is_admin());

-- ADMIN USERS POLICIES:
CREATE POLICY "Admins can read admin directory"
    ON public.admin_users FOR SELECT
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION (for property-images)
-- ------------------------------------------------------------------------------
-- Insert bucket if storage schema exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images in property-images
CREATE POLICY "Public Access to Property Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-images');

-- Only admins can upload property images
CREATE POLICY "Admins can upload property images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

-- Only admins can delete property images
CREATE POLICY "Admins can delete property images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'property-images' AND public.is_admin());
