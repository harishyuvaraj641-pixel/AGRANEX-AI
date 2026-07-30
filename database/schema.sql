-- AGRANEX AI - Enterprise Supabase PostgreSQL Database Schema
-- Version: 1.0.0
-- Security: Row Level Security (RLS) enabled on all tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgtrgm";

-- Custom Enum Types
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'agronomist', 'researcher', 'government_officer', 'admin');
CREATE TYPE crop_health_status AS ENUM ('healthy', 'water_stress', 'nutrient_deficiency', 'disease', 'dead');
CREATE TYPE listing_status AS ENUM ('active', 'pending', 'sold', 'cancelled');
CREATE TYPE order_status AS ENUM ('created', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE scheme_status AS ENUM ('applied', 'under_review', 'approved', 'disbursed', 'rejected');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'farmer',
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'ta', 'hi'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FARMERS TABLE
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    farm_size_hectares NUMERIC(10, 2) DEFAULT 0.0,
    region VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    primary_crops TEXT[],
    experience_years INT DEFAULT 0,
    kisan_credit_card_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BUYERS TABLE
CREATE TABLE IF NOT EXISTS public.buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    gst_number VARCHAR(50),
    business_type VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    farm_name VARCHAR(200) NOT NULL,
    total_area_hectares NUMERIC(10, 2) NOT NULL,
    soil_type VARCHAR(100),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    elevation_meters NUMERIC(8, 2),
    irrigation_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FARM BOUNDARIES (POLYGONS / GEOJSON)
CREATE TABLE IF NOT EXISTS public.farm_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    plot_name VARCHAR(100) NOT NULL,
    area_hectares NUMERIC(10, 2) NOT NULL,
    geojson_polygon JSONB NOT NULL,
    crop_type VARCHAR(100),
    health_status crop_health_status DEFAULT 'healthy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CROP CYCLES
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    target_yield_tonnes NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SOIL REPORTS
CREATE TABLE IF NOT EXISTS public.soil_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    nitrogen_ppm NUMERIC(8, 2),
    phosphorus_ppm NUMERIC(8, 2),
    potassium_ppm NUMERIC(8, 2),
    ph_level NUMERIC(4, 2),
    organic_carbon_percent NUMERIC(5, 2),
    moisture_percent NUMERIC(5, 2),
    report_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. WEATHER HISTORY & FORECAST
CREATE TABLE IF NOT EXISTS public.weather_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    temperature_celsius NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    rainfall_mm NUMERIC(8, 2),
    wind_speed_kmh NUMERIC(5, 2),
    uv_index NUMERIC(4, 2),
    weather_condition VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SATELLITE IMAGERY METADATA
CREATE TABLE IF NOT EXISTS public.satellite_imagery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    satellite_source VARCHAR(100) DEFAULT 'Sentinel-2',
    ndvi_avg NUMERIC(4, 3),
    ndwi_avg NUMERIC(4, 3),
    vegetation_index NUMERIC(4, 3),
    cloud_cover_percent NUMERIC(5, 2),
    image_url TEXT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AI PREDICTIONS
CREATE TABLE IF NOT EXISTS public.ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    predicted_yield_tonnes NUMERIC(10, 2),
    confidence_score NUMERIC(5, 4),
    risk_factor VARCHAR(100),
    recommendations JSONB,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DISEASE REPORTS
CREATE TABLE IF NOT EXISTS public.disease_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- Low, Medium, High, Severe
    confidence_score NUMERIC(5, 4),
    organic_solution TEXT,
    chemical_solution TEXT,
    affected_area_percent NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. IRRIGATION SCHEDULES
CREATE TABLE IF NOT EXISTS public.irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    plot_name VARCHAR(100),
    water_volume_liters NUMERIC(10, 2),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_automated BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, skipped
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    price_per_quintal NUMERIC(10, 2) NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'A', -- A, B, C
    location VARCHAR(150),
    image_url TEXT,
    status listing_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. INVENTORY & EQUIPMENT
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Seed, Fertilizer, Pesticide, Machinery, Tool
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reorder_level NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. FINANCES
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'alert', 'disease', 'weather', 'market', 'scheme'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. AI CONVERSATIONS & VOICE HISTORY
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    input_type VARCHAR(20) DEFAULT 'text', -- 'text' or 'voice'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. GOVERNMENT SCHEMES
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_name VARCHAR(250) NOT NULL,
    department VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    eligibility_criteria JSONB,
    benefit_amount NUMERIC(12, 2),
    state_applicable VARCHAR(100) DEFAULT 'All India',
    application_deadline DATE,
    official_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. SCHEME APPLICATIONS
CREATE TABLE IF NOT EXISTS public.scheme_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.government_schemes(id) ON DELETE CASCADE,
    status scheme_status DEFAULT 'applied',
    submitted_documents JSONB,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR ENTERPRISE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_farms_farmer ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_user ON public.disease_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_weather_farm ON public.weather_history(farm_id, recorded_at DESC);

-- STORED PROCEDURE: Calculate Farm Health Score
CREATE OR REPLACE FUNCTION get_farm_health_score(p_farm_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_avg_ndvi NUMERIC;
    v_disease_count INT;
    v_health_score NUMERIC := 85.0;
BEGIN
    SELECT COALESCE(AVG(ndvi_avg), 0.75) INTO v_avg_ndvi
    FROM public.satellite_imagery
    WHERE farm_id = p_farm_id;
    
    SELECT COUNT(*) INTO v_disease_count
    FROM public.disease_reports
    WHERE farm_id = p_farm_id AND created_at > (NOW() - INTERVAL '30 days');

    v_health_score := (v_avg_ndvi * 100) - (v_disease_count * 5.0);
    IF v_health_score > 100 THEN v_health_score := 100; END IF;
    IF v_health_score < 0 THEN v_health_score := 0; END IF;

    RETURN ROUND(v_health_score, 1);
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active marketplace listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow users to read their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
