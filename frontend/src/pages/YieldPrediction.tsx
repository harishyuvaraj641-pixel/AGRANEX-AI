import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { TrendingUp, Calculator, CloudRain, ThermometerSun, TestTube, Leaf, ArrowRight, Zap, Target } from 'lucide-react';
import { predictYield } from '../services/api';

const radarData = [
  { subject: 'Soil pH', A: 85, fullMark: 100 },
  { subject: 'Rainfall', A: 90, fullMark: 100 },
  { subject: 'Nitrogen', A: 70, fullMark: 100 },
  { subject: 'Temperature', A: 95, fullMark: 100 },
  { subject: 'Sunlight', A: 80, fullMark: 100 },
];

const demandData = [
  { name: 'Jan', demand: 4000 },
  { name: 'Feb', demand: 3000 },
  { name: 'Mar', demand: 2000 },
  { name: 'Apr', demand: 2780 },
  { name: 'May', demand: 1890 },
  { name: 'Jun', demand: 2390 },
  { name: 'Jul', demand: 3490 },
  { name: 'Aug', demand: 5490 },
  { name: 'Sep', demand: 6490 },
  { name: 'Oct', demand: 8490 }, // Harvest month
  { name: 'Nov', demand: 7490 },
  { name: 'Dec', demand: 5490 },
];

// Simple Sun icon component
const Sun = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

