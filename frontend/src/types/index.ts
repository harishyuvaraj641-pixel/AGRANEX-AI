export type UserRole = 'farmer' | 'buyer' | 'logistics' | 'agronomist' | 'researcher' | 'government_officer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  preferred_language: 'en' | 'ta' | 'hi';
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  total_area_hectares: number;
  soil_type: string;
  latitude: number;
  longitude: number;
  irrigation_source: string;
}

export type CropHealthStatus = 'healthy' | 'water_stress' | 'nutrient_deficiency' | 'disease' | 'dead';

export interface FarmPlot {
  id: string;
  plot_name: string;
  crop_type: string;
  health_status: CropHealthStatus;
  area_hectares: number;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  rainfall_chance: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  uv_index: number;
  condition: string;
  forecast: WeatherForecast[];
}

export interface DiseaseDiagnosis {
  disease_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  affected_area_percent: number;
  organic_solution: string;
  chemical_solution: string;
  experts: string[];
}

export interface YieldPrediction {
  predictedYieldPerHectare: number;
  totalYieldTonnes: number;
  expectedRevenueInr: number;
  optimalHarvestDate: string;
  riskScore: number; // 1-100
  fertilizerNeeds: string[];
  irrigationNeeds: string;
}

export interface MarketplaceListing {
  id: string;
  crop_name: string;
  variety: string;
  quantity_quintals: number;
  price_per_quintal: number;
  quality_grade: 'A' | 'B' | 'C';
  location: string;
  image_url: string;
  status: 'active' | 'sold' | 'draft';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  department: string;
  description: string;
  benefit: string;
  eligibility: string;
  status?: string;
}

export interface AIConversation {
  id: string;
  prompt: string;
  response: string;
  language: string;
  input_type: 'text' | 'voice' | 'image';
  created_at: string;
}

export interface SatelliteData {
  ndvi_avg: number;
  ndwi_avg: number;
  vegetation_index: number;
  cloud_cover_percent: number;
  captured_at: string;
}

export interface SimState {
  growthStage: number;
  soilPh: number;
  rainfallMm: number;
  nitrogenPpm: number;
  temperature: number;
  windSpeed: number;
  diseasePressure: 'none' | 'low' | 'medium' | 'high';
  irrigationMode: 'off' | 'drip' | 'sprinkler' | 'flood';
  timelinePlaying: boolean;
  timelineDay: number;
  timelineSpeed: number;
}

