import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, Truck, Sparkles, Scale, Percent, Landmark, 
  ArrowRight, ShieldCheck, Thermometer, Clock, Plus, BarChart4
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

export const SharedTruckSystem: React.FC = () => {
  const [hubs, setHubs] = useState<any[]>([]);
  const [truckCost, setTruckCost] = useState(3000);
  
  // Dynamic Farmer Cargo Inputs
  const [farmers, setFarmers] = useState([
    { name: 'Rajesh Kumar', weight: 500 },
    { name: 'Karthi Keyan', weight: 300 },
    { name: 'Mani Vasagam', weight: 200 }
  ]);

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadHubs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/hubs');
      if (res.ok) setHubs(await res.json());
    } catch (err) {
      console.warn('Backend unavailable, using fallback hubs');
      setHubs([
        { id: 'h1', name: 'Coimbatore Collection Hub', capacity_kg: 5000, current_weight_kg: 1200, temperature_celsius: 21.5, dispatch_countdown_seconds: 14400, queue: 3, status: 'collecting' },
        { id: 'h2', name: 'Ludhiana Regional Mandi', capacity_kg: 8000, current_weight_kg: 3400, temperature_celsius: 24.0, dispatch_countdown_seconds: 7200, queue: 5, status: 'collecting' }
      ]);
    }
  };

  useEffect(() => {
    loadHubs();
  }, []);

  // Shared Truck Math
  const totalWeight = farmers.reduce((sum, f) => sum + Number(f.weight), 0);
  
  const calculatedOutputs = farmers.map(f => {
    const weightPct = totalWeight > 0 ? (f.weight / totalWeight) : 0;
    const shareCost = Math.round(truckCost * weightPct);
    const individualCost = Math.round(truckCost * 0.9); // standard single booking estimation
    const savings = Math.max(0, individualCost - shareCost);
    const costPerKg = f.weight > 0 ? (shareCost / f.weight).toFixed(2) : '0';

    return {
      ...f,
      weightPct: (weightPct * 100).toFixed(1),
      shareCost,
      costPerKg,
      savings,
      individualCost
    };
  });

  const totalSavings = calculatedOutputs.reduce((sum, f) => sum + f.savings, 0);

  // Recharts Format
  const chartCostData = calculatedOutputs.map(f => ({
    name: f.name.split(' ')[0],
    'Shared Cost (₹)': f.shareCost,
    'Individual Cost (₹)': f.individualCost
  }));

  const chartPieData = calculatedOutputs.map(f => ({
    name: f.name,
    value: Number(f.weight)
  }));

  // Handle Weight Inputs
  const handleWeightChange = (index: number, val: string) => {
    const updated = [...farmers];
    updated[index].weight = Number(val) || 0;
    setFarmers(updated);
  };

  // Submit shared booking to dispatch logistics pickup
  const handleBookSharedTruck = async () => {
    setIsSubmitting(true);
    setBookingSuccess(false);

    const bookingPayload = {
      hubId: 'h1', // Coimbatore Hub
      vehicleMake: 'Tata',
      vehicleModel: 'Ultra T.7',
      licensePlate: 'TN-37-DF-8812',
      totalCost: truckCost,
      bookings: farmers.map(f => ({
        farmer_name: f.name,
        weight_kg: f.weight
      }))
    };

    try {
      const res = await fetch('http://localhost:5000/api/v1/marketplace/logistics/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      if (res.ok) {
        setBookingSuccess(true);
        loadHubs(); // update hub weight statuses
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Shared Cargo Logistics & Hubs 🚛</h1>
        <p className="text-slate-600 dark:text-gray-400">Co-load crop shipments, split vehicle costs proportionally, and view carbon savings.</p>
      </div>

      {/* Village Collection Hubs Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Landmark className="w-5 h-5 text-emerald-500" /> Active Village Collection Hubs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => (
            <div key={hub.id} className="glass-card p-5 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 dark:text-white text-base">{hub.name}</h4>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${hub.status === 'collecting' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{hub.status}</span>
              </div>

              {/* Progress bar of storage capacity */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Total Cargo Load:</span>
                  <span className="text-slate-800 dark:text-white font-semibold">{hub.current_weight_kg.toLocaleString()}kg / {hub.capacity_kg.toLocaleString()}kg</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-black/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(hub.current_weight_kg / hub.capacity_kg) * 100}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="space-y-0.5">
                  <span className="block text-slate-500"><Thermometer className="w-3.5 h-3.5 mx-auto text-rose-500" /> Temp</span>
                  <strong className="text-slate-800 dark:text-white">{hub.temperature_celsius}°C</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-500"><Clock className="w-3.5 h-3.5 mx-auto text-blue-500" /> Dispatch</span>
                  <strong className="text-slate-800 dark:text-white">{Math.round(hub.dispatch_countdown_seconds / 3600)} hrs</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-500"><Scale className="w-3.5 h-3.5 mx-auto text-purple-500" /> Queue</span>
                  <strong className="text-slate-800 dark:text-white">{hub.queue} Farmers</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Split Calculator inputs */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" /> Proportional Cost Allocator
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block font-semibold">Total Truck Booking Cost (₹)</label>
              <input 
                type="number" 
                value={truckCost} 
                onChange={e => setTruckCost(Number(e.target.value) || 0)}
                className="w-full bg-slate-100 dark:bg-[#080C14]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Farmer Weights Inputs</h4>
            
            {farmers.map((farmer, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 items-center bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <span className="font-semibold text-xs text-slate-800 dark:text-gray-300">{farmer.name}</span>
                <div className="relative">
                  <input 
                    type="number" 
                    value={farmer.weight} 
                    onChange={e => handleWeightChange(idx, e.target.value)}
                    className="w-full bg-slate-200 dark:bg-[#080C14]/50 border border-slate-300 dark:border-white/10 rounded-lg py-1.5 px-3 text-slate-900 dark:text-white text-xs font-mono pr-8 text-right"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">kg</span>
                </div>
              </div>
            ))}
          </div>

          {/* Allocation Table */}
          <div className="overflow-x-auto pt-4 border-t border-slate-200 dark:border-white/5">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 dark:text-gray-400 uppercase border-b border-slate-200 dark:border-white/10">
                  <th className="py-2">Farmer</th>
                  <th className="py-2 text-right">Weight (kg)</th>
                  <th className="py-2 text-right">Share %</th>
                  <th className="py-2 text-right">Cost Share</th>
                  <th className="py-2 text-right">Cost/Kg</th>
                  <th className="py-2 text-right">Savings</th>
                </tr>
              </thead>
              <tbody>
                {calculatedOutputs.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 dark:border-white/5 font-medium">
                    <td className="py-3 text-slate-900 dark:text-white">{item.name}</td>
                    <td className="py-3 text-right font-mono">{item.weight} kg</td>
                    <td className="py-3 text-right font-mono">{item.weightPct}%</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{item.shareCost}</td>
                    <td className="py-3 text-right font-mono">₹{item.costPerKg}</td>
                    <td className="py-3 text-right font-mono text-emerald-400 bg-emerald-500/5 px-2 rounded">₹{item.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 gap-4">
            <div className="text-xs text-slate-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 inline mr-1 text-emerald-500" />
              Total Logistical Savings Offset: <strong className="font-mono text-sm">₹{totalSavings.toLocaleString()} (40% discount)</strong>
            </div>
            <button 
              onClick={handleBookSharedTruck} 
              disabled={isSubmitting} 
              className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              {isSubmitting ? 'Booking Fleet...' : 'Dispatch Shared Truck Booking'}
            </button>
          </div>

          {bookingSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-semibold">
              🎉 Shared Cargo pickup dispatched! Available for Logistics fleet drivers.
            </div>
          )}
        </div>

        {/* Charts & Split visualizations */}
        <div className="space-y-6">
          {/* AI Route Optimization Card */}
          {totalWeight > 0 && (
            <div className="glass-card p-5 rounded-2xl space-y-4 border border-emerald-500/20 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> AI Route Optimized Savings
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Distance Saved</span>
                  <strong className="text-emerald-400 font-mono text-base block mt-0.5">
                    {Math.max(5, (farmers.filter(f => f.weight > 0).length * 22) - Math.round(15 + farmers.filter(f => f.weight > 0).length * 6))} km
                  </strong>
                  <span className="text-[9px] text-slate-500">vs {(farmers.filter(f => f.weight > 0).length * 22)}km separate</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Carbon Offset</span>
                  <strong className="text-blue-400 font-mono text-base block mt-0.5">
                    {Number((Math.max(5, (farmers.filter(f => f.weight > 0).length * 22) - Math.round(15 + farmers.filter(f => f.weight > 0).length * 6)) * 0.35 * 2.68).toFixed(1))} kg
                  </strong>
                  <span className="text-[9px] text-slate-500">CO₂ equivalent saved</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Total Route:</span>
                  <span className="font-semibold text-slate-200">{Math.round(15 + farmers.filter(f => f.weight > 0).length * 6)} km</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Diesel Saved:</span>
                  <span className="font-semibold text-slate-200">{Number((Math.max(5, (farmers.filter(f => f.weight > 0).length * 22) - Math.round(15 + farmers.filter(f => f.weight > 0).length * 6)) * 0.35).toFixed(1))} Liters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Efficiency:</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    +{Math.round((Math.max(5, (farmers.filter(f => f.weight > 0).length * 22) - Math.round(15 + farmers.filter(f => f.weight > 0).length * 6)) / ((farmers.filter(f => f.weight > 0).length * 22) || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10 text-left">
                Clustered picking loops reduce vehicle mileage and diesel consumption via regional pooling at Coimbatore Hub.
              </div>
            </div>
          )}

          {/* Weight share split pie chart */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-4.5 h-4.5 text-emerald-500" /> Weight Allocation
            </h3>
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalWeight}kg</span>
                <span className="text-[10px] text-slate-500">Total Cargo</span>
              </div>
            </div>
          </div>

          {/* Cost Savings Bar Chart */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart4 className="w-4.5 h-4.5 text-emerald-500" /> Cost Savings Comparison
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCostData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Shared Cost (₹)" fill="#10B981" />
                  <Bar dataKey="Individual Cost (₹)" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTruckSystem;
