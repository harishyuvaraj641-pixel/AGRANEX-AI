-- AGRANEX AI - Seed Data Script
-- Populates demo dataset for quick offline / demo testing across all user roles

-- Insert Demo Users
INSERT INTO public.users (id, email, full_name, role, preferred_language) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'farmer.rajesh@agranex.ai', 'Rajesh Kumar', 'farmer', 'en'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'buyer.ananya@agranex.ai', 'Ananya Sharma', 'buyer', 'en'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'dr.swaminathan@agranex.ai', 'Dr. M. S. Swaminathan', 'agronomist', 'en'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'gov.officer@agranex.ai', 'Sanjay Verma', 'government_officer', 'hi'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'admin@agranex.ai', 'Agranex Platform Admin', 'admin', 'en')
ON CONFLICT (id) DO NOTHING;

-- Insert Farmer Profile
INSERT INTO public.farmers (id, user_id, farm_size_hectares, region, state, primary_crops, experience_years, kisan_credit_card_id) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 12.50, 'Coimbatore Agri Zone', 'Tamil Nadu', ARRAY['Wheat', 'Maize', 'Cotton', 'Tomato'], 15, 'KCC-TN-982341')
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Farm
INSERT INTO public.farms (id, farmer_id, farm_name, total_area_hectares, soil_type, latitude, longitude, elevation_meters, irrigation_source) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Green Horizon Smart Farm', 12.50, 'Clay Loam', 11.0168, 76.9558, 411.0, 'Drip Canal System')
ON CONFLICT (id) DO NOTHING;

-- Insert Farm Boundaries / Plots (for 3D Digital Twin & GIS Mapping)
INSERT INTO public.farm_boundaries (farm_id, plot_name, area_hectares, crop_type, health_status, geojson_polygon) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'North Plot A - Wheat', 3.50, 'Wheat', 'healthy', '{"type": "Polygon", "coordinates": [[[76.955, 11.016], [76.957, 11.016], [76.957, 11.018], [76.955, 11.018], [76.955, 11.016]]]}'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'South Plot B - Maize', 4.00, 'Maize', 'water_stress', '{"type": "Polygon", "coordinates": [[[76.955, 11.014], [76.957, 11.014], [76.957, 11.016], [76.955, 11.016], [76.955, 11.014]]]}'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'East Plot C - Tomatoes', 2.50, 'Tomato', 'disease', '{"type": "Polygon", "coordinates": [[[76.957, 11.016], [76.959, 11.016], [76.959, 11.018], [76.957, 11.018], [76.957, 11.016]]]}'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'West Plot D - Cotton', 2.50, 'Cotton', 'healthy', '{"type": "Polygon", "coordinates": [[[76.953, 11.016], [76.955, 11.016], [76.955, 11.018], [76.953, 11.018], [76.953, 11.016]]]}');

-- Insert Soil Reports
INSERT INTO public.soil_reports (farm_id, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph_level, organic_carbon_percent, moisture_percent) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 145.5, 38.2, 210.0, 6.8, 0.85, 24.5);

-- Insert Weather Record
INSERT INTO public.weather_history (farm_id, temperature_celsius, humidity_percent, rainfall_mm, wind_speed_kmh, uv_index, weather_condition) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 29.4, 68.0, 12.5, 14.2, 7.5, 'Partly Cloudy');

-- Insert Satellite Imagery Metadata
INSERT INTO public.satellite_imagery (farm_id, satellite_source, ndvi_avg, ndwi_avg, vegetation_index, cloud_cover_percent) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sentinel-2 L2A', 0.782, 0.420, 0.815, 2.1);

-- Insert AI Prediction
INSERT INTO public.ai_predictions (farm_id, crop_name, predicted_yield_tonnes, confidence_score, risk_factor, recommendations) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wheat', 18.50, 0.9420, 'Low Risk', '{"nitrogen_topdress": "25kg/ha at Day 45", "irrigation_cycle": "Drip 40min every 2 days"}');

-- Insert AI Disease Reports
INSERT INTO public.disease_reports (farm_id, user_id, image_url, disease_name, severity, confidence_score, organic_solution, chemical_solution, affected_area_percent) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=800', 'Tomato Early Blight (Alternaria solani)', 'Medium', 0.9680, 'Apply Neem Seed Kernel Extract (NSKE 5%) spray every 7 days. Ensure bottom leaves do not touch moist soil.', 'Mancozeb 75% WP @ 2g/liter of water spray twice at 10-day intervals.', 18.5);

-- Insert Marketplace Listings
INSERT INTO public.marketplace_listings (id, farmer_id, crop_name, variety, quantity_quintals, price_per_quintal, quality_grade, location, image_url, status) VALUES
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sharbati Wheat', 'Premium Grain', 150.00, 2450.00, 'A', 'Coimbatore Agri Hub', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800', 'active'),
('m2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sweet Corn / Maize', 'Hybrid Gold', 80.00, 1890.00, 'A', 'Coimbatore Agri Hub', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800', 'active');

-- Insert Government Schemes
INSERT INTO public.government_schemes (scheme_name, department, description, benefit_amount, official_link) VALUES
('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'Ministry of Agriculture', 'Direct income support of ₹6,000 per year to all landholding farmer families across the country.', 6000.00, 'https://pmkisan.gov.in'),
('Sub-Mission on Agricultural Mechanization (SMAM)', 'Department of Agriculture & Farmers Welfare', 'Provides up to 50% to 80% subsidy for purchasing tractors, drones, solar pumps, and smart harvesters.', 150000.00, 'https://agrimachinery.nic.in'),
('Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'Insurance Division, Ministry of Agriculture', 'Comprehensive crop insurance against natural risks from pre-sowing to post-harvest.', 50000.00, 'https://pmfby.gov.in');

-- Insert Initial Notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Disease Detection Alert', 'Early Blight detected in East Plot C (Tomatoes) with 96.8% AI confidence.', 'disease'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Irrigation Reminder', 'South Plot B requires 420L drip cycle today at 04:00 PM due to moisture stress.', 'weather'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Marketplace Price Hike', 'Sharbati Wheat market price increased by 4.2% in your regional mandis.', 'market');
