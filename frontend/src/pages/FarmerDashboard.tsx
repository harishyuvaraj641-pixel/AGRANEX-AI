import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, ArrowUpRight, TrendingUp, Sparkles, Box, 
  ShieldAlert, BadgePercent, Package, DollarSign, Wallet, 
  FileText, CheckCircle, Clock, MapPin, Truck, RefreshCw, Phone, MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';

// Custom Truck SVG Icon Data URL
const TRUCK_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#10B981" flood-opacity="0.6"/>
  </filter>
  <circle cx="24" cy="24" r="22" fill="#090D16" stroke="#10B981" stroke-width="2.5" filter="url(#shadow)"/>
  <path d="M12 18h14v10H12z" fill="#10B981"/>
  <path d="M26 21h6l4 4v3h-10z" fill="#059669"/>
  <circle cx="16" cy="30" r="3" fill="#34D399"/>
  <circle cx="30" cy="30" r="3" fill="#34D399"/>
  <path d="M14 20h4v3h-4z" fill="#ECFDF5"/>
</svg>
`)}`;

const HUB_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="#1E293B" stroke="#3B82F6" stroke-width="2"/>
  <path d="M10 24V14l8-6 8 6v10h-6v-6h-4v6z" fill="#3B82F6"/>
</svg>
`)}`;

const MANDI_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
  <path d="M18 10l7 5v11H11V15z" fill="#F59E0B"/>
</svg>
`)}`;

// Full route polyline coordinates connecting Coimbatore Hub to Erode Mandi
const ROUTE_PATH_COIMBATORE_ERODE = [
  { lat: 10.9856, lng: 76.9664 }, // Coimbatore Hub
  { lat: 11.0168, lng: 77.0325 }, // Avinashi Road
  { lat: 11.0850, lng: 77.1650 }, // Karumathampatti
  { lat: 11.1085, lng: 77.3411 }, // Tiruppur Bypass
  { lat: 11.2330, lng: 77.5320 }, // Perundurai Hub
  { lat: 11.3410, lng: 77.7170 }  // Erode Regional Mandi
];

// Helper component to render polyline route
const MapPolyline: React.FC<{ path: { lat: number; lng: number }[] }> = ({ path }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#10B981', // Emerald green route highlight
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });
    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);
  return null;
};