export default function YieldPrediction() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);

  // Form State
  const [cropType, setCropType] = useState('Wheat');
  const [area, setArea] = useState(12.5);
  const [ph, setPh] = useState(6.8);
  const [rainfall, setRainfall] = useState(800);
  const [nitrogen, setNitrogen] = useState(140);

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const data = await predictYield({
        cropType,
        areaHectares: area,
        soilPh: ph,
        rainfallMm: rainfall,
        nitrogenPpm: nitrogen
      });
      setApiResult(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error predicting yield:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold flex justify-center items-center gap-3">
          <span className="gradient-text">AI Yield & Harvest Predictor</span> 📊
        </h1>
        <p className="text-slate-600 dark:text-gray-400">Multi-factor ML Model (XGBoost + Random Forest + LSTM)</p>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card max-w-4xl mx-auto p-8 rounded-3xl"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Target className="text-emerald-500"/> Simulation Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Crop Type</label>
                  <select 
                    value={cropType} onChange={(e) => setCropType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                  >
                    {['Wheat', 'Maize', 'Tomato', 'Cotton', 'Rice'].map(c => <option key={c} className="bg-white dark:bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Area (Hectares)</label>
                  <input 
                    type="number" value={area} onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-6 bg-slate-100/70 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="font-medium text-slate-600 dark:text-gray-400 flex items-center gap-1"><TestTube size={14}/> Soil pH</label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ph}</span>
                  </div>
                  <input type="range" min="4.0" max="9.0" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="font-medium text-slate-600 dark:text-gray-400 flex items-center gap-1"><CloudRain size={14}/> Rainfall (mm)</label>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{rainfall}</span>
                  </div>
                  <input type="range" min="200" max="1500" step="10" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="font-medium text-slate-600 dark:text-gray-400 flex items-center gap-1"><Leaf size={14}/> Nitrogen (ppm)</label>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{nitrogen}</span>
                  </div>
                  <input type="range" min="50" max="300" step="5" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="w-full accent-amber-500" />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePredict}
              disabled={isPredicting}
              className="w-full py-4 btn-primary text-lg font-bold flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <><div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Running Models...</>
              ) : (
                <><Calculator /> Predict Yield & Revenue</>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-100/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-gray-400">Showing predictions for: <strong className="text-slate-900 dark:text-white">{area} Ha of {cropType}</strong></span>
              <button onClick={() => setShowResults(false)} className="text-sm btn-secondary px-4 py-2">Edit Parameters</button>
            </div>

            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} /></div>
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-1">Predicted Yield</p>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {apiResult?.predictedYieldPerHectare?.toFixed(2) || '4.50'} <span className="text-lg text-emerald-700 dark:text-emerald-500">t/ha</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">↑ 12% vs regional avg</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-1">Total Harvest</p>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {apiResult?.totalYieldTonnes?.toFixed(2) || '56.25'} <span className="text-lg text-slate-500 dark:text-gray-500">tonnes</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">Based on {area} hectares</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-1">Expected Revenue</p>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  ₹{apiResult?.expectedRevenueInr?.toLocaleString() || '13,78,125'}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">Est. ₹24,500 per tonne</p>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-red-500/20">
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-1">Risk Score</p>
                <div className="text-3xl font-bold text-red-500 dark:text-red-400">
                  {apiResult?.riskScore || '12.5'}%
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">Weather & pest risk</p>
              </div>
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Yield Impact Simulator</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(148,163,184,0.2)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Impact" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl flex flex-col">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Harvest Timeline</h3>
                <div className="flex-1 flex flex-col justify-center px-4 relative">
                  <div className="absolute left-8 top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  
                  {[
                    { stage: 'Sowing', date: 'Jun 15', status: 'completed', icon: <Leaf size={16} /> },
                    { stage: 'Vegetative Growth', date: 'Jul - Aug', status: 'active', icon: <TrendingUp size={16} /> },
                    { stage: 'Flowering', date: 'Sep 05', status: 'pending', icon: <Sun size={16} /> },
                    { stage: 'Optimal Harvest', date: apiResult?.optimalHarvestDate || 'Oct 15 - 28', status: 'pending', icon: <Target size={16} /> },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-6 mb-8 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-[#080C14] ${
                        s.status === 'completed' ? 'bg-emerald-500 text-white' : 
                        s.status === 'active' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                        'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-gray-400'
                      }`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className={`font-bold ${s.status === 'active' ? 'text-blue-600 dark:text-blue-400' : s.status === 'completed' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>{s.stage}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-500">{s.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2"><TestTube size={18} className="text-purple-500 dark:text-purple-400" /> Fertilizer Recommendations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400">
                        <th className="pb-3 font-medium">Nutrient</th>
                        <th className="pb-3 font-medium">Required</th>
                        <th className="pb-3 font-medium">Current Status</th>
                        <th className="pb-3 font-medium text-right">Action Needed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-gray-300">
                      <tr>
                        <td className="py-4 font-medium text-slate-900 dark:text-white">Nitrogen (N)</td>
                        <td className="py-4">180 ppm</td>
                        <td className="py-4 text-amber-600 dark:text-amber-400">{nitrogen} ppm</td>
                        <td className="py-4 text-right">
                          <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-bold">
                            {apiResult?.fertilizerNeeds?.nitrogen || '+40 ppm'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 font-medium text-slate-900 dark:text-white">Phosphorus (P)</td>
                        <td className="py-4">60 ppm</td>
                        <td className="py-4 text-emerald-600 dark:text-emerald-400">65 ppm</td>
                        <td className="py-4 text-right">
                          <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-bold">
                            {apiResult?.fertilizerNeeds?.phosphorus || 'Optimal'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 font-medium text-slate-900 dark:text-white">Potassium (K)</td>
                        <td className="py-4">120 ppm</td>
                        <td className="py-4 text-emerald-600 dark:text-emerald-400">115 ppm</td>
                        <td className="py-4 text-right">
                          <span className="bg-emerald-500/20 text-[#10B981] px-2 py-1 rounded-md text-xs font-bold">
                            {apiResult?.fertilizerNeeds?.potassium || 'Optimal'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500 dark:text-emerald-400" /> Market Demand Forecast</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis hide />
                      <RechartsTooltip cursor={{ fill: 'rgba(148,163,184,0.1)' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                        {demandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Oct' ? '#10B981' : '#94A3B8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 4: Summary */}
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-emerald-600 dark:text-emerald-400">AI Yield Intelligence Summary</h3>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed">
                    Based on current soil conditions (pH {ph}, Nitrogen {nitrogen} ppm) and expected monsoon rainfall of {rainfall}mm, 
                    your {area} hectare {cropType} farm is projected to yield <strong className="text-slate-900 dark:text-white">{apiResult?.totalYieldTonnes || '56.25'} tonnes</strong> with 
                    estimated revenue of <strong className="text-slate-900 dark:text-white">₹{apiResult?.expectedRevenueInr?.toLocaleString() || '13,78,125'}</strong>. 
                    <strong className="text-emerald-600 dark:text-emerald-400"> Optimal harvest window: {apiResult?.optimalHarvestDate || 'October 15-28, 2026'}. </strong> 
                    Risk assessment: <strong className="text-emerald-600 dark:text-emerald-400">{(apiResult?.riskScore < 20 ? 'LOW' : apiResult?.riskScore < 45 ? 'MEDIUM' : 'HIGH')} ({apiResult?.riskScore || '12.5'}%)</strong>. 
                    Recommendation: {apiResult?.irrigationNeeds || 'Apply appropriate Nitrogen fertilizer before flowering stage to ensure maximum yield potential.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
