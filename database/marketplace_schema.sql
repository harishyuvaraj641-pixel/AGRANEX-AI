-- AGRANEX AI - Marketplace & Shared Truck Logistics Schema Extensions
-- Security: Row Level Security (RLS) enabled on all tables

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extend User Roles Enum if required (Postgres role updates handled at app level)
-- Table extensions:

-- 1. LOGISTICS PROFILES
CREATE TABLE IF NOT EXISTS public.logistics_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    earnings_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logistics_id UUID REFERENCES public.logistics_profiles(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    capacity_kg NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'active', 'maintenance'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logistics_id UUID REFERENCES public.logistics_profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'off_duty'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VILLAGE HUBS (Community Collection Centers)
CREATE TABLE IF NOT EXISTS public.village_hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    region VARCHAR(100) NOT NULL,
    capacity_kg NUMERIC(12, 2) NOT NULL,
    current_weight_kg NUMERIC(12, 2) DEFAULT 0.00,
    temperature_celsius NUMERIC(4, 1) DEFAULT 22.0,
    dispatch_countdown_seconds INT DEFAULT 18000, -- 5 hours countdown
    status VARCHAR(50) DEFAULT 'collecting', -- 'collecting', 'dispatching', 'full'
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CROP LISTINGS
CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100) NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    price_per_quintal NUMERIC(10, 2) NOT NULL,
    quality_grade VARCHAR(10) DEFAULT 'A', -- A, B, C
    location VARCHAR(200) NOT NULL,
    image_url TEXT,
    is_organic BOOLEAN DEFAULT FALSE,
    discount_pct NUMERIC(5, 2) DEFAULT 0.00,
    harvest_date DATE DEFAULT CURRENT_DATE,
    freshness_score INT DEFAULT 95,
    carbon_footprint_kg NUMERIC(8, 2) DEFAULT 0.12,
    estimated_delivery VARCHAR(50) DEFAULT 'Next Day',
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MARKET ORDERS
CREATE TABLE IF NOT EXISTS public.market_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    shared_truck_fee NUMERIC(10, 2) DEFAULT 0.00,
    gst NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'created', -- 'created', 'accepted', 'at_hub', 'truck_assigned', 'transit', 'delivered', 'confirmed', 'cancelled'
    otp_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.market_orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.crop_listings(id) ON DELETE CASCADE,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    price_per_quintal NUMERIC(10, 2) NOT NULL
);

-- 8. TRUCK BOOKINGS (Shared Cargo Allocator)
CREATE TABLE IF NOT EXISTS public.truck_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    hub_id UUID REFERENCES public.village_hubs(id) ON DELETE CASCADE,
    total_cost NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'requested', -- 'requested', 'accepted', 'loading', 'transit', 'completed'
    dispatch_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DELIVERY TRACKING (Proof of Delivery, Live GPS coordinates)
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.truck_bookings(id) ON DELETE CASCADE,
    current_lat NUMERIC(10, 8),
    current_lng NUMERIC(11, 8),
    speed_kmh NUMERIC(5, 2) DEFAULT 0.00,
    eta VARCHAR(50) DEFAULT '2 hours',
    status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'pickup', 'transit', 'arrived', 'delivered'
    proof_image_url TEXT,
    signature_data TEXT, -- Base64 Signature Image or JSON path points
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. WALLETS (Escrow Account Ledgers)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    escrow_balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PAYMENTS (Transaction Ledgers)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.market_orders(id) ON DELETE SET NULL,
    payer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    payee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    escrow_status VARCHAR(50) DEFAULT 'held', -- 'held', 'released', 'refunded'
    transaction_type VARCHAR(50) DEFAULT 'crop_sale', -- 'crop_sale', 'truck_fee', 'platform_commission'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. CHAT ROOMS
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    logistics_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. MESSAGES (Text, base64 images, and voice notes)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT, -- Base64 media or storage URL
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'voice'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer ON public.crop_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status ON public.crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_orders_buyer ON public.market_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_market_orders_status ON public.market_orders(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_users ON public.chat_rooms(farmer_id, buyer_id, logistics_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at ASC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.logistics_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active crop listings" ON public.crop_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow users to read their own wallets" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow members to access chat rooms" ON public.chat_rooms
    FOR SELECT USING (auth.uid() IN (farmer_id, buyer_id, logistics_id));
