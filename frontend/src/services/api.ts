import { 
  UserRole, 
  FarmPlot, 
  DiseaseDiagnosis, 
  YieldPrediction, 
  MarketplaceListing, 
  Notification, 
  GovernmentScheme 
} from '../types';
import { 
  mockFarmPlots, 
  mockDiseaseHistory, 
  mockListings, 
  mockNotifications, 
  mockSchemes 
} from '../utils/mockData';

const API_BASE = 'http://localhost:5000/api/v1';

export const login = async (email: string, password: string, role: UserRole) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.warn('Backend unreachable, using mock data for login');
    return { 
      token: 'mock-jwt-token', 
      user: { id: 'u1', email, full_name: 'Mock User', role, preferred_language: 'en' } 
    };
  }
};

export const getFarmPlots = async (): Promise<FarmPlot[]> => {
  try {
    const res = await fetch(`${API_BASE}/farms/plots`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return mockFarmPlots;
  }
};

export const detectDisease = async (imageUrl: string, cropType: string, fileName?: string, model?: string, language?: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/ai/disease-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, cropType, fileName, model, language })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: true, is_crop_leaf: true, diagnosis: mockDiseaseHistory[0] };
  }
};

export const predictYield = async (params: any): Promise<YieldPrediction> => {
  try {
    const res = await fetch(`${API_BASE}/ai/yield-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return {
      predictedYieldPerHectare: 4.5,
      totalYieldTonnes: 9.0,
      expectedRevenueInr: 250000,
      optimalHarvestDate: '2024-11-15',
      riskScore: 25,
      fertilizerNeeds: ['Urea - 50kg', 'DAP - 25kg'],
      irrigationNeeds: 'Moderate'
    };
  }
};

export const queryAgranex = async (query: string, language: string, model?: string) => {
  try {
    const res = await fetch(`${API_BASE}/ai/agranex-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, model })
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return { response: "I'm Agranex, your AI assistant. The backend is currently unavailable, but I can help you once it's back online!" };
  }
};

export const getMarketplaceListings = async (): Promise<MarketplaceListing[]> => {
  try {
    const res = await fetch(`${API_BASE}/marketplace/listings`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return mockListings;
  }
};

export const createListing = async (data: Partial<MarketplaceListing>) => {
  try {
    const res = await fetch(`${API_BASE}/marketplace/listings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return { success: true, message: 'Mock listing created' };
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return mockNotifications;
  }
};

export const getSchemes = async (): Promise<GovernmentScheme[]> => {
  try {
    const res = await fetch(`${API_BASE}/schemes`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return mockSchemes;
  }
};

export const getAuditLogs = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return [{ id: '1', action: 'User Login', timestamp: new Date().toISOString() }];
  }
};
