import { create } from 'zustand';
import { User, UserRole, Notification, SimState } from '../types';

export interface NvidiaModel {
  id: string;
  name: string;
  badge: string;
}

export const nvidiaVisionModels: NvidiaModel[] = [
  { id: 'google/diffusiongemma-26b-a4b-it', name: 'DiffusionGemma 26B Vision', badge: 'Vision NIM' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl', name: 'Nemotron Nano 12B Vision', badge: 'NVIDIA VL' },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', badge: 'Meta Vision' },
  { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', badge: 'High-Res VL' }
];

export const nvidiaNimModels: NvidiaModel[] = [
  { id: 'google/diffusiongemma-26b-a4b-it', name: 'DiffusionGemma 26B Vision', badge: 'Vision NIM' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', badge: 'High Precision' },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', badge: 'Fastest' },
  { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mixtral 8x22B Instruct', badge: 'Agri Expert' },
  { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B Instruct', badge: 'Balanced' }
];

export interface ActiveLocationInfo {
  name: string;
  lat: number;
  lng: number;
  temperature: number;
  soilPh: number;
  soilMoisture: number;
  organicCarbon: number;
  bestCrops: Array<{ name: string; score: number; desc: string }>;
  nearbyChemicalAlert: string | null;
}

export interface CartItem {
  listingId: string;
  cropName: string;
  variety: string;
  quantity: number;
  pricePerQuintal: number;
  imageUrl: string;
  farmerName: string;
}

interface StoreState {
  user: User | null;
  currentRole: UserRole;
  sidebarOpen: boolean;
  notifications: Notification[];
  darkMode: boolean;
  language: 'en' | 'ta' | 'hi';
  selectedNvidiaModel: string;
  selectedVisionModel: string;
  sim: SimState;
  activeLocation: ActiveLocationInfo | null;
  cart: CartItem[];
  
  setUser: (user: User | null) => void;
  setSim: (sim: SimState | ((s: SimState) => SimState)) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  toggleDarkMode: () => void;
  setSelectedNvidiaModel: (model: string) => void;
  setSelectedVisionModel: (model: string) => void;
  setActiveLocation: (loc: ActiveLocationInfo) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
}

const getInitialDarkMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('agranex_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
};

const getInitialUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('agranex_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const getInitialRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('agranex_role');
    if (saved) {
      return saved as UserRole;
    }
  }
  return 'farmer';
};

export const useStore = create<StoreState>((set) => ({
  user: getInitialUser(),
  currentRole: getInitialRole(),
  sidebarOpen: true,
  notifications: [],
  darkMode: getInitialDarkMode(),
  language: 'en',
  selectedNvidiaModel: 'google/diffusiongemma-26b-a4b-it',
  selectedVisionModel: 'google/diffusiongemma-26b-a4b-it',
  sim: {
    growthStage: 0.7,
    soilPh: 6.5,
    rainfallMm: 800,
    nitrogenPpm: 140,
    temperature: 28,
    windSpeed: 14,
    diseasePressure: 'none',
    irrigationMode: 'off',
    timelinePlaying: false,
    timelineDay: 120,
    timelineSpeed: 1,
  },
  activeLocation: {
    name: 'Green Horizon Farm (Coimbatore)',
    lat: 10.9856,
    lng: 76.9664,
    temperature: 29.5,
    soilPh: 6.5,
    soilMoisture: 65,
    organicCarbon: 1.2,
    bestCrops: [
      { name: 'Wheat', score: 85, desc: 'High-gluten cereal crop' },
      { name: 'Maize', score: 80, desc: 'Warm-season grain' },
      { name: 'Tomato', score: 75, desc: 'High-value fresh produce' },
      { name: 'Cotton', score: 70, desc: 'Tropical fiber cash crop' }
    ],
    nearbyChemicalAlert: null
  },

  cart: [],
  setUser: (user) => {
    if (user) {
      localStorage.setItem('agranex_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agranex_user');
    }
    set({ user });
  },
  setSim: (simUpdate) => set((state) => {
    const nextSim = typeof simUpdate === 'function' ? simUpdate(state.sim) : simUpdate;
    return { sim: nextSim };
  }),
  setRole: (role) => {
    localStorage.setItem('agranex_role', role);
    set({ currentRole: role });
  },
  logout: () => {
    localStorage.removeItem('agranex_user');
    localStorage.removeItem('agranex_role');
    localStorage.removeItem('agranex_token');
    set({ user: null, currentRole: 'farmer' });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, is_read: true }))
  })),
  setLanguage: (language) => set({ language }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedNvidiaModel: (selectedNvidiaModel) => set({ selectedNvidiaModel }),
  setSelectedVisionModel: (selectedVisionModel) => set({ selectedVisionModel }),
  setActiveLocation: (activeLocation) => set({ activeLocation }),
  addToCart: (item) => set((state) => {
    const existing = state.cart.find(i => i.listingId === item.listingId);
    if (existing) {
      return {
        cart: state.cart.map(i => i.listingId === item.listingId 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i)
      };
    }
    return { cart: [...state.cart, item] };
  }),
  removeFromCart: (listingId) => set((state) => ({
    cart: state.cart.filter(i => i.listingId !== listingId)
  })),
  clearCart: () => set({ cart: [] })
}));
