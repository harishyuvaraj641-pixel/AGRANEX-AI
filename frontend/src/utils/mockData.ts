import { 
  WeatherData, 
  FarmPlot, 
  Notification, 
  MarketplaceListing, 
  GovernmentScheme, 
  SatelliteData, 
  DiseaseDiagnosis, 
  CropHealthStatus 
} from '../types';

export const mockWeather: WeatherData = {
  temperature: 29,
  humidity: 68,
  rainfall: 12.5,
  wind_speed: 15,
  uv_index: 6,
  condition: 'Partly Cloudy',
  forecast: [
    { date: '2024-07-29', high: 32, low: 25, condition: 'Sunny', rainfall_chance: 10 },
    { date: '2024-07-30', high: 30, low: 24, condition: 'Cloudy', rainfall_chance: 40 },
    { date: '2024-07-31', high: 28, low: 23, condition: 'Rain', rainfall_chance: 80 },
    { date: '2024-08-01', high: 29, low: 24, condition: 'Partly Cloudy', rainfall_chance: 30 },
    { date: '2024-08-02', high: 31, low: 25, condition: 'Sunny', rainfall_chance: 5 },
    { date: '2024-08-03', high: 33, low: 26, condition: 'Sunny', rainfall_chance: 0 },
    { date: '2024-08-04', high: 32, low: 25, condition: 'Cloudy', rainfall_chance: 20 },
  ]
};

export const mockFarmPlots: FarmPlot[] = [
  { id: 'p1', plot_name: 'North Sector', crop_type: 'Wheat', health_status: 'healthy', area_hectares: 2.5 },
  { id: 'p2', plot_name: 'East Sector', crop_type: 'Maize', health_status: 'water_stress', area_hectares: 1.8 },
  { id: 'p3', plot_name: 'South Sector', crop_type: 'Tomato', health_status: 'disease', area_hectares: 0.5 },
  { id: 'p4', plot_name: 'West Sector', crop_type: 'Cotton', health_status: 'healthy', area_hectares: 3.2 },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Disease Alert', message: 'Early signs of Leaf Blight detected in South Sector (Tomato).', type: 'alert', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', title: 'Irrigation Reminder', message: 'Soil moisture low in East Sector. Scheduled irrigation recommended.', type: 'warning', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n3', title: 'Market Price Update', message: 'Wheat prices are up by 5% in your local mandi today.', type: 'info', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n4', title: 'Scheme Available', message: 'You are eligible for the PM-KISAN 14th installment.', type: 'success', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'n5', title: 'Harvest Ready', message: 'West Sector Cotton is approaching optimal harvest window.', type: 'success', is_read: true, created_at: new Date(Date.now() - 259200000).toISOString() },
];

