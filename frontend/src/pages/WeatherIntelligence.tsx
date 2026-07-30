import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind, Droplets, Thermometer, CloudLightning, Activity, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const weatherChartData = [
  { day: '1', temp: 28, rain: 5 }, { day: '5', temp: 30, rain: 2 }, { day: '10', temp: 32, rain: 0 },
  { day: '15', temp: 31, rain: 15 }, { day: '20', temp: 29, rain: 40 }, { day: '25', temp: 27, rain: 25 },
  { day: '30', temp: 28, rain: 10 }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

export const WeatherIntelligence: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Weather Intelligence</h1>
          <p className="text-slate-600 dark:text-gray-400">Hyper-local agrometeorological insights for your farm.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center glass-card px-4 py-2 rounded-full">
           <MapPin className="w-4 h-4 text-[#10B981] mr-2" />
           <span className="text-sm font-medium text-slate-800 dark:text-white">Coimbatore, Tamil Nadu</span>
        </div>
      </div>

      {/* Hero Current Weather */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 glass-card bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-sky-500/10 dark:from-[rgba(15,23,42,0.8)] dark:via-[rgba(30,58,138,0.4)] dark:to-[rgba(15,23,42,0.8)] border border-slate-200 dark:border-white/10">
         <div className="absolute top-0 right-0 p-10 opacity-20 transform translate-x-1/4 -translate-y-1/4">
           <CloudLightning className="w-64 h-64 text-blue-500 dark:text-blue-400 drop-shadow-[0_0_50px_rgba(96,165,250,0.8)]" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end">
            <div className="flex items-center gap-8">
               <div className="bg-white/80 dark:bg-black/30 p-6 rounded-3xl backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-md">
                 <CloudRain className="w-24 h-24 text-blue-500 dark:text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
               </div>
               <div>
                 <p className="text-xl text-blue-600 dark:text-blue-300 font-medium mb-2">Heavy Thunderstorms</p>
                 <div className="text-8xl font-bold tracking-tighter drop-shadow-sm flex items-start text-slate-900 dark:text-white">
                   26<span className="text-4xl text-slate-500 dark:text-gray-400 font-light mt-3 ml-1">°C</span>
                 </div>
                 <p className="text-slate-600 dark:text-gray-400 mt-2 flex items-center">
                   <Thermometer className="w-4 h-4 mr-1 text-red-500 dark:text-red-400" /> High: 31° • Low: 24°
                 </p>
               </div>
            </div>
            
            <div className="mt-8 md:mt-0 bg-white/80 dark:bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-slate-200/80 dark:border-white/10 w-full md:w-auto shadow-md">
               <div className="text-sm text-slate-600 dark:text-gray-300 mb-2">Precipitation Chance</div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">85% <span className="text-sm font-normal text-slate-500 dark:text-gray-400 ml-1">in next 2 hrs</span></div>
               <div className="w-full bg-slate-200 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                 <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
               </div>
            </div>
         </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Humidity', value: '82%', icon: Droplets, color: 'text-blue-500 dark:text-blue-400' },
          { label: 'Wind Speed', value: '18 km/h', icon: Wind, color: 'text-slate-600 dark:text-gray-300' },
          { label: 'UV Index', value: 'Moderate (4)', icon: Sun, color: 'text-amber-500 dark:text-amber-400' },
          { label: 'Rainfall', value: '12 mm', icon: CloudRain, color: 'text-blue-600 dark:text-blue-500' },
          { label: 'Feels Like', value: '29°C', icon: Thermometer, color: 'text-red-500 dark:text-red-400' }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-500/40 transition-colors">
             <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
             <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">{stat.label}</div>
             <div className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Hourly Forecast */}
            <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center"><Activity className="w-5 h-5 mr-2 text-[#10B981]" /> Hourly Forecast</h3>
               <div className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar">
                 {Array.from({length: 12}).map((_, i) => (
                   <div key={i} className="flex flex-col items-center min-w-[60px] p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-all">
                      <span className="text-sm text-slate-500 dark:text-gray-400 mb-3">{i === 0 ? 'Now' : `${(i + 14) % 24}:00`}</span>
                      {i % 3 === 0 ? <CloudRain className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-3" /> : (i % 2 === 0 ? <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400 mb-3" /> : <CloudLightning className="w-6 h-6 text-slate-400 dark:text-gray-400 mb-3" />)}
                      <span className="text-lg font-semibold text-slate-800 dark:text-white">{26 + (i%3)}°</span>
                   </div>
                 ))}
               </div>
            </motion.div>

            {/* Weather Chart */}
            <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">30-Day Temp & Rainfall Trends</h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={weatherChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                     <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis yAxisId="left" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} orientation="left" />
                     <YAxis yAxisId="right" stroke="#3B82F6" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                     <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                     <Legend wrapperStyle={{ paddingTop: '10px' }} />
                     <Bar yAxisId="right" dataKey="rain" name="Rainfall (mm)" fill="#3B82F6" opacity={0.6} radius={[4,4,0,0]} barSize={20} />
                     <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} />
                   </ComposedChart>
                 </ResponsiveContainer>
               </div>
            </motion.div>
         </div>

         <div className="space-y-8">
            {/* AI Irrigation Recommendation */}
            <motion.div variants={itemVariants} className="glass-card bg-emerald-500/10 border border-[#10B981]/30 p-6 rounded-2xl shadow-md relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-6xl opacity-10">💧</div>
               <h3 className="text-[#10B981] font-semibold flex items-center mb-4"><Activity className="w-5 h-5 mr-2" /> AI Action Plan</h3>
               <p className="text-slate-900 dark:text-white text-lg font-medium leading-tight mb-4">
                 Based on current moisture (18.5%) and forecast, irrigate Plot B by 4:00 PM today.
               </p>
               <div className="bg-white/80 dark:bg-black/30 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-gray-400">Method</span><span className="text-sm font-medium text-slate-800 dark:text-white">Drip</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-gray-400">Volume</span><span className="text-sm font-medium text-blue-600 dark:text-blue-400">12,000 L</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-gray-400">Duration</span><span className="text-sm font-medium text-slate-800 dark:text-white">45 mins</span></div>
               </div>
               <button className="w-full mt-4 btn-primary py-3 rounded-xl font-medium transition-colors flex items-center justify-center">
                 Execute Plan <ArrowRight className="w-4 h-4 ml-2" />
               </button>
            </motion.div>

            {/* 7-Day Forecast (Vertical) */}
            <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">7-Day Forecast</h3>
               <div className="space-y-5">
                 {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                   <div key={day} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-medium w-16 text-slate-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">{day}</span>
                      <div className="flex items-center w-16">
                         {i < 2 ? <CloudRain className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" /> : (i % 3 === 0 ? <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-2" /> : <CloudLightning className="w-5 h-5 text-slate-400 dark:text-gray-400 mr-2" />)}
                         <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">{i < 3 ? '80%' : '10%'}</span>
                      </div>
                      <div className="flex items-center flex-1 justify-end space-x-3">
                         <span className="text-sm text-slate-500 dark:text-gray-400 w-6 text-right">{23 + i}°</span>
                         <div className="w-24 h-1.5 bg-slate-200 dark:bg-black/30 rounded-full overflow-hidden flex">
                            <div className="h-full bg-transparent w-1/4"></div>
                            <div className="h-full bg-gradient-to-r from-blue-400 via-amber-400 to-red-400 w-1/2 rounded-full"></div>
                         </div>
                         <span className="text-sm font-medium text-slate-800 dark:text-white w-6">{31 - (i%3)}°</span>
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>

            {/* Alerts Section */}
            <motion.div variants={itemVariants} className="glass-card bg-red-500/10 border border-red-500/30 p-5 rounded-2xl">
               <h3 className="text-red-500 dark:text-red-400 font-semibold flex items-center mb-3"><AlertTriangle className="w-5 h-5 mr-2" /> Regional Alerts</h3>
               <div className="space-y-3">
                  <div className="bg-white/80 dark:bg-black/20 p-3 rounded-lg border border-red-500/20">
                    <p className="text-sm text-slate-900 dark:text-white font-medium">Moderate Flood Risk</p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Noyyal river basin approaching warning levels.</p>
                  </div>
                  <div className="bg-white/80 dark:bg-black/20 p-3 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Heat Stress (Low)</p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Temperatures dropping, risk subsiding.</p>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
};