// Mock Price Trend Data for Farmer AI
const priceTrendData = [
  { name: 'Week 1', price: 2350, demand: 65 },
  { name: 'Week 2', price: 2400, demand: 70 },
  { name: 'Week 3', price: 2450, demand: 85 },
  { name: 'Week 4', price: 2520, demand: 90 },
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
            <Phone className="w-3 h-3 text-emerald-400" /> Buyer Phone:
          </span>
          <a href={`tel:${tracking.buyer_phone || '+91 98941 77651'}`} className="font-semibold text-emerald-400 hover:underline">
            {tracking.buyer_phone || '+91 98941 77651'}
          </a>
        </div>
      </div>

      <div className="pt-2">
        <a 
          href="/chat"
          className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Chat with Buyer
        </a>
      </div>

      {/* Real Google Map Container */}
      <APIProvider apiKey="AIzaSyC4665Tc3mwQgvwXsWpxT7DRbfB2KTUzsA">
        <div className="w-full h-56 rounded-xl overflow-hidden border border-emerald-500/30 shadow-inner relative">
          <Map
            defaultZoom={9}
            defaultCenter={{ lat: 11.1633, lng: 77.3417 }} // Midpoint between Coimbatore and Erode
            gestureHandling={'cooperative'}
            disableDefaultUI={true}
          >
            {/* Real Highway Waypoint Path Line */}
            <MapPolyline path={ROUTE_PATH_COIMBATORE_ERODE} />
            {/* Custom Animated Truck Icon Marker */}
            <Marker 
              position={{ lat: tracking.current_lat, lng: tracking.current_lng }} 
              title={`Transit Truck: ${booking.driver_name} (${booking.license_plate})`}
              icon={{
                url: TRUCK_ICON_SVG,
                scaledSize: { width: 42, height: 42 },
                anchor: { x: 21, y: 21 }
              } as any}
            />

            {/* Start Hub Icon Marker */}
            <Marker 
              position={{ lat: startLat, lng: startLng }} 
              title="Coimbatore Dispatch Hub"
              icon={{
                url: HUB_ICON_SVG,
                scaledSize: { width: 32, height: 32 },
                anchor: { x: 16, y: 16 }
              } as any}
            />

            {/* Destination Mandi Marker */}
            <Marker 
              position={{ lat: endLat, lng: endLng }} 
              title="Erode Regional Mandi (Destination)"
              icon={{
                url: MANDI_ICON_SVG,
                scaledSize: { width: 32, height: 32 },
                anchor: { x: 16, y: 16 }
              } as any}
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

export const FarmerDashboard: React.FC = () => {
  const { user } = useStore();
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance_inr: 45000, escrow_balance_inr: 122500 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Coimbatore Hub C');
  const [isOrganic, setIsOrganic] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [grade, setGrade] = useState('A');

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Embedded Direct Messaging States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages'>('dashboard');
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  const activeOrders = orders.filter((o: any) => o.status !== 'buyer_request');
  const buyerRequests = orders.filter((o: any) => o.status === 'buyer_request');

  const handleAcceptRequest = async (orderId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/accept-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          farmerId: user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Rajesh Kumar
          farmerName: user?.full_name || 'Rajesh Kumar'
        })
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI recommendations state
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [aiFreshness, setAiFreshness] = useState<number | null>(null);
  const [aiPackaging, setAiPackaging] = useState('');
  const [aiSpoilageDate, setAiSpoilageDate] = useState('');

  const loadDashboardData = async () => {
    try {
      const userId = user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const listRes = await fetch('http://localhost:5000/api/v1/marketplace/listings');
      const orderRes = await fetch(`http://localhost:5000/api/v1/marketplace/orders?userId=${userId}&role=farmer`);
      const walletRes = await fetch(`http://localhost:5000/api/v1/marketplace/wallets?userId=${userId}`);
      
      if (listRes.ok) setListings(await listRes.json());
      if (orderRes.ok) setOrders(await orderRes.json());
      if (walletRes.ok) setWallet(await walletRes.json());
    } catch (err) {
      console.warn('Failed to load real database data, using fallbacks');
      // Fallback
      setListings([
        { id: 'm1', crop_name: 'Sharbati Wheat', variety: 'Premium Grain', quantity_quintals: 150, price_per_quintal: 2450, quality_grade: 'A', location: 'Coimbatore Agri Hub', status: 'active', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', is_organic: true },
        { id: 'm3', crop_name: 'Organic Tomatoes', variety: 'Country Red', quantity_quintals: 45, price_per_quintal: 1200, quality_grade: 'A', location: 'Coimbatore Agri Hub', status: 'active', image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400', is_organic: true }
      ]);
      setOrders([
        { id: 'o1', buyer_name: 'BigBasket Corporate', crop_name: 'Sharbati Wheat', quantity_quintals: 50, price_per_quintal: 2450, total_amount: 122500, status: 'created', created_at: new Date().toISOString() }
      ]);
    }
  };

  const loadChatData = async () => {
    try {
      const userId = user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const res = await fetch(`http://localhost:5000/api/v1/marketplace/chats/rooms?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setChatRooms(data);
        if (data.length > 0 && !activeChatRoom) {
          setActiveChatRoom(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadChatMessages = async (roomId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/marketplace/chats/rooms/${roomId}/messages`);
      if (res.ok) setChatMessages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatRoom) return;

    try {
      const userId = user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const res = await fetch('http://localhost:5000/api/v1/marketplace/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeChatRoom.id,
          senderId: userId,
          content: chatInput
        })
      });
      if (res.ok) {
        setChatInput('');
        loadChatMessages(activeChatRoom.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadChatData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeChatRoom) {
      loadChatMessages(activeChatRoom.id);
      const poll = setInterval(() => {
        loadChatMessages(activeChatRoom.id);
      }, 4000);
      return () => clearInterval(poll);
    }
  }, [activeChatRoom]);

  const handleAISuggest = () => {
    if (!cropName) return;
    const crop = cropName.toLowerCase().trim();
    let basePrice = 2000;
    let freshScore = 96;
    let pack = 'Standard Jute Bags';
    let daysToSpoil = '120 days';

    if (crop.includes('wheat')) {
      basePrice = 2480;
      freshScore = 98;
      pack = 'Moisture-proof PP Bags';
      daysToSpoil = '180 days (stored <12% humidity)';
    } else if (crop.includes('tomato')) {
      basePrice = 1350;
      freshScore = 94;
      pack = 'Ventilated Plastic Crates (Cold-Chain)';
      daysToSpoil = '12 days (cool dry room)';
    } else if (crop.includes('maize') || crop.includes('corn')) {
      basePrice = 1890;
      freshScore = 95;
      pack = 'Aerate Jute Sacks';
      daysToSpoil = '90 days';
    }

    setAiPrice(basePrice);
    setPrice(String(basePrice));
    setAiFreshness(freshScore);
    setAiPackaging(pack);
    setAiSpoilageDate(daysToSpoil);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !quantity || !price) return;
    setLoading(true);

    const payload = {
      crop_name: cropName,
      variety: variety || 'Standard',
      quantity_quintals: Number(quantity),
      price_per_quintal: Number(price),
      quality_grade: grade,
      location,
      is_organic: isOrganic,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
    };

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCropName('');
        setVariety('');
        setQuantity('');
        setPrice('');
        setImageUrl('');
        setAiPrice(null);
        setAiFreshness(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (res.ok) loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, hubId: 'h1' }) // Coimbatore Hub
      });
      if (res.ok) loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full mx-auto">
      {/* Dashboard Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 pb-px">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Inventory & Sales
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Direct Messages & Contacts
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-l-4 border-emerald-500">
              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">Available Balance</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center"><Wallet className="w-6 h-6 mr-2 text-emerald-500" /> ₹{wallet.balance_inr.toLocaleString()}</h3>
              <span className="text-xs text-slate-400 mt-2 block">Direct wallet payout ready</span>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-l-4 border-amber-500">
              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">Held in Escrow</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center"><Clock className="w-6 h-6 mr-2 text-amber-500" /> ₹{wallet.escrow_balance_inr.toLocaleString()}</h3>
              <span className="text-xs text-slate-400 mt-2 block">Pending delivery release</span>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-l-4 border-blue-500">
              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">Listed Cargo Items</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center"><Box className="w-6 h-6 mr-2 text-blue-500" /> {listings.length}</h3>
              <span className="text-xs text-slate-400 mt-2 block">Active marketplace ads</span>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-l-4 border-purple-500">
              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">Active Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center"><Truck className="w-6 h-6 mr-2 text-purple-500" /> {orders.length}</h3>
              <span className="text-xs text-slate-400 mt-2 block">In-progress deliveries</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Produce Listings */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Produce Listings</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> List Produce
                  </button>
                  <button onClick={loadDashboardData} className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer" title="Reload Listings">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {listings.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image_url} alt={item.crop_name} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">{item.crop_name} <span className="text-xs font-normal text-slate-400 font-mono">({item.variety})</span></h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {item.location}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Grade {item.quality_grade}</span>
                          {item.is_organic && <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Organic</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{item.price_per_quintal}</span>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{item.quantity_quintals} quintals left</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md inline-block mt-2 ${item.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
                {listings.length === 0 && (
                  <p className="text-center py-6 text-slate-500 dark:text-gray-500">No active produce listed yet.</p>
                )}
              </div>
            </div>

            {/* AI Recommendations Console */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" /> Nova Agri-AI Engine
              </h3>

              <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-500/10 via-blue-500/5 to-purple-500/10 border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-emerald-300 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Recommended Harvest Timing
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  Based on Soil Moisture index levels (14.2% moisture) and NDVI sat telemetry, wheat crops will reach maximum protein density in **6 days**. Harvest is recommended between Aug 4 and Aug 7.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mandi Price Prediction</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                      <YAxis stroke="#64748B" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#080C14', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-center text-slate-500 dark:text-gray-500">Mandi price trend projection showing +7.2% demand index increase next week.</p>
              </div>
            </div>
          </div>

          {/* Open Buyer Crop Requests (Reverse Marketplace) */}
          <div className="glass-card p-6 rounded-2xl space-y-6 text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-amber-500" /> Open Buyer Product Requests
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerRequests.map((req: any) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col justify-between text-left space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-white">{req.crop_name}</h4>
                        <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-slate-400">{req.id}</span>
                      </div>
                      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">BUY DEMAND</span>
                    </div>
                    
                    <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-gray-400">
                      <p>Buyer: <strong>{req.buyer_name}</strong></p>
                      <p>Quantity Needed: <strong>{(req.quantity_quintals * 100).toFixed(1)} kg</strong></p>
                      <p>Target Price: <strong>₹{req.price_per_quintal} /qtl</strong></p>
                      <p className="text-emerald-400 font-semibold mt-1">Escrow Funds Reserved: ₹{req.total_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAcceptRequest(req.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept & Fulfill Request
                  </button>
                </div>
              ))}
              {buyerRequests.length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-500 dark:text-gray-500 bg-slate-100/30 dark:bg-white/5 rounded-xl border border-dashed border-slate-350 dark:border-white/10 w-full">
                  No active buyer crop requests found. Buyers can request products in the marketplace.
                </div>
              )}
            </div>
          </div>

          {/* Orders Tracking Dashboard */}
          <div className="glass-card p-6 rounded-2xl space-y-6 text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-500" /> Order Tracking & Cargo Logistics
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-800 dark:text-slate-200">
                <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Buyer Name</th>
                    <th className="px-4 py-3 font-semibold">Produce Description</th>
                    <th className="px-4 py-3 font-semibold">Total Amount</th>
                    <th className="px-4 py-3 font-semibold">Logistics Status</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((ord) => (
                    <React.Fragment key={ord.id}>
                      <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                        <td className="px-4 py-4 font-mono font-bold text-slate-900 dark:text-white">{ord.id}</td>
                        <td className="px-4 py-4 text-slate-800 dark:text-gray-300">{ord.buyer_name}</td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-slate-900 dark:text-white">{ord.crop_name}</span>
                          <span className="block text-xs text-slate-500 dark:text-gray-400">{(ord.quantity_quintals * 100).toFixed(1)} kg @ ₹{ord.price_per_quintal}/qtl</span>
                          {ord.status === 'accepted' && (
                            <span className="inline-block mt-1 text-[10px] bg-amber-500/15 text-amber-500 font-mono px-2 py-0.5 rounded font-bold">
                              Handover OTP: {ord.otp_code}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">₹{ord.total_amount.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold
                            ${ord.status === 'created' ? 'bg-blue-500/20 text-blue-400' :
                              ord.status === 'accepted' ? 'bg-amber-500/20 text-amber-400' :
                              ord.status === 'at_hub' ? 'bg-purple-500/20 text-purple-400' :
                              ord.status === 'transit' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                              ord.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-slate-500/20 text-slate-400'}
                          `}>
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {ord.status === 'created' && (
                              <button onClick={() => handleAcceptOrder(ord.id)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold">
                                Accept Order
                              </button>
                            )}
                            {ord.status === 'accepted' && (
                              <button onClick={() => handleShipOrder(ord.id)} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold">
                                Ship to Hub
                              </button>
                            )}
                            {['transit', 'delivered'].includes(ord.status) && (
                              <button 
                                onClick={() => setTrackingOrderId(trackingOrderId === ord.id ? null : ord.id)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" /> {trackingOrderId === ord.id ? 'Hide GPS' : 'Track GPS'}
                              </button>
                            )}
                            {ord.status === 'confirmed' && (
                              <button className="px-3 py-1.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {trackingOrderId === ord.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-slate-100/50 dark:bg-black/30 border-b border-white/5">
                            <div className="max-w-xl mx-auto py-2">
                              <LiveGPSTrackingPanel orderId={ord.id} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {activeOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 dark:text-gray-500">No active orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left Side: Contacts Directory */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" /> Contacts Directory
            </h3>
            <div className="space-y-4">
              {[
                { name: 'BigBasket Corporate (Buyer)', phone: '+91 98941 77651', email: 'procurement@bigbasket.com', role: 'Main Buyer', location: 'Erode Mandi Delivery' },
                { name: 'Saravanan Express (Logistics)', phone: '+91 94421 80922', email: 'driver@expresslogistics.in', role: 'Transporter Driver', location: 'Vehicle: TN-37-DF-8812' },
                { name: 'Coimbatore Hub Manager', role: 'Hub Support', phone: '+91 422 284123', email: 'support@agranex.ai', location: 'Collection Hub' }
              ].map((contact, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{contact.role}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{contact.location}</p>
                  </div>
                  <div className="flex gap-2 text-xs pt-1">
                    <a href={`tel:${contact.phone}`} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-center flex items-center justify-center gap-1 transition-all">
                      <Phone className="w-3.5 h-3.5" /> Call Partner
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Embedded Chat Console */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[600px] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                  {activeChatRoom ? (user?.id === activeChatRoom.farmer_id ? activeChatRoom.buyer_name : activeChatRoom.farmer_name).charAt(0) : 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate w-40">
                    {activeChatRoom ? (user?.id === activeChatRoom.farmer_id ? activeChatRoom.buyer_name : activeChatRoom.farmer_name) : 'Select a Chat Room'}
                  </h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">● Live Node Sync</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {chatRooms.map((room) => {
                  const partnerName = user?.id === room.farmer_id ? room.buyer_name : room.farmer_name;
                  const isActive = activeChatRoom && activeChatRoom.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveChatRoom(room)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 border-transparent'
                      }`}
                    >
                      {partnerName.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-900/40 rounded-xl border border-white/5">
              {chatMessages.map((msg: any) => {
                const isMe = msg.sender_id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                      isMe 
                        ? 'bg-emerald-500 text-white rounded-tr-none' 
                        : 'bg-white/10 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <span className="block text-[8px] text-white/50 text-right font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs py-12">
                  No message history. Start the conversation below.
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-white/10 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Produce Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card relative z-10 w-full max-w-2xl p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">List New Produce Crop</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Inputs */}
                <form className="space-y-4" onSubmit={handleCreateListing}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-slate-500 dark:text-gray-400">Crop Name</label>
                      <input type="text" required value={cropName} onChange={e => setCropName(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="Wheat / Tomato" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-slate-500 dark:text-gray-400">Crop Variety</label>
                      <input type="text" required value={variety} onChange={e => setVariety(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="Sharbati / Hybrid" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-slate-500 dark:text-gray-400">Quantity (Quintals)</label>
                      <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-slate-500 dark:text-gray-400">Quality Grade</label>
                      <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm">
                        <option value="A">Grade A (Premium)</option>
                        <option value="B">Grade B (Standard)</option>
                        <option value="C">Grade C (Industrial)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-slate-500 dark:text-gray-400 flex justify-between items-center">
                      <span>Price per Quintal (₹)</span>
                      <button type="button" onClick={handleAISuggest} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> AI Recommended Price
                      </button>
                    </label>
                    <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="e.g. 2400" />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="organic" checked={isOrganic} onChange={e => setIsOrganic(e.target.checked)} className="rounded border-white/10 text-emerald-500 focus:ring-0 w-4 h-4 bg-slate-100 dark:bg-black/20" />
                    <label htmlFor="organic" className="text-sm text-slate-700 dark:text-gray-300 font-medium">100% Certified Organic Produce</label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-slate-500 dark:text-gray-400">Photo URL</label>
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="https://unsplash.com/..." />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base font-bold flex items-center justify-center gap-2 mt-4">
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Publish to Marketplace
                  </button>
                </form>

                {/* Right Side: AI Assistant Predictions Preview */}
                <div className="bg-slate-100/50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-500" /> Live AI Vision Analysis
                  </h3>
                  
                  {aiPrice ? (
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                        <span className="text-slate-400">Recommended Price:</span>
                        <strong className="text-emerald-400 font-mono">₹{aiPrice} / quintal</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                        <span className="text-slate-400">Predicted Freshness:</span>
                        <strong className="text-blue-400 font-mono">{aiFreshness}% AI Score</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                        <span className="text-slate-400">Estimated Spoilage:</span>
                        <strong className="text-amber-400 font-mono">{aiSpoilageDate}</strong>
                      </div>
                      <div className="flex flex-col border-b border-white/5 pb-2 text-xs">
                        <span className="text-slate-400">Packaging Suggestion:</span>
                        <strong className="text-purple-400 mt-1">{aiPackaging}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-gray-500 text-xs">
                      Enter a crop name above and click <span className="text-emerald-400 font-bold">"AI Recommended Price"</span> to populate simulated crop analysis, packaging suggestions, and spoilage charts.
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 dark:text-gray-500 leading-normal bg-white/5 p-3 rounded-lg border border-white/5">
                    <strong>NVIDIA Vision NIM Core</strong> parses historical moisture indicators, temperature ranges, and regional crop demand indices to recommend pricing curves.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerDashboard;
