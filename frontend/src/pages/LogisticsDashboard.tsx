import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, MapPin, CheckCircle, RefreshCw, Key, ShieldAlert, 
  Map, PenTool, Image, Wallet, Clock, User, Award, Compass
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { APIProvider, Map as GoogleMap, Marker, useMap } from '@vis.gl/react-google-maps';

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

const mockPerformanceData = [
  { name: 'Trip 1', fuelSaved: 12, distance: 45 },
  { name: 'Trip 2', fuelSaved: 18, distance: 60 },
  { name: 'Trip 3', fuelSaved: 15, distance: 50 },
  { name: 'Trip 4', fuelSaved: 22, distance: 75 },
];

export const LogisticsDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTracking, setActiveTracking] = useState<any>(null);
  const [earnings, setEarnings] = useState(8000);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  
  // Delivery confirmation states
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [orderOtps, setOrderOtps] = useState<Record<string, string>>({});
  const [sigUploaded, setSigUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [trackingCoords, setTrackingCoords] = useState<{ lat: number; lng: number } | null>(null);

  const tripOrders = allOrders.filter(o => 
    selectedTrip && (
      (selectedTrip.order_ids && selectedTrip.order_ids.includes(o.id)) ||
      (selectedTrip.farmers && selectedTrip.farmers.some((f: any) => f.name === o.farmer_name) && o.status !== 'confirmed')
    )
  );
  const allOrdersConfirmed = tripOrders.length > 0 && tripOrders.every(o => o.status === 'confirmed');

  const fetchActiveTracking = async () => {
    if (!activeTracking) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/marketplace/logistics/tracking/booking/${activeTracking.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracking) {
          setTrackingCoords({ lat: data.tracking.current_lat, lng: data.tracking.current_lng });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActiveTracking();
    const interval = setInterval(fetchActiveTracking, 4000);
    return () => clearInterval(interval);
  }, [activeTracking]);

  // Load bookings and active tracking states
  const loadLogisticsData = async () => {
    try {
      const bookRes = await fetch('http://localhost:5000/api/v1/marketplace/logistics/bookings');
      if (bookRes.ok) {
        const data = await bookRes.json();
        setBookings(data);
        // Find active tracking
        const active = data.find((b: any) => b.status === 'accepted' || b.status === 'transit');
        if (active) {
          setActiveTracking(active);
        }
      }

      const orderRes = await fetch('http://localhost:5000/api/v1/marketplace/orders');
      if (orderRes.ok) {
        setAllOrders(await orderRes.json());
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback logistics bookings');
      setBookings([
        {
          id: 'b1',
          hub_name: 'Coimbatore Collection Hub',
          vehicle_make: 'Tata',
          vehicle_model: 'Ultra T.7',
          license_plate: 'TN-37-DF-8812',
          driver_name: 'Saravanan Chinnasamy',
          total_cost: 3000,
          status: 'accepted',
          dispatch_time: new Date(Date.now() + 2*60*60*1000).toISOString(),
          farmers: [
            { name: 'Rajesh Kumar', weight_kg: 500, share_cost: 1500, savings: 1200 },
            { name: 'Karthi Keyan', weight_kg: 300, share_cost: 900, savings: 720 }
          ],
          order_ids: ['o1']
        }
      ]);
      setAllOrders([
        { id: 'o1', buyer_name: 'BigBasket Corporate', crop_name: 'Sharbati Wheat', quantity_quintals: 50, price_per_quintal: 2450, total_amount: 122500, status: 'created', created_at: new Date().toISOString(), otp_code: '4821', farmer_name: 'Rajesh Kumar' }
      ]);
    }
  };

  useEffect(() => {
    loadLogisticsData();
  }, []);

  // Signature Canvas Helpers
  useEffect(() => {
    if (selectedTrip) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
          }
        }
      }, 300);
    }
  }, [selectedTrip]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setSigUploaded(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigUploaded(false);
  };

  // Accept a booking
  const handleAcceptTrip = async (bookingId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/logistics/bookings/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, driverName: 'Saravanan Chinnasamy' })
      });
      if (res.ok) {
        loadLogisticsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulating live GPS tracking updates
  const handleGPSUpdate = async (status: string) => {
    if (!activeTracking) return;
    
    // Coimbatore coordinates
    let lat = 10.9856;
    let lng = 76.9664;
    let speed = 45;
    let eta = '35 mins';

    if (status === 'transit') {
      lat = 11.1633; // Midpoint between Coimbatore and Erode
      lng = 77.3417; // Midpoint between Coimbatore and Erode
      speed = 52;
      eta = '15 mins';
    } else if (status === 'arrived') {
      lat = 11.3410; // Erode Agri Mandi
      lng = 77.7170; // Erode Agri Mandi
      speed = 0;
      eta = 'Arrived at Destination';
    }

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/logistics/bookings/update-gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeTracking.id, lat, lng, speed, eta, status })
      });
      if (res.ok) {
        loadLogisticsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm transporter pickup handover from farmer (Verifies farmer OTP to start transit)
  const handleConfirmPickup = async (orderId: string, otp: string) => {
    if (!otp) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/orders/confirm-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Pickup Handover confirmed for order ${orderId}! Live tracking enabled.`);
        loadLogisticsData();
      } else {
        setErrorMessage(data.message || 'Handover OTP validation failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Verification failed.');
    }
  };

  // Confirm final order delivery (Releasing escrow funds)
  const handleDeliverOrder = async (orderId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const confirmRes = await fetch('http://localhost:5000/api/v1/marketplace/orders/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await confirmRes.json();
      if (confirmRes.ok && data.success) {
        setSuccessMessage(`Order ${orderId} delivered. Payout escrow funds released!`);
        loadLogisticsData();
      } else {
        setErrorMessage(data.message || 'Delivery confirmation failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Delivery failed.');
    }
  };

  // Confirm delivery trip (Completing truck booking)
  const handleCompleteTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setIsConfirming(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/logistics/bookings/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedTrip.id,
          proofImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
          signature: 'Signature Confirmed'
        })
      });
      if (res.ok) {
        setSuccessMessage('Logistics trip completed and signature proofs archived.');
        setEarnings(prev => prev + 1500); // add logistics booking fee share
        setSelectedTrip(null);
        setSigUploaded(false);
        setPhotoUploaded(false);
        loadLogisticsData();
      } else {
        setErrorMessage('Failed to deliver cargo.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to complete delivery.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Logistics & Fleet Command Center 🚛</h1>
          <p className="text-slate-600 dark:text-gray-400">Accept bookings, update live GPS, and process escrow releases.</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span>Earnings Balance: <strong className="font-mono">₹{earnings.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Completed Trips</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">42</h3>
          <span className="text-xs text-emerald-400 mt-2 block font-medium">99.2% delivery success</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Active Fleet Trucks</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">5 / 8</h3>
          <span className="text-xs text-slate-400 mt-2 block">Available drivers: 3</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Total Distance</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">1,480 km</h3>
          <span className="text-xs text-emerald-400 mt-2 block font-medium">Coimbatore Mandi Region</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Eco Fuel Saved</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">184 Liters</h3>
          <span className="text-xs text-emerald-400 mt-2 block font-medium">Shared truck logistics carbon offset</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available pickups queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Available Collection Pickups</h3>
              <button onClick={loadLogisticsData} className="text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-5 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">{booking.hub_name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-gray-400">
                      <div>
                        <span className="block font-medium">Vehicle assigned:</span>
                        <span className="text-slate-800 dark:text-white font-semibold">{booking.vehicle_make} {booking.vehicle_model}</span>
                      </div>
                      <div>
                        <span className="block font-medium">License Plate:</span>
                        <span className="text-slate-800 dark:text-white font-mono font-semibold">{booking.license_plate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.farmers.map((f: any, idx: number) => (
                        <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                          {f.name}: {f.weight_kg}kg
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{booking.total_cost.toLocaleString()}</span>
                    {booking.status === 'requested' ? (
                      <button onClick={() => handleAcceptTrip(booking.id)} className="btn-primary w-full py-1.5 px-4 text-xs font-bold">
                        Accept Cargo Trip
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => setSelectedTrip(booking)} className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Deliver Cargo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-center py-6 text-slate-500 dark:text-gray-500">No active cargo bookings.</p>
              )}
            </div>
          </div>

          {/* Active Navigation Map Panel */}
          {activeTracking && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-500" /> GPS Navigation & Route Optimization
              </h3>

              <div className="h-60 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 relative">
                {/* Visual Route Info Overlay */}
                <div className="absolute top-4 left-4 z-10 glass-card p-3 rounded-lg border border-white/10 text-xs space-y-1 bg-black/85">
                  <p className="text-slate-400">Active Booking: <strong className="text-white font-mono">{activeTracking.id}</strong></p>
                  <p className="text-slate-400">Target ETA: <strong className="text-white">12 mins (Optimal Route)</strong></p>
                  <p className="text-slate-400">Speed: <strong className="text-emerald-400 font-mono">48 km/h</strong></p>
                </div>
                
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button onClick={() => handleGPSUpdate('transit')} className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold">Simulate Transit</button>
                  <button onClick={() => handleGPSUpdate('arrived')} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">Simulate Arrival</button>
                </div>

                <APIProvider apiKey="AIzaSyC4665Tc3mwQgvwXsWpxT7DRbfB2KTUzsA">
                  <GoogleMap
                    zoom={9}
                    center={{ 
                      lat: trackingCoords?.lat || 11.1633, 
                      lng: trackingCoords?.lng || 77.3417 
                    }}
                    gestureHandling={'cooperative'}
                    disableDefaultUI={true}
                  >
                    {/* Real Highway Waypoint Path Polyline */}
                    <MapPolyline path={[
                      { lat: 10.9856, lng: 76.9664 }, // Coimbatore Hub
                      { lat: 11.0168, lng: 77.0325 }, // Avinashi Road
                      { lat: 11.0850, lng: 77.1650 }, // Karumathampatti
                      { lat: 11.1085, lng: 77.3411 }, // Tiruppur Bypass
                      { lat: 11.2330, lng: 77.5320 }, // Perundurai Hub
                      { lat: 11.3410, lng: 77.7170 }  // Erode Regional Mandi
                    ]} />

                    {/* Custom Animated Truck Icon Marker */}
                    <Marker 
                      position={{ 
                        lat: trackingCoords?.lat || 10.9856, 
                        lng: trackingCoords?.lng || 76.9664 
                      }} 
                      title="Live Vehicle Coordinates"
                      icon={{
                        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="22" fill="#090D16" stroke="#10B981" stroke-width="2.5"/>
                          <path d="M12 18h14v10H12z" fill="#10B981"/>
                          <path d="M26 21h6l4 4v3h-10z" fill="#059669"/>
                          <circle cx="16" cy="30" r="3" fill="#34D399"/>
                          <circle cx="30" cy="30" r="3" fill="#34D399"/>
                          <path d="M14 20h4v3h-4z" fill="#ECFDF5"/>
                        </svg>
                        `)}`,
                        scaledSize: { width: 42, height: 42 },
                        anchor: { x: 21, y: 21 }
                      } as any}
                    />
                    <Marker 
                      position={{ lat: 10.9856, lng: 76.9664 }} 
                      title="Coimbatore Hub" 
                      icon={{
                        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="#1E293B" stroke="#3B82F6" stroke-width="2"/>
                          <path d="M10 24V14l8-6 8 6v10h-6v-6h-4v6z" fill="#3B82F6"/>
                        </svg>
                        `)}`,
                        scaledSize: { width: 32, height: 32 },
                        anchor: { x: 16, y: 16 }
                      } as any}
                    />
                    <Marker 
                      position={{ lat: 11.3410, lng: 77.7170 }} 
                      title="Erode Agri Mandi" 
                      icon={{
                        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
                          <path d="M18 10l7 5v11H11V15z" fill="#F59E0B"/>
                        </svg>
                        `)}`,
                        scaledSize: { width: 32, height: 32 },
                        anchor: { x: 16, y: 16 }
                      } as any}
                    />
                  </GoogleMap>
                </APIProvider>
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Performance */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Fleet Eco Efficiency
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#080C14', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Line type="monotone" dataKey="fuelSaved" name="Fuel Saved (L)" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="distance" name="Distance (km)" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> Driver Roster
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="font-semibold text-slate-800 dark:text-white">Saravanan Chinnasamy</span>
                <span className="text-emerald-400 font-bold">ON TRIP (b1)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="font-semibold text-slate-800 dark:text-white">Ranganathan Swamy</span>
                <span className="text-slate-400 font-bold">AVAILABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Confirmation Dialog */}
      <AnimatePresence>
        {selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTrip(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card relative z-10 w-full max-w-lg p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cargo Logistics Dispatcher</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">Verify Farmer handover codes and authorize escrow delivery releases.</p>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs text-center">{successMessage}</div>
              )}

              {/* Order Verification Section */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">Trip Cargo Shipments ({tripOrders.length})</h3>
                {tripOrders.map(order => {
                  const isConfirmed = order.status === 'confirmed';
                  return (
                    <div key={order.id} className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">{order.farmer_name}</span>
                          <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">{order.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{order.crop_name} - {order.quantity_quintals} quintals</p>
                        <p className="text-xs font-semibold text-emerald-400 mt-0.5">Escrow: ₹{order.total_amount.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isConfirmed ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Escrow Released
                          </span>
                        ) : order.status === 'accepted' || order.status === 'truck_assigned' ? (
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Farmer OTP"
                              value={orderOtps[order.id] || ''}
                              onChange={e => setOrderOtps({...orderOtps, [order.id]: e.target.value})}
                              className="w-24 bg-slate-200 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-mono text-center outline-none"
                            />
                            <button 
                              type="button"
                              onClick={() => handleConfirmPickup(order.id, orderOtps[order.id])}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Verify Pickup
                            </button>
                          </div>
                        ) : order.status === 'transit' ? (
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold animate-pulse">
                            🚚 In Transit
                          </span>
                        ) : order.status === 'delivered' ? (
                          <button 
                            type="button"
                            onClick={() => handleDeliverOrder(order.id)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Release Escrow
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 capitalize">{order.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Only show signature/photo proofs once cargo OTPs are cleared */}
              <AnimatePresence>
                {allOrdersConfirmed ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 border-t border-white/5 pt-4">
                    <form onSubmit={handleCompleteTrip} className="space-y-4">
                      {/* Proof of Signature Canvas */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 block font-semibold flex justify-between">
                          <span>Draw Consignee Signature Proof</span>
                          <button type="button" onClick={clearSignature} className="text-xs text-red-400 font-bold">Clear</button>
                        </label>
                        <canvas 
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full h-28 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 cursor-crosshair"
                          width={400}
                          height={112}
                        />
                      </div>

                      {/* Upload Image Simulation */}
                      <div className="flex gap-4 items-center">
                        <button 
                          type="button" 
                          onClick={() => setPhotoUploaded(true)}
                          className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            photoUploaded ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-200'
                          }`}
                        >
                          <Image className="w-4 h-4" /> 
                          {photoUploaded ? 'Cargo Photo Attached' : 'Capture Delivery Photo'}
                        </button>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isConfirming || !sigUploaded || !photoUploaded} 
                        className="btn-primary w-full py-2.5 font-bold flex items-center justify-center gap-2 mt-4"
                      >
                        {isConfirming && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Complete Trip & Archive Proofs
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs text-center font-medium">
                    ⚠️ Verify farmer pickup codes and release all crop cargo escrows before completing this logistics trip.
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogisticsDashboard;
