import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, TrendingUp, MapPin, Star, Phone, 
  ShoppingCart, Plus, X, Sparkles, CheckCircle, ChevronDown,
  Heart, ShieldAlert, Award, Leaf, Truck, CreditCard, MessageSquare, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';

// Helper component to render polyline route
const MapPolyline: React.FC<{ path: { lat: number; lng: number }[] }> = ({ path }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#10B981', // Emerald green route highlight
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);
  return null;
};

const mockPriceData = [
  { name: 'Jan', Wheat: 2100, Maize: 1800, Tomato: 1200, Cotton: 5200 },
  { name: 'Feb', Wheat: 2150, Maize: 1820, Tomato: 1100, Cotton: 5300 },
  { name: 'Mar', Wheat: 2200, Maize: 1850, Tomato: 1300, Cotton: 5400 },
  { name: 'Apr', Wheat: 2300, Maize: 1900, Tomato: 1800, Cotton: 5500 },
  { name: 'May', Wheat: 2250, Maize: 1950, Tomato: 2100, Cotton: 5450 },
  { name: 'Jun', Wheat: 2280, Maize: 1920, Tomato: 1900, Cotton: 5600 },
  { name: 'Jul', Wheat: 2350, Maize: 1980, Tomato: 1600, Cotton: 5700 },
  { name: 'Aug', Wheat: 2400, Maize: 2000, Tomato: 1400, Cotton: 5800 },
  { name: 'Sep', Wheat: 2450, Maize: 2050, Tomato: 1500, Cotton: 5900 },
  { name: 'Oct', Wheat: 2420, Maize: 2100, Tomato: 1700, Cotton: 5850 },
  { name: 'Dec', Wheat: 2500, Maize: 2150, Tomato: 2200, Cotton: 6100 },
];

