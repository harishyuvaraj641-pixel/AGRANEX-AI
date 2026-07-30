import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronDown, Smartphone } from 'lucide-react';
import { useStore } from '../store/useStore';
import { login } from '../services/api';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setRole } = useStore();
  const [selectedRoleType, setSelectedRoleType] = useState<'farmer' | 'buyer' | 'logistics' | 'other'>('farmer');
  const [email, setEmail] = useState('farmer.rajesh@agranex.ai');
  const [password, setPassword] = useState('demo123');
  const [role, setLocalRole] = useState('Farmer');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['Farmer', 'Buyer', 'Logistics', 'Agronomist', 'Researcher', 'Government Officer', 'Admin'];

  const roleMap: Record<string, UserRole> = {
    'Farmer': 'farmer',
    'Buyer': 'buyer',
    'Logistics': 'logistics',
    'Agronomist': 'agronomist',
    'Researcher': 'researcher',
    'Government Officer': 'government_officer',
    'Admin': 'admin'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const selectedRole = roleMap[role];
      const result = await login(email, password, selectedRole);
      
      if (result && result.success) {
        localStorage.setItem('agranex_token', result.token);
        setUser(result.user);
        setRole(result.user.role);
        
        const userRole = result.user.role;
        if (userRole === 'farmer') {
          navigate('/farmer-dashboard');
        } else if (userRole === 'buyer') {
          navigate('/marketplace');
        } else if (userRole === 'logistics') {
          navigate('/logistics');
        } else if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result?.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      {/* Background Animated Elements for left panel area */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#10B981] rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[20%] left-[30%] w-80 h-80 bg-[#3B82F6] rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-[#8B5CF6] rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Left Panel: Hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🌱</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
              AGRANEX AI
            </h1>
          </div>
          <h2 className="text-4xl font-semibold mb-6 leading-tight text-slate-900 dark:text-white">
            AI-Powered Smart Farming <br />
            <span className="text-slate-500 dark:text-gray-400">for the Future</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-md leading-relaxed">
            Harness the power of artificial intelligence, satellite imagery, and predictive analytics to revolutionize your agricultural yields and profitability.
          </p>
        </motion.div>
        
        {/* Floating Icons Animation */}
        <div className="absolute right-[10%] top-[30%] text-4xl animate-bounce" style={{ animationDuration: '3s' }}>🌾</div>
        <div className="absolute left-[20%] bottom-[25%] text-4xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🚜</div>
        <div className="absolute right-[25%] bottom-[15%] text-4xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>📊</div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md p-10 glass-card bg-white/85 dark:bg-[rgba(15,23,42,0.6)] backdrop-blur-2xl border border-slate-200 dark:border-[rgba(255,255,255,0.1)] shadow-2xl rounded-3xl"
        >
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm">Sign in to access your digital farm</p>
          </div>

          {/* Role selector tabs */}
          <div className="flex bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl mb-6 border border-slate-200 dark:border-white/5 relative z-10">
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('farmer');
                setLocalRole('Farmer');
                setEmail('farmer.rajesh@agranex.ai');
                setPassword('demo123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'farmer'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('buyer');
                setLocalRole('Buyer');
                setEmail('buyer.ananya@agranex.ai');
                setPassword('demo123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'buyer'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              🛒 Buyer
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('logistics');
                setLocalRole('Logistics');
                setEmail('logistics.saravanan@agranex.ai');
                setPassword('demo123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'logistics'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              🚛 Logistics
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('other');
                setLocalRole('Admin');
                setEmail('admin@agranex.ai');
                setPassword('demo123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'other'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              ⚙️ Other
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100/80 dark:bg-[rgba(0,0,0,0.2)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                placeholder="Email address"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 dark:text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100/80 dark:bg-[rgba(0,0,0,0.2)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                placeholder="Password"
              />
            </div>

            {/* Role Selector Dropdown (only visible when 'Other' tab is selected) */}
            {selectedRoleType === 'other' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-4 py-3 bg-slate-100/80 dark:bg-[rgba(0,0,0,0.2)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl text-left text-slate-900 dark:text-white flex items-center justify-between focus:outline-none focus:border-[#10B981] cursor-pointer"
                >
                  <span className={role ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-500'}>
                    {role || 'Select Role'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showRoleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-20 text-slate-800 dark:text-white"
                  >
                    {['Agronomist', 'Researcher', 'Government Officer', 'Admin'].map((r) => (
                      <div
                        key={r}
                        onClick={() => { 
                          setLocalRole(r); 
                          setShowRoleDropdown(false);
                          if (r === 'Admin') setEmail('admin@agranex.ai');
                          else if (r === 'Agronomist') setEmail('dr.swaminathan@agranex.ai');
                          else setEmail(`${r.toLowerCase().replace(' ', '')}@agranex.ai`);
                        }}
                        className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-[rgba(16,185,129,0.15)] hover:text-[#10B981] cursor-pointer transition-colors text-sm"
                      >
                        {r}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 btn-primary bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-slate-200 dark:border-[rgba(255,255,255,0.08)]"></div>
            <span className="px-4 text-sm text-slate-500 dark:text-gray-500">Or continue with</span>
            <div className="flex-1 border-t border-slate-200 dark:border-[rgba(255,255,255,0.08)]"></div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-3 py-3 glass-card bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.05)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-slate-800 dark:text-white">Google</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-3 py-3 glass-card bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.05)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl transition-colors text-slate-800 dark:text-white">
              <Smartphone className="w-5 h-5 text-slate-500 dark:text-gray-300" />
              <span className="text-sm font-medium">Phone OTP</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-[#10B981] hover:text-[#34d399] transition-colors hover:underline">
              New to Agranex? Create Account
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
