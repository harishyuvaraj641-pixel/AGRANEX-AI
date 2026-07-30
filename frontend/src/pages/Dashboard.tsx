import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bug, TrendingUp, DollarSign, CloudRain, Cloud, Sun, Wind, Droplets, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useStore } from '../store/useStore';
import { getFarmPlots } from '../services/api';
import { FarmPlot } from '../types';
import { calculateYield } from './DigitalTwin';

// Mock Data inline for standalone rendering
const cropHealthData = [
  { month: 'Jan', ndvi: 0.65 }, { month: 'Feb', ndvi: 0.72 }, { month: 'Mar', ndvi: 0.78 },
  { month: 'Apr', ndvi: 0.82 }, { month: 'May', ndvi: 0.85 }, { month: 'Jun', ndvi: 0.90 }
];

const revenueData = [
  { month: 'Jan', income: 45000, expense: 20000 }, { month: 'Feb', income: 52000, expense: 18000 },
  { month: 'Mar', income: 48000, expense: 22000 }, { month: 'Apr', income: 61000, expense: 19000 },
  { month: 'May', income: 75000, expense: 25000 }, { month: 'Jun', income: 90000, expense: 30000 }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

export const Dashboard: React.FC = () => {
  const { user, notifications, sim } = useStore();
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Apply Urea to Wheat Field (Plot A)', time: 'Today, 4:00 PM', completed: false, icon: Droplets, color: 'text-blue-400' },
    { id: 2, title: 'Harvest ready Tomatoes (Plot C)', time: 'Tomorrow, 8:00 AM', completed: false, icon: Activity, color: 'text-amber-400' },
    { id: 3, title: 'PM Kisan KYC Deadline', time: 'In 3 days', completed: false, icon: DollarSign, color: 'text-red-400' }
  ]);

  useEffect(() => {
    const loadPlots = async () => {
      const data = await getFarmPlots();
      setPlots(data);
    };
    loadPlots();
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Dynamic calculations from Digital Twin sim
  const activeDiseases = useMemo(() => {
    if (sim.diseasePressure === 'none') return 0;
    if (sim.diseasePressure === 'low') return 1;
    if (sim.diseasePressure === 'medium') return 2;
    return 3;
  }, [sim.diseasePressure]);

  const averageHealth = useMemo(() => {
    let base = 94;
    if (sim.diseasePressure === 'high') base -= 35;
    else if (sim.diseasePressure === 'medium') base -= 20;
    else if (sim.diseasePressure === 'low') base -= 8;

    const phDiff = Math.abs(6.5 - sim.soilPh);
    if (phDiff > 0.8) base -= Math.round(phDiff * 12);

    if (sim.temperature > 38 || sim.temperature < 15) base -= 10;
    return Math.max(20, Math.min(100, base));
  }, [sim.diseasePressure, sim.soilPh, sim.temperature]);

  const predictedYieldValue = useMemo(() => {
    const totalYield = ['Wheat', 'Maize', 'Tomato', 'Cotton'].reduce((sum, crop) => {
      const cy = calculateYield(sim, crop);
      return sum + cy.yieldPerHa * 2.5; // Assume 2.5 hectares average per plot
    }, 0);
    return totalYield.toFixed(1);
  }, [sim]);

  const predictedRevenueValue = useMemo(() => {
    const totalRev = ['Wheat', 'Maize', 'Tomato', 'Cotton'].reduce((sum, crop) => {
      const cy = calculateYield(sim, crop);
      return sum + cy.revenue;
    }, 0);
    return `₹${(totalRev / 100000).toFixed(1)}L`;
  }, [sim]);

  const WeatherIconComp = useMemo(() => {
    if (sim.rainfallMm > 900) return CloudRain;
    if (sim.temperature > 32) return Sun;
    return Cloud;
  }, [sim.rainfallMm, sim.temperature]);

  const weatherLabel = useMemo(() => {
    if (sim.rainfallMm > 900) return 'Heavy Monsoon Rain';
    if (sim.rainfallMm > 400) return 'Scattered Showers';
    if (sim.temperature > 34) return 'Sunny & Hot';
    return 'Partly Cloudy';
  }, [sim.rainfallMm, sim.temperature]);

  const dynamicNotifications = useMemo(() => {
    const list = [...notifications];
    if (sim.diseasePressure !== 'none') {
      list.unshift({
        id: 'dyn-disease',
        title: `CRITICAL: Disease Alert (Pressure: ${sim.diseasePressure.toUpperCase()})`,
        message: `High relative humidity & warm temperature (${sim.temperature}°C) are accelerating blight spreading in Plot C.`,
        type: 'alert',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
    if (sim.soilPh < 5.5 || sim.soilPh > 7.5) {
      list.unshift({
        id: 'dyn-ph',
        title: `Soil pH Warning: ${sim.soilPh.toFixed(1)}`,
        message: `Soil acidity is outside optimal range (6.0 - 7.0) for wheat crops. Nutrient lockout risk high.`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
    return list;
  }, [notifications, sim]);

  // Removed local hologram helpers

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'} 👋</h1>
          <p className="text-slate-600 dark:text-gray-400">Here's your digital farm overview for today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => {
              const reportContent = `AGRANEX AI — Enterprise Smart Farm Executive Report
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Farm Owner: ${user?.full_name || 'Farmer Rajesh'}
Location: Coimbatore Agri Zone, Tamil Nadu

==================================================
1. EXECUTIVE SUMMARY & FARM HEALTH
==================================================
• Farm Health Score: ${averageHealth}/100 (${averageHealth > 80 ? 'Optimal State' : 'Requires Monitoring'})
• Active Crop Diseases: ${activeDiseases} (${activeDiseases > 0 ? 'Requires Immediate Treatment' : 'All Clear'})
• Seasonal Predicted Yield: ${predictedYieldValue} Tonnes (Simulated across WebGL Digital Twin)
• Estimated Revenue This Season: ${predictedRevenueValue} (Adjusted for soil & market parameters)

==================================================
2. DIGITAL TWIN SIMULATION PARAMETERS
==================================================
• Soil pH Level: ${sim.soilPh.toFixed(1)}
• Temperature: ${sim.temperature}°C
• Rainfall Index: ${sim.rainfallMm} mm
• Nitrogen (N): ${sim.nitrogenPpm} ppm | Phosphorus (P): 48 kg/ha | Potassium (K): 120 kg/ha
• Soil Moisture: 65%
• Disease Pressure Level: ${sim.diseasePressure.toUpperCase()}

==================================================
3. WEATHER INTELLIGENCE & ADVISORY
==================================================
• Current Weather: ${weatherLabel} (${sim.temperature}°C)
• Humidity: 82% | Wind Speed: 14 km/h
• Irrigation Recommendation: Plot B requires 420L drip cycle today at 04:00 PM due to moisture stress.

==================================================
4. UPCOMING AGRI TASKS
==================================================
1. Apply Urea to Wheat Field (Plot A) - Today, 4:00 PM
2. Harvest ready Tomatoes (Plot C) - Tomorrow, 8:00 AM
3. PM Kisan KYC Deadline - In 3 days

==================================================
Generated by AGRANEX AI Digital Twin Platform © 2026
`;
              const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `AGRANEX_Farm_Report_${new Date().toISOString().slice(0,10)}.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary text-sm transition-colors hover:bg-slate-200 dark:hover:bg-white/20 cursor-pointer flex items-center gap-1.5"
          >
            📥 Download Report
          </button>
          <button className="btn-primary text-sm font-medium transition-colors">
            Add New Plot
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Farm Health Score', value: `${averageHealth}/100`, icon: Activity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', trend: `${averageHealth > 80 ? 'Optimal state' : 'Requires monitoring'}` },
          { title: 'Active Diseases', value: String(activeDiseases), icon: Bug, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', trend: `${activeDiseases > 0 ? 'Requires treatment' : 'All clear'}` },
          { title: 'Predicted Yield', value: `${predictedYieldValue} t`, icon: TrendingUp, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', trend: 'Twin simulation dynamic' },
          { title: 'Revenue This Season', value: predictedRevenueValue, icon: DollarSign, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30', trend: 'Adjusted to soil factors' }
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className={`kpi-card relative overflow-hidden p-6 rounded-2xl glass-card border ${kpi.border} backdrop-blur-md hover:shadow-lg transition-all duration-300 group`}>
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
               <kpi.icon className={`w-16 h-16 ${kpi.color}`} />
             </div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">{kpi.title}</h3>
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                   <kpi.icon className="w-5 h-5" />
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{kpi.value}</span>
                <span className="text-xs text-slate-500 dark:text-gray-400 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" />{kpi.trend}</span>
             </div>
          </motion.div>
        ))}
      </div>

      {/* 3D Hologram moved to Google Maps */}

      {/* Row 2: AI Insights & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Insights Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <span className="text-2xl mr-2">✨</span> Nova AI Insights
            </h3>
            <button className="text-xs text-[#10B981] hover:underline font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {dynamicNotifications.slice(0, 3).map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border-l-4 ${notif.type === 'alert' ? 'border-red-500' : notif.type === 'warning' ? 'border-amber-500' : 'border-[#10B981]'} flex items-start gap-4 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer`}>
                <div className={`p-2 rounded-lg ${notif.type === 'alert' ? 'bg-red-500/10 text-red-500' : notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-[#10B981]/10 text-[#10B981]'}`}>
                  {notif.type === 'alert' ? <Bug className="w-5 h-5" /> : notif.type === 'warning' ? <Droplets className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-white text-sm">{notif.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{notif.message}</p>
                </div>
              </div>
            ))}
            {dynamicNotifications.length === 0 && (
              <div className="text-center py-6 text-slate-400 dark:text-gray-500 text-sm">No new insights for today.</div>
            )}
          </div>
        </motion.div>

        {/* Right: Weather Widget */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-sky-100/80 dark:from-[rgba(15,23,42,0.8)] dark:via-[rgba(30,58,138,0.4)] dark:to-[rgba(15,23,42,0.8)] border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 text-9xl opacity-10">⛅</div>
           <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Local Weather</h3>
             <span className="text-xs text-slate-700 dark:text-gray-300 bg-white/70 dark:bg-[rgba(0,0,0,0.2)] px-2 py-1 rounded-md">Coimbatore</span>
           </div>
           
           <div className="flex items-center gap-6 mb-8 relative z-10">
              <WeatherIconComp className="w-16 h-16 text-blue-500 dark:text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" />
              <div>
                <div className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">{sim.temperature}°<span className="text-2xl text-slate-500 dark:text-gray-400 font-normal">C</span></div>
                <div className="text-blue-600 dark:text-blue-300 font-medium mt-1">{weatherLabel}</div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 border-t border-slate-200 dark:border-white/10 pt-4">
              <div className="flex items-center text-sm text-slate-700 dark:text-gray-300"><Droplets className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" /> Humidity: {sim.rainfallMm > 900 ? '92%' : sim.rainfallMm > 400 ? '82%' : '65%'}</div>
              <div className="flex items-center text-sm text-slate-700 dark:text-gray-300"><Wind className="w-4 h-4 mr-2 text-slate-500 dark:text-gray-400" /> Wind: {sim.windSpeed} km/h</div>
           </div>

           <div className="flex justify-between items-center bg-white/70 dark:bg-[rgba(0,0,0,0.2)] rounded-xl p-3 relative z-10">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                <div key={day} className="flex flex-col items-center">
                  <span className="text-xs text-slate-500 dark:text-gray-400 mb-1">{day}</span>
                  {i % 2 === 0 ? <Sun className="w-5 h-5 text-amber-500 mb-1" /> : <CloudRain className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-1" />}
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{Math.round(sim.temperature + (i - 2) * 1.5)}°</span>
                </div>
              ))}
           </div>
        </motion.div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Crop Health Trend */}
         <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Crop Health Trend (NDVI)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cropHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Area type="monotone" dataKey="ndvi" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorNdvi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Revenue vs Expenses */}
         <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Revenue vs Expenses</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Income (₹)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" name="Expense (₹)" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </motion.div>
      </div>

      {/* Row 4: Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
         {/* Upcoming Tasks */}
         <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Tasks</h3>
              <button className="text-[#10B981] hover:opacity-80 transition-opacity"><Calendar className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
               {tasks.map((task) => (
                 <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-slate-100/70 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-black/30 ${task.color}`}><task.icon className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-800 dark:text-white'}`}>{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1" />{task.time}</p>
                    </div>
                    <div>
                      <button onClick={() => toggleTask(task.id)} className={`transition-colors ${task.completed ? 'text-[#10B981]' : 'text-slate-400 dark:text-gray-500 hover:text-[#10B981]'}`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>

         {/* Recent Notifications */}
         <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Activity Feed</h3>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-white/10 before:to-transparent">
                {[
                  { title: 'Soil Sensor calibration complete', time: '2h ago', icon: Activity },
                  { title: 'Drone flight finished for North Plot', time: '5h ago', icon: Bug },
                  { title: 'System auto-irrigation activated', time: '1d ago', icon: Droplets }
                ].map((feed, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-slate-500 dark:text-gray-400 group-[.is-active]:text-[#10B981] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <feed.icon className="w-4 h-4" />
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-black/20">
                       <div className="flex items-center justify-between mb-1">
                         <div className="font-medium text-sm text-slate-800 dark:text-gray-200">{feed.title}</div>
                       </div>
                       <div className="text-xs text-slate-500 dark:text-gray-500">{feed.time}</div>
                     </div>
                  </div>
                ))}
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
};

// End of Dashboard