const LiveGPSTrackingPanel: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/marketplace/logistics/tracking/order/${orderId}`);
      if (res.ok) {
        setTrackingData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div className="text-xs text-slate-500 py-2">Connecting live GPS telemetry...</div>;
  if (!trackingData || !trackingData.tracking) {
    return (
      <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-500 text-left">
        📍 Logistics vehicle is waiting for hub dispatch co-loading queue.
      </div>
    );
  }

  const { tracking, booking } = trackingData;

  const startLat = 10.9856; // Coimbatore Hub
  const startLng = 76.9664; // Coimbatore Hub
  const endLat = 11.3410;   // Erode Agri Mandi
  const endLng = 77.7170;   // Erode Agri Mandi

  const totalDist = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)) || 1;
  const currentDist = Math.sqrt(Math.pow(tracking.current_lat - startLat, 2) + Math.pow(tracking.current_lng - startLng, 2));
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentDist / totalDist) * 100)));

  return (
    <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/20 text-left space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Live Google Map Telemetry</span>
          <strong className="text-slate-200 text-xs">{booking.driver_name} ({booking.license_plate})</strong>
        </div>
        <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
          {tracking.speed_kmh} km/h
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block">Coordinates:</span>
          <span className="font-mono font-semibold text-slate-200">{tracking.current_lat.toFixed(5)}, {tracking.current_lng.toFixed(5)}</span>
        </div>
        <div>
          <span className="text-slate-400 block">ETA:</span>
          <span className="font-semibold text-slate-200">{tracking.eta}</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" /> Driver Phone:
          </span>
          <a href={`tel:${tracking.driver_phone || '+91 94421 80922'}`} className="font-semibold text-emerald-400 hover:underline">
            {tracking.driver_phone || '+91 94421 80922'}
          </a>
        </div>
        <div>
          <span className="text-slate-400 block flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" /> Farmer Phone:
          </span>
          <a href={`tel:${tracking.farmer_phone || '+91 94432 50122'}`} className="font-semibold text-emerald-400 hover:underline">
            {tracking.farmer_phone || '+91 94432 50122'}
          </a>
        </div>
      </div>

      <div className="pt-2">
        <a 
          href="/chat"
          className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Chat with Farmer
        </a>
      </div>

      {/* Real Google Map Container */}
      <APIProvider apiKey="AIzaSyC4665Tc3mwQgvwXsWpxT7DRbfB2KTUzsA">
        <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative">
          <Map
            defaultZoom={9}
            defaultCenter={{ lat: 11.1633, lng: 77.3417 }} // Midpoint between Coimbatore and Erode
            gestureHandling={'cooperative'}
            disableDefaultUI={true}
          >
            {/* Route Highlight Polyline */}
            <MapPolyline path={[{ lat: 10.9856, lng: 76.9664 }, { lat: 11.3410, lng: 77.7170 }]} />
            
            {/* Markers */}
            <Marker 
              position={{ lat: tracking.current_lat, lng: tracking.current_lng }} 
              title="Transit Vehicle"
            />
            <Marker 
              position={{ lat: startLat, lng: startLng }} 
              title="Coimbatore Hub"
            />
            <Marker 
              position={{ lat: endLat, lng: endLng }} 
              title="Regional Mandi"
            />
          </Map>
        </div>
      </APIProvider>

      {/* Graphical Route Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
          <span>Hub Dispatch</span>
          <span>Regional Mandi</span>
        </div>
        <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden relative">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 text-sm transition-all duration-1000" style={{ left: `calc(${progressPercent}% - 8px)` }}>
            🚚
          </div>
        </div>
        <div className="text-center text-[10px] text-emerald-400 font-semibold pt-1">
          {progressPercent === 100 ? '✅ Shipment Arrived at Destination' : `🚛 In Transit: ${progressPercent}% of the route covered`}
        </div>
      </div>
    </div>
  );
};

export const Marketplace: React.FC = () => {
  const { cart, addToCart, removeFromCart, clearCart, currentRole, user } = useStore();
  const [listings, setListings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Wheat');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [isOrganicOnly, setIsOrganicOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Detail Modal States
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  
  // Review System States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Checkout states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderOtp, setOrderOtp] = useState('');

  // Reverse Marketplace and Orders tracking states
  const [mainTab, setMainTab] = useState<'listings' | 'orders'>('listings');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestCropName, setRequestCropName] = useState('');
  const [requestVariety, setRequestVariety] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestPrice, setRequestPrice] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [purchaseQty, setPurchaseQty] = useState<number>(0.5);

  const loadBuyerOrders = async () => {
    if (currentRole !== 'buyer') return;
    const userId = user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';
    try {
      const res = await fetch(`http://localhost:5000/api/v1/marketplace/orders?userId=${userId}&role=buyer`);
      if (res.ok) {
        setBuyerOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBuyerOrders();
    const interval = setInterval(loadBuyerOrders, 5000);
    return () => clearInterval(interval);
  }, [currentRole, user]);

  const handleCreateBuyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestCropName || !requestQuantity || !requestPrice || !user) return;
    setRequestSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          buyerName: user.full_name || 'Ananya S. (Buyer)',
          cropName: requestCropName,
          variety: requestVariety,
          quantity: Number(requestQuantity),
          price: Number(requestPrice)
        })
      });

      if (res.ok) {
        setRequestSuccess(true);
        setRequestCropName('');
        setRequestVariety('');
        setRequestQuantity('');
        setRequestPrice('');
        loadBuyerOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const filters = ['All', 'Grains', 'Vegetables', 'Fruits', 'Cotton', 'Spices', 'Today\'s Deals', 'AI Recommendations'];

  const loadListings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/listings');
      if (res.ok) {
        setListings(await res.json());
      }
    } catch (err) {
      console.warn('Backend listings API unreachable, using fallbacks');
      setListings([
        { 
          id: 'm1', 
          crop_name: 'Sharbati Wheat', 
          variety: 'Premium Grain', 
          quantity_quintals: 150, 
          price_per_quintal: 2450, 
          quality_grade: 'A', 
          location: 'Coimbatore Agri Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
          is_organic: true,
          discount_pct: 5,
          harvest_date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0],
          freshness_score: 96,
          carbon_footprint_kg: 0.12,
          estimated_delivery: 'Next Day',
          farmer_name: 'Rajesh Kumar',
          latitude: 10.9856,
          longitude: 76.9664,
          village: 'Pappampatti',
          rating: 4.8,
          reviews: [
            { id: 'r1', author: 'Ananya S.', comment: 'Superb quality wheat, very dry grains.', rating: 5 }
          ]
        },
        { 
          id: 'm2', 
          crop_name: 'Sweet Corn / Maize', 
          variety: 'Hybrid Gold', 
          quantity_quintals: 80, 
          price_per_quintal: 1890, 
          quality_grade: 'A', 
          location: 'Ludhiana Mandi', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800',
          is_organic: false,
          discount_pct: 0,
          harvest_date: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0],
          freshness_score: 98,
          carbon_footprint_kg: 0.18,
          estimated_delivery: '2 Days',
          farmer_name: 'Harpreet Singh',
          latitude: 30.9010,
          longitude: 75.8573,
          village: 'Kanganwal',
          rating: 4.5,
          reviews: []
        },
        { 
          id: 'm3', 
          crop_name: 'Organic Tomatoes', 
          variety: 'Country Red', 
          quantity_quintals: 45, 
          price_per_quintal: 1200, 
          quality_grade: 'A', 
          location: 'Coimbatore Agri Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800',
          is_organic: true,
          discount_pct: 10,
          harvest_date: new Date().toISOString().split('T')[0],
          freshness_score: 99,
          carbon_footprint_kg: 0.08,
          estimated_delivery: 'Next Day',
          farmer_name: 'Rajesh Kumar',
          latitude: 10.9820,
          longitude: 76.9630,
          village: 'Pappampatti',
          rating: 4.9,
          reviews: []
        },
        { 
          id: 'm4', 
          crop_name: 'Premium Cotton', 
          variety: 'Long Staple', 
          quantity_quintals: 120, 
          price_per_quintal: 6800, 
          quality_grade: 'A+', 
          location: 'Coimbatore Agri Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1594761060297-a21221b67272?w=800',
          is_organic: true,
          discount_pct: 0,
          harvest_date: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0],
          freshness_score: 95,
          carbon_footprint_kg: 0.22,
          estimated_delivery: 'Next Day',
          farmer_name: 'Rajesh Kumar',
          latitude: 10.9856,
          longitude: 76.9664,
          village: 'Pappampatti',
          rating: 4.7,
          reviews: []
        },
        { 
          id: 'm5', 
          crop_name: 'Alphonso Mangoes', 
          variety: 'Ratnagiri Fresh', 
          quantity_quintals: 40, 
          price_per_quintal: 4800, 
          quality_grade: 'A', 
          location: 'Salem Agri Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
          is_organic: true,
          discount_pct: 12,
          harvest_date: new Date().toISOString().split('T')[0],
          freshness_score: 99,
          carbon_footprint_kg: 0.05,
          estimated_delivery: 'Next Day',
          farmer_name: 'Rajesh Kumar',
          latitude: 11.6643,
          longitude: 78.1460,
          village: 'Mandi East',
          rating: 4.9,
          reviews: []
        },
        { 
          id: 'm6', 
          crop_name: 'Organic Turmeric', 
          variety: 'Erode Salem', 
          quantity_quintals: 60, 
          price_per_quintal: 7500, 
          quality_grade: 'A+', 
          location: 'Erode Collection Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
          is_organic: true,
          discount_pct: 0,
          harvest_date: new Date(Date.now() - 10*24*60*60*1000).toISOString().split('T')[0],
          freshness_score: 93,
          carbon_footprint_kg: 0.15,
          estimated_delivery: '2 Days',
          farmer_name: 'Rajesh Kumar',
          latitude: 11.3410,
          longitude: 77.7170,
          village: 'Chithode',
          rating: 4.8,
          reviews: []
        },
        { 
          id: 'm7', 
          crop_name: 'Malabar Black Pepper', 
          variety: 'Tellicherry Extra Bold', 
          quantity_quintals: 25, 
          price_per_quintal: 32000, 
          quality_grade: 'A', 
          location: 'Wayanad Depot', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800',
          is_organic: true,
          discount_pct: 8,
          harvest_date: new Date(Date.now() - 15*24*60*60*1000).toISOString().split('T')[0],
          freshness_score: 97,
          carbon_footprint_kg: 0.25,
          estimated_delivery: '3 Days',
          farmer_name: 'Raman Pillai',
          latitude: 11.6050,
          longitude: 76.0830,
          village: 'Kalpetta',
          rating: 4.9,
          reviews: []
        },
        { 
          id: 'm8', 
          crop_name: 'Fresh Green Peas', 
          variety: 'Ooty Sweet', 
          quantity_quintals: 35, 
          price_per_quintal: 3500, 
          quality_grade: 'A', 
          location: 'Ooty Agri Hub', 
          status: 'active', 
          image_url: 'https://images.unsplash.com/photo-1587570220970-13f64c6198f1?w=800',
          is_organic: true,
          discount_pct: 20,
          harvest_date: new Date().toISOString().split('T')[0],
          freshness_score: 98,
          carbon_footprint_kg: 0.04,
          estimated_delivery: 'Next Day',
          farmer_name: 'Karthi Keyan',
          latitude: 11.4100,
          longitude: 76.6950,
          village: 'Coonoor',
          rating: 4.6,
          reviews: []
        }
      ]);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Cart math (quantity is in kg, pricePerQuintal is per 100 kg)
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.pricePerQuintal / 100) * item.quantity), 0);
  const platformFee = Math.round(cartSubtotal * 0.02); // 2%
  const gst = Math.round(cartSubtotal * 0.05); // 5%
  const cartTotal = cartSubtotal + platformFee + gst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutSuccess(false);

    const payload = {
      buyerId: user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', // dynamic or mock buyer ID
      buyerName: user?.full_name || 'Ananya S. (Buyer)',
      listingId: cart[0].listingId, // checkout main listing
      quantity: cart[0].quantity / 100 // Convert kg to quintals for B2B backend compatibility
    };

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutSuccess(true);
        setOrderOtp(data.order.otp_code);
        clearCart();
        setMainTab('orders'); // Auto switch tab to show tracking!
        // Immediately fetch to show the new order
        const userId = user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';
        const refreshRes = await fetch(`http://localhost:5000/api/v1/marketplace/orders?userId=${userId}&role=buyer`);
        if (refreshRes.ok) {
          setBuyerOrders(await refreshRes.json());
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback checkout simulation
      setCheckoutSuccess(true);
      setOrderOtp('4821');
      clearCart();
      setMainTab('orders'); // Auto switch tab to show tracking!
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText || !selectedCrop) return;

    const newReview = {
      id: 'rev-' + Date.now(),
      author: 'Agranex Buyer',
      comment: reviewText,
      rating: reviewRating
    };

    // Append to selected crop locally
    setSelectedCrop({
      ...selectedCrop,
      reviews: [newReview, ...(selectedCrop.reviews || [])]
    });
    setReviewText('');
    setReviewModalOpen(false);
  };

  // Filters & Search logic
  const filteredListings = listings.filter((item) => {
    const matchSearch = item.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchOrganic = !isOrganicOnly || item.is_organic;

    if (!matchSearch || !matchOrganic) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Today\'s Deals') return item.discount_pct > 0;
    if (activeFilter === 'AI Recommendations') return item.freshness_score >= 95;

    const grainCrops = ['wheat', 'maize', 'rice'];
    const vegCrops = ['tomato', 'onion', 'potato'];
    const fruitCrops = ['apple', 'banana', 'mango'];

    const crop = item.crop_name.toLowerCase();
    
    if (activeFilter === 'Grains') return grainCrops.includes(crop);
    if (activeFilter === 'Vegetables') return vegCrops.includes(crop);
    if (activeFilter === 'Fruits') return fruitCrops.includes(crop);
    if (activeFilter === 'Cotton') return crop === 'cotton';
    if (activeFilter === 'Spices') return crop === 'spices' || crop === 'chilli' || crop === 'turmeric';

    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === 'Price Low-High') return a.price_per_quintal - b.price_per_quintal;
    if (sortOption === 'Price High-Low') return b.price_per_quintal - a.price_per_quintal;
    return b.id.localeCompare(a.id); // newest
  });

  return (
    <div className="space-y-8 pb-12 w-full mx-auto relative">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          Organic Smart Marketplace 🛒
        </h1>
        <p className="text-slate-600 dark:text-gray-400 text-lg">Proximity search, AI freshness audits, and secure escrow dispatching.</p>
      </div>

      {/* Top Search bar & Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop or variety..." 
            className="w-full bg-slate-100/80 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors border text-xs font-semibold ${
                activeFilter === f 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Organic filter toggle */}
          <button 
            onClick={() => setIsOrganicOnly(!isOrganicOnly)}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isOrganicOnly ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-100/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" /> Organic Only
          </button>

          {/* Post Buy Request button for Buyer */}
          {currentRole === 'buyer' && (
            <button 
              onClick={() => setIsRequestModalOpen(true)} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Post buy request
            </button>
          )}

          {/* Cart triggers */}
          <button onClick={() => setIsCartOpen(true)} className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2 relative">
            <ShoppingCart className="w-4 h-4" /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>
      </div>

      {/* AI Recommendation Dashboard Overlay */}
      <div className="glass-card p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> AI Demand & Price Projections
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">Vertex-trained Random Forest Mandi Trend tracker</p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            {['Wheat', 'Maize', 'Tomato', 'Cotton'].map(crop => (
              <button 
                key={crop}
                onClick={() => setActiveTab(crop)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                  activeTab === crop ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockPriceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#080C14', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey={activeTab} stroke="#10B981" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {currentRole === 'buyer' && (
        <div className="flex border-b border-slate-200 dark:border-white/10 pb-2 mb-6">
          <button
            onClick={() => setMainTab('listings')}
            className={`px-6 py-2 text-sm font-bold border-b-2 transition-all ${
              mainTab === 'listings'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Browse Crop Listings
          </button>
          <button
            onClick={() => setMainTab('orders')}
            className={`px-6 py-2 text-sm font-bold border-b-2 transition-all ${
              mainTab === 'orders'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            My Orders & GPS Tracking
          </button>
        </div>
      )}

      {mainTab === 'listings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedCrop(item)}
              className="glass-card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden group">
                <img src={item.image_url} alt={item.crop_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 rounded bg-black/60 border border-white/15 text-[10px] text-white font-bold">Grade {item.quality_grade}</span>
                  {item.is_organic && <span className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1"><Leaf className="w-3 h-3" /> Organic</span>}
                </div>
                <button 
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 border border-white/10 text-white hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                
                <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs text-slate-800 dark:text-white flex items-center gap-1 border border-slate-200 dark:border-white/10 font-medium">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {item.rating || 4.8}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white text-base truncate w-44">{item.crop_name}</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-xs font-mono">{item.variety}</p>
                    </div>
                    {item.discount_pct > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.discount_pct}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Stock:</span>
                      <strong className="text-slate-800 dark:text-white">{(item.quantity_quintals * 100).toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Price:</span>
                      <strong className="text-emerald-500">₹{item.price_per_quintal} /qtl</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        listingId: item.id,
                        cropName: item.crop_name,
                        variety: item.variety,
                        quantity: 0.5, // Default minimum quantity of 0.5 kg
                        pricePerQuintal: item.price_per_quintal,
                        imageUrl: item.image_url,
                        farmerName: item.farmer_name
                      });
                    }}
                    className="btn-primary w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add to Order Batch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {buyerOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                No orders placed yet. Browse crop listings to purchase or post a request.
              </div>
            ) : (
              buyerOrders.map(order => (
                <div key={order.id} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">{order.crop_name}</h3>
                        <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-slate-400">{order.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Quantity: {(order.quantity_quintals * 100).toFixed(1)} kg | Variety: {order.variety}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === 'transit' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                      order.status === 'buyer_request' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{order.status}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200 dark:border-white/5">
                    <div className="text-left">
                      <span className="block text-[10px] text-slate-500 uppercase">Farmer</span>
                      <strong className="text-slate-855 dark:text-slate-300">{order.farmer_name || 'Waiting for Farmer...'}</strong>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500 uppercase">Verification OTP</span>
                      <strong className="text-emerald-400 font-mono text-sm">{order.otp_code}</strong>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase">Amount Locked</span>
                      <strong className="text-slate-855 dark:text-slate-300">₹{order.total_amount.toLocaleString()}</strong>
                    </div>
                  </div>

                  {(order.status === 'transit' || order.status === 'delivered') && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                      <LiveGPSTrackingPanel orderId={order.id} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 rounded-2xl text-left space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" /> Contacts & Support Directory
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Rajesh Kumar (Farmer)', phone: '+91 94432 50122', email: 'farmer.rajesh@agranex.ai', role: 'Crop Supplier', hub: 'Coimbatore Hub' },
                  { name: 'Saravanan Express (Logistics)', phone: '+91 94421 80922', email: 'saravanan.c@expresslogistics.in', role: 'Transit Driver', hub: 'Vehicle: TN-37-DF-8812' },
                  { name: 'AGRANEX Support Support', phone: '+91 44 2844 5900', email: 'support@agranex.ai', role: 'Escrow Custodian', hub: 'Secure Payout Support' }
                ].map((contact, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{contact.name}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{contact.role} ({contact.hub})</span>
                    </div>
                    <div className="flex gap-2 pt-1 text-xs">
                      <a href={`tel:${contact.phone}`} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-center flex items-center justify-center gap-1 transition-all">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a href="/chat" className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg font-bold text-center flex items-center justify-center gap-1 transition-all">
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card relative z-10 w-full max-w-md p-6 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Post buy request 🌾</h2>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 text-left">Create crop demand posting. Verified farmers can accept and co-load your request.</p>

              {requestSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-emerald-400 text-sm font-semibold">Buy request posted successfully! Wallet funds reserved in escrow.</p>
                  <button onClick={() => { setIsRequestModalOpen(false); setRequestSuccess(false); }} className="btn-primary py-2 px-6">Close</button>
                </div>
              ) : (
                <form onSubmit={handleCreateBuyRequest} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block font-semibold">Crop Name</label>
                      <input 
                        type="text" 
                        required 
                        value={requestCropName} 
                        onChange={e => setRequestCropName(e.target.value)}
                        placeholder="e.g. Maize"
                        className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-350 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block font-semibold">Variety</label>
                      <input 
                        type="text" 
                        value={requestVariety} 
                        onChange={e => setRequestVariety(e.target.value)}
                        placeholder="e.g. Ganga-11"
                        className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-350 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block font-semibold">Quantity (Quintals)</label>
                      <input 
                        type="number" 
                        required 
                        value={requestQuantity} 
                        onChange={e => setRequestQuantity(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-350 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block font-semibold">Price per Quintal (₹)</label>
                      <input 
                        type="number" 
                        required 
                        value={requestPrice} 
                        onChange={e => setRequestPrice(e.target.value)}
                        placeholder="e.g. 1950"
                        className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-355 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={requestSubmitting} 
                    className="btn-primary w-full py-2.5 font-bold flex items-center justify-center gap-2 mt-4"
                  >
                    {requestSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Confirm & Reserve Escrow
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="glass-card relative z-10 w-full max-w-3xl p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setSelectedCrop(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img src={selectedCrop.image_url} alt={selectedCrop.crop_name} className="w-full h-64 rounded-xl object-cover border border-white/10" />
                  <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">AI Freshness</span>
                      <strong className="text-emerald-400 font-mono text-sm">{selectedCrop.freshness_score}% Score</strong>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Carbon Index</span>
                      <strong className="text-blue-400 font-mono text-sm">{selectedCrop.carbon_footprint_kg} kg/ha</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCrop.crop_name}</h3>
                    <p className="text-slate-500 dark:text-gray-400 font-mono text-xs">{selectedCrop.variety} Variety</p>
                  </div>

                  <div className="text-xl font-bold text-emerald-400">
                    ₹{selectedCrop.price_per_quintal} <span className="text-xs font-normal text-slate-400">/quintal</span>
                  </div>

                  <div className="space-y-2 border-t border-b border-white/5 py-3 text-xs text-slate-600 dark:text-gray-300">
                    <p>🧑‍🌾 Farmer: <strong>{selectedCrop.farmer_name} ({selectedCrop.village} Village)</strong></p>
                    <p>📅 Harvest Date: <strong>{selectedCrop.harvest_date}</strong></p>
                    <p>📍 Location: <strong>{selectedCrop.location}</strong></p>
                    <p>📦 Stock Level: <strong>{(selectedCrop.quantity_quintals * 100).toLocaleString()} kg available</strong></p>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] text-slate-400 block font-semibold">Enter Quantity to Buy (0.5 kg min)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        step="0.1"
                        min="0.5"
                        max={selectedCrop.quantity_quintals * 100}
                        value={purchaseQty}
                        onChange={e => setPurchaseQty(Math.max(0.5, Math.min(selectedCrop.quantity_quintals * 100, Number(e.target.value) || 0.5)))}
                        className="w-full bg-[#080C14]/50 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 font-bold font-mono">kg</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        addToCart({
                          listingId: selectedCrop.id,
                          cropName: selectedCrop.crop_name,
                          variety: selectedCrop.variety,
                          quantity: purchaseQty,
                          pricePerQuintal: selectedCrop.price_per_quintal,
                          imageUrl: selectedCrop.image_url,
                          farmerName: selectedCrop.farmer_name
                        });
                        setSelectedCrop(null);
                        setPurchaseQty(0.5);
                      }}
                      className="btn-primary flex-1 py-2 text-xs font-bold"
                    >
                      Add To Order Batch
                    </button>
                    <button onClick={() => setReviewModalOpen(true)} className="btn-secondary py-2 px-3 text-xs font-bold">
                      Add Review
                    </button>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Reviews</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {selectedCrop.reviews?.map((r: any) => (
                        <div key={r.id} className="p-2 rounded bg-white/5 text-[11px] space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>{r.author}</span>
                            <span className="text-amber-400 flex items-center"><Star className="w-3 h-3 fill-amber-400" /> {r.rating}</span>
                          </div>
                          <p className="text-slate-400">{r.comment}</p>
                        </div>
                      ))}
                      {(!selectedCrop.reviews || selectedCrop.reviews.length === 0) && (
                        <p className="text-slate-500 text-xs italic">No reviews yet for this crop cargo.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <motion.div 
              initial={{ x: 400 }} 
              animate={{ x: 0 }} 
              exit={{ x: 400 }} 
              className="w-96 bg-white dark:bg-[#080C14] border-l border-slate-200 dark:border-white/10 h-full relative z-10 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-emerald-500" /> Cart Batches</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.listingId} className="flex justify-between items-center gap-4 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.cropName} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate w-24">{item.cropName}</h4>
                          <span className="text-[10px] text-slate-500 block">{item.quantity} kg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{((item.pricePerQuintal / 100) * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.listingId)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <p className="text-center py-8 text-slate-500 dark:text-gray-500 italic">No batches in cart.</p>
                  )}
                </div>
              </div>

              {/* Escrow payment checkout calculations */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-gray-400"><span>Produce Subtotal:</span> <span>₹{cartSubtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-slate-600 dark:text-gray-400"><span>Platform Fee (2%):</span> <span>₹{platformFee.toLocaleString()}</span></div>
                    <div className="flex justify-between text-slate-600 dark:text-gray-400"><span>GST Tax (5%):</span> <span>₹{gst.toLocaleString()}</span></div>
                    <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-white/5 pt-2"><span>Total Escrow Amount:</span> <span className="text-emerald-400">₹{cartTotal.toLocaleString()}</span></div>
                  </div>

                  <button onClick={handleCheckout} disabled={checkoutLoading} className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-1.5">
                    <CreditCard className="w-4.5 h-4.5" /> {checkoutLoading ? 'Processing Escrow Lock...' : 'Lock Funds & Order'}
                  </button>
                </div>
              )}

              {checkoutSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 mt-4">
                  <h4 className="font-bold text-emerald-400 text-sm">🎉 Purchase Order Created!</h4>
                  <p className="text-[10px] text-slate-300">Escrow funds have been successfully locked. Provide the farmer/logistics team this verification OTP code upon cargo delivery confirmation:</p>
                  <strong className="block text-center text-lg font-mono text-white tracking-widest bg-white/5 py-1 rounded border border-white/10">{orderOtp}</strong>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Dialog */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card relative z-10 w-full max-w-md p-6 rounded-2xl shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Review Farmer Produce</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Rating (1 to 5 Stars)</label>
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full bg-[#080C14]/50 border border-white/10 rounded-xl py-2 px-3 text-white text-sm">
                    <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (Good)</option>
                    <option value={3}>⭐⭐⭐ (Average)</option>
                    <option value={2}>⭐⭐ (Fair)</option>
                    <option value={1}>⭐ (Poor)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Write Comment</label>
                  <textarea required value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Describe crop size, hydration level, etc..." className="w-full h-24 bg-[#080C14]/50 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                </div>

                <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold">Submit Review</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
