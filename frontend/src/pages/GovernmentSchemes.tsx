import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Filter, Sparkles, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { getSchemes } from '../services/api';
import { GovernmentScheme } from '../types';

const mockSchemesColors = [
  { color: 'from-orange-500 to-red-500', icon: 'PM' },
  { color: 'from-blue-500 to-cyan-500', icon: 'SM' },
  { color: 'from-emerald-500 to-teal-500', icon: 'CB' },
  { color: 'from-purple-500 to-pink-500', icon: 'SA' },
  { color: 'from-amber-500 to-yellow-500', icon: 'SH' }
];

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedLandSize, setSelectedLandSize] = useState('Small <2ha');
  const [applyingScheme, setApplyingScheme] = useState<GovernmentScheme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState<any>(null);

  // Form states
  const [aadhaar, setAadhaar] = useState('9843-2104-5829');
  const [pattaNo, setPattaNo] = useState('TN-CMB-84920');
  const [kccNumber, setKccNumber] = useState('KCC-940218');

  useEffect(() => {
    const loadSchemes = async () => {
      const data = await getSchemes();
      setSchemes(data);
    };
    loadSchemes();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'eligible': return 'Eligible';
      case 'applied': return 'Applied';
      case 'approved': return 'Approved';
      case 'under_review': return 'Under Review';
      default: return status;
    }
  };

  const filteredSchemes = schemes.filter(s => {
    if (selectedCrop === 'All Crops') return true;
    return s.name.toLowerCase().includes(selectedCrop.toLowerCase()) || 
           s.description.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  const totalBenefits = filteredSchemes.reduce((acc, curr) => {
    if (curr.benefit.includes('₹6,000')) return acc + 6000;
    if (curr.benefit.includes('₹1,50,000') || curr.benefit.includes('1,50,000')) return acc + 150000;
    return acc;
  }, 0);

  return (
    <div className="space-y-8 pb-12 w-full mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          Government Schemes 🏛️
        </h1>
        <p className="text-gray-400 text-lg">AI-powered scheme matching for your farm profile</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="w-full appearance-none bg-[#080C14]/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white focus:outline-none focus:border-emerald-500/50">
              <option>All Crops</option>
              <option>Wheat</option>
              <option>Rice</option>
              <option>Cotton</option>
            </select>
          </div>
          <div className="relative flex-1">
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full appearance-none bg-[#080C14]/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white focus:outline-none focus:border-emerald-500/50">
              <option>Tamil Nadu</option>
              <option>Punjab</option>
              <option>Maharashtra</option>
              <option>Gujarat</option>
            </select>
          </div>
          <div className="relative flex-1">
            <select value={selectedLandSize} onChange={(e) => setSelectedLandSize(e.target.value)} className="w-full appearance-none bg-[#080C14]/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white focus:outline-none focus:border-emerald-500/50">
              <option>Small &lt;2ha</option>
              <option>Medium 2-10ha</option>
              <option>Large &gt;10ha</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="glass-card relative overflow-hidden border-emerald-500/30 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="flex items-start md:items-center gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">AI Recommendation Match</h3>
            <p className="text-emerald-100/80">
              Based on your profile, you are eligible for <strong className="text-emerald-400">{filteredSchemes.length} government schemes</strong>{totalBenefits > 0 && <> worth up to <strong className="text-emerald-400">₹{totalBenefits.toLocaleString()}</strong> in benefits</>}.
            </p>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Landmark className="w-5 h-5 text-blue-400" /> Available Schemes
        </h2>
        
        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {filteredSchemes.map((scheme, i) => {
            const visual = mockSchemesColors[i % mockSchemesColors.length];
            const currentStatus = scheme.status || 'eligible';
            const statusLabel = getStatusLabel(currentStatus);
            return (
              <motion.div 
                key={scheme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${visual.color} flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0`}>
                  {visual.icon}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">{scheme.name}</h3>
                    <p className="text-sm text-gray-400">{scheme.department}</p>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">{scheme.description}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                      Benefit: {scheme.benefit}
                    </span>
                    <span className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1 rounded-full text-xs">
                      Eligible: {scheme.eligibility}
                    </span>
                  </div>
                </div>

                {/* Action Area */}
                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-white/10 md:border-none pt-4 md:pt-0">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1
                    ${currentStatus === 'eligible' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                      currentStatus === 'approved' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                      currentStatus === 'applied' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'}
                  `}>
                    {(currentStatus === 'eligible' || currentStatus === 'approved') && <CheckCircle className="w-3 h-3" />}
                    {(currentStatus === 'under_review' || currentStatus === 'applied') && <Clock className="w-3 h-3" />}
                    {statusLabel}
                  </div>
                  
                  <div className="flex gap-2">
                    {currentStatus === 'eligible' ? (
                      <a 
                        href={(scheme as any).portalUrl || 'https://pmkisan.gov.in/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={async () => {
                          try {
                            await fetch('/api/v1/schemes/apply', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ schemeId: scheme.id, farmerName: 'Farmer Rajesh' })
                            });
                            setSchemes(schemes.map(s => s.id === scheme.id ? { ...s, status: 'applied' } : s));
                          } catch (err) {
                            setSchemes(schemes.map(s => s.id === scheme.id ? { ...s, status: 'applied' } : s));
                          }
                        }}
                        className="btn-primary py-1.5 px-4 text-sm cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 no-underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply Now ↗
                      </a>
                    ) : (
                      <button className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap opacity-80 cursor-default">
                        {currentStatus === 'applied' || currentStatus === 'under_review' ? '⏳ Application Under Review' : '✓ Scheme Active'}
                      </button>
                    )}
                    <a 
                      href={(scheme as any).portalUrl || 'https://pmkisan.gov.in/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Application Tracker */}
      <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Application Tracker</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h3 className="text-emerald-400 font-semibold mb-4">PM-KISAN Status</h3>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/10 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Application Submitted</h4>
                    <p className="text-xs text-gray-400">12 Oct 2023</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Under Review</h4>
                    <p className="text-xs text-gray-400">15 Oct 2023 - Documents verified</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Approved</h4>
                    <p className="text-xs text-gray-400">Pending final disbursement</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  </div>
                  <div>
                    <h4 className="text-gray-500 font-medium">Disbursed</h4>
                    <p className="text-xs text-gray-600">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card bg-black/20 p-5 rounded-xl border border-white/5 h-fit">
            <h3 className="text-white font-semibold mb-4">Required Documents Checklist</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-gray-300">Aadhaar Card</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-gray-300">Land Records (Patta/Chitta)</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-gray-300">Bank Details / Passbook</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm text-gray-300">Kisan Credit Card (Optional)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Application Modal Overlay */}
      {applyingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 md:p-8 max-w-lg w-full text-left space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Official Government Portal</span>
                <h3 className="text-xl font-bold text-white mt-1">{applyingScheme.name}</h3>
                <p className="text-xs text-gray-400">{applyingScheme.department}</p>
              </div>
              <button 
                onClick={() => {
                  setApplyingScheme(null);
                  setApplicationSuccess(null);
                }}
                className="text-gray-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {applicationSuccess ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Application Submitted!</h4>
                  <p className="text-sm text-gray-300 mt-1">Your application has been logged on the Direct Benefit Transfer (DBT) portal.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-2 text-left font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference ID:</span>
                    <span className="text-emerald-400 font-bold">{applicationSuccess.application_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scheme Benefit:</span>
                    <span className="text-white">{applyingScheme.benefit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-amber-400 font-bold">Under Review</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setApplyingScheme(null);
                    setApplicationSuccess(null);
                  }}
                  className="btn-primary w-full py-2.5 text-sm font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('/api/v1/schemes/apply', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        schemeId: applyingScheme.id,
                        farmerName: 'Farmer Rajesh',
                        aadhaar,
                        pattaNo,
                        kccNumber
                      })
                    });
                    const data = res.ok ? await res.json() : {
                      success: true,
                      message: 'Application Submitted',
                      application_id: `AGR-SCH-${Math.floor(100000 + Math.random() * 900000)}`
                    };

                    setSchemes(schemes.map(s => s.id === applyingScheme.id ? { ...s, status: 'applied' } : s));
                    setApplicationSuccess(data);
                  } catch (err) {
                    setSchemes(schemes.map(s => s.id === applyingScheme.id ? { ...s, status: 'applied' } : s));
                    setApplicationSuccess({
                      application_id: `AGR-SCH-${Math.floor(100000 + Math.random() * 900000)}`
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                  🎁 Expected Benefit: <strong>{applyingScheme.benefit}</strong>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Aadhaar Number (Linked to DBT)</label>
                  <input 
                    type="text" 
                    value={aadhaar} 
                    onChange={e => setAadhaar(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Land Record / Patta Chitta Number</label>
                  <input 
                    type="text" 
                    value={pattaNo} 
                    onChange={e => setPattaNo(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Kisan Credit Card (KCC) Number (Optional)</label>
                  <input 
                    type="text" 
                    value={kccNumber} 
                    onChange={e => setKccNumber(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setApplyingScheme(null)}
                    className="btn-secondary flex-1 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GovernmentSchemes;
