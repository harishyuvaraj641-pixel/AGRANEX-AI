import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Box,
  Satellite,
  Bug,
  TrendingUp,
  ShoppingCart,
  Cloud,
  Bot,
  FileText,
  Shield,
  ChevronDown,
  ChevronLeft,
  X,
  User as UserIcon,
  Truck,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/farmer-dashboard', label: 'Farmer Dashboard', icon: Box },
  { path: '/digital-twin', label: 'Digital Twin', icon: Box },
  { path: '/satellite', label: 'Satellite', icon: Satellite },
  { path: '/disease-ai', label: 'Disease AI', icon: Bug },
  { path: '/yield-predict', label: 'Yield Predict', icon: TrendingUp },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { path: '/logistics', label: 'Logistics Fleet', icon: Truck },
  { path: '/shared-truck', label: 'Shared Logistics', icon: Truck },
  { path: '/weather', label: 'Weather', icon: Cloud },
  { path: '/agranex-ai', label: 'Agranex AI', icon: Bot },
  { path: '/schemes', label: 'Schemes', icon: FileText },
  { path: '/chat', label: 'Chat Messages', icon: MessageSquare },
  { path: '/admin', label: 'Admin', icon: Shield },
];

const roles = ['Farmer', 'Buyer', 'Logistics', 'Agronomist', 'Admin'];

const roleMap: Record<string, UserRole> = {
  'Farmer': 'farmer',
  'Buyer': 'buyer',
  'Logistics': 'logistics',
  'Agronomist': 'agronomist',
  'Admin': 'admin'
};

const reverseRoleMap: Record<string, string> = {
  'farmer': 'Farmer',
  'buyer': 'Buyer',
  'logistics': 'Logistics',
  'agronomist': 'Agronomist',
  'admin': 'Admin'
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, user, currentRole, setRole, logout } = useStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const displayRole = reverseRoleMap[currentRole] || 'Farmer';

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === '/admin' && currentRole !== 'admin') return false;
    
    // Custom role-based filters
    if (currentRole === 'farmer') {
      const allowedFarmerPaths = [
        '/dashboard', '/farmer-dashboard', '/digital-twin', '/satellite',
        '/disease-ai', '/yield-predict', '/shared-truck', '/weather',
        '/agranex-ai', '/schemes'
      ];
      return allowedFarmerPaths.includes(item.path);
    }
    
    if (currentRole === 'buyer') {
      const allowedBuyerPaths = ['/marketplace', '/weather', '/chat'];
      return allowedBuyerPaths.includes(item.path);
    }
    
    if (currentRole === 'logistics') {
      const allowedLogisticsPaths = ['/logistics', '/shared-truck', '/chat'];
      return allowedLogisticsPaths.includes(item.path);
    }

    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full w-[280px] glass-card z-40 flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#080C14]/95 backdrop-blur-xl transition-colors duration-300"
          >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌱</span>
                <h1 className="text-2xl font-bold gradient-text bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent tracking-wide">
                  AGRANEX <span className="font-light">AI</span>
                </h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-5 h-5 hidden md:block" />
                <X className="w-5 h-5 md:hidden" />
              </button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-2" />

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'active bg-[rgba(16,185,129,0.15)] text-[#10B981] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 w-1 h-full bg-[#10B981] rounded-r-md shadow-[0_0_10px_#10B981]"
                      />
                    )}
                    <item.icon
                      className={`w-5 h-5 mr-4 transition-colors duration-300 ${
                        isActive ? 'text-[#10B981]' : 'text-slate-500 group-hover:text-slate-800 dark:text-gray-400 dark:group-hover:text-white'
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent my-2" />

          {/* User Profile Mini-card */}
          <div className="p-4">
            <div className="glass-card-hover rounded-2xl p-3 relative bg-slate-100/50 dark:bg-[rgba(15,23,42,0.45)] border border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10B981] to-[#3B82F6] p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#080C14] flex items-center justify-center overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-slate-500 dark:text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate w-24">
                      {user?.full_name || 'Guest User'}
                    </span>
                    <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full inline-block mt-1 w-max">
                      {displayRole}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-400 transition-transform duration-300 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Role Switcher Dropdown */}
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                  >
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          const newRole = roleMap[r];
                          setRole(newRole);
                          setRoleDropdownOpen(false);
                          
                          // Redirect based on the new role
                          if (newRole === 'farmer') {
                            navigate('/farmer-dashboard');
                          } else if (newRole === 'buyer') {
                            navigate('/marketplace');
                          } else if (newRole === 'logistics') {
                            navigate('/logistics');
                          } else if (newRole === 'admin') {
                            navigate('/admin');
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          displayRole === r
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="mt-3 w-full py-2.5 px-4 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout Session
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  );
};