export const mockListings: MarketplaceListing[] = [
  { id: 'm1', crop_name: 'Sharbati Wheat', variety: 'Premium Grain', quantity_quintals: 150, price_per_quintal: 2450, quality_grade: 'A', location: 'Coimbatore Hub', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm2', crop_name: 'Sweet Corn / Maize', variety: 'Hybrid Gold', quantity_quintals: 80, price_per_quintal: 1890, quality_grade: 'A', location: 'Ludhiana Mandi', image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm3', crop_name: 'Organic Tomatoes', variety: 'Country Red', quantity_quintals: 45, price_per_quintal: 1200, quality_grade: 'A', location: 'Coimbatore Hub', image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm4', crop_name: 'Premium Cotton', variety: 'Long Staple', quantity_quintals: 120, price_per_quintal: 6800, quality_grade: 'A', location: 'Coimbatore Hub', image_url: 'https://images.unsplash.com/photo-1594761060297-a21221b67272?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm5', crop_name: 'Alphonso Mangoes', variety: 'Ratnagiri Fresh', quantity_quintals: 40, price_per_quintal: 4800, quality_grade: 'A', location: 'Salem Hub', image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm6', crop_name: 'Organic Turmeric', variety: 'Erode Salem', quantity_quintals: 60, price_per_quintal: 7500, quality_grade: 'A', location: 'Erode Hub', image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm7', crop_name: 'Malabar Black Pepper', variety: 'Tellicherry Extra Bold', quantity_quintals: 25, price_per_quintal: 32000, quality_grade: 'A', location: 'Wayanad Depot', image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400', status: 'active' },
  { id: 'm8', crop_name: 'Fresh Green Peas', variety: 'Ooty Sweet', quantity_quintals: 35, price_per_quintal: 3500, quality_grade: 'A', location: 'Ooty Hub', image_url: 'https://images.unsplash.com/photo-1587570220970-13f64c6198f1?auto=format&fit=crop&q=80&w=400', status: 'active' },
];

export const mockSchemes: GovernmentScheme[] = [
  { id: 's1', name: 'PM-KISAN', department: 'Ministry of Agriculture', description: 'Pradhan Mantri Kisan Samman Nidhi provides income support to all landholding farmers.', benefit: '₹6,000 per year in 3 equal installments.', eligibility: 'All landholding farmer families.' },
  { id: 's2', name: 'SMAM', department: 'Ministry of Agriculture', description: 'Sub-Mission on Agricultural Mechanization for promoting farm machinery.', benefit: 'Subsidies up to 50-80% on purchase of farm equipment.', eligibility: 'Small and marginal farmers, women, and SC/ST farmers.' },
  { id: 's3', name: 'PMFBY', department: 'Ministry of Agriculture', description: 'Pradhan Mantri Fasal Bima Yojana offers crop insurance against non-preventable natural risks.', benefit: 'Financial support in event of crop failure.', eligibility: 'All farmers growing notified crops in notified areas.' },
];

export const mockSatelliteTimeline: SatelliteData[] = [
  { ndvi_avg: 0.65, ndwi_avg: 0.40, vegetation_index: 65, cloud_cover_percent: 10, captured_at: '2024-02-01' },
  { ndvi_avg: 0.70, ndwi_avg: 0.45, vegetation_index: 70, cloud_cover_percent: 5, captured_at: '2024-03-01' },
  { ndvi_avg: 0.75, ndwi_avg: 0.50, vegetation_index: 75, cloud_cover_percent: 20, captured_at: '2024-04-01' },
  { ndvi_avg: 0.82, ndwi_avg: 0.55, vegetation_index: 82, cloud_cover_percent: 15, captured_at: '2024-05-01' },
  { ndvi_avg: 0.78, ndwi_avg: 0.52, vegetation_index: 78, cloud_cover_percent: 40, captured_at: '2024-06-01' },
  { ndvi_avg: 0.85, ndwi_avg: 0.60, vegetation_index: 85, cloud_cover_percent: 25, captured_at: '2024-07-01' },
];

export const mockDiseaseHistory: DiseaseDiagnosis[] = [
  { disease_name: 'Early Blight', severity: 'medium', confidence_score: 92, affected_area_percent: 15, organic_solution: 'Neem oil spray, compost tea.', chemical_solution: 'Chlorothalonil fungicide.', experts: ['Dr. Sharma'] },
  { disease_name: 'Powdery Mildew', severity: 'low', confidence_score: 88, affected_area_percent: 5, organic_solution: 'Baking soda solution.', chemical_solution: 'Sulfur-based fungicides.', experts: ['Dr. Reddy'] },
  { disease_name: 'Leaf Rust', severity: 'high', confidence_score: 95, affected_area_percent: 30, organic_solution: 'Crop rotation, resistant varieties.', chemical_solution: 'Triazole fungicides.', experts: ['Dr. Patel', 'Dr. Singh'] },
  { disease_name: 'Aphids Infestation', severity: 'medium', confidence_score: 90, affected_area_percent: 10, organic_solution: 'Introduce ladybugs, insecticidal soap.', chemical_solution: 'Imidacloprid.', experts: [] },
  { disease_name: 'Root Rot', severity: 'critical', confidence_score: 85, affected_area_percent: 40, organic_solution: 'Improve drainage, biofungicides.', chemical_solution: 'Mefenoxam soil drench.', experts: ['Dr. Sharma'] },
];

export const mockFinancials = [
  { month: 'Jan', income: 45000, expenses: 15000 },
  { month: 'Feb', income: 52000, expenses: 18000 },
  { month: 'Mar', income: 48000, expenses: 20000 },
  { month: 'Apr', income: 120000, expenses: 30000 }, // Harvest season
  { month: 'May', income: 60000, expenses: 25000 },
  { month: 'Jun', income: 55000, expenses: 40000 }, // Sowing season
];

export const healthStatusColor = (status: CropHealthStatus): string => {
  switch (status) {
    case 'healthy': return '#10B981'; // Emerald
    case 'water_stress': return '#F59E0B'; // Amber
    case 'nutrient_deficiency': return '#F97316'; // Orange
    case 'disease': return '#EF4444'; // Red
    case 'dead': return '#6B7280'; // Gray
    default: return '#10B981';
  }
};

export const healthStatusLabel = (status: CropHealthStatus): string => {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
