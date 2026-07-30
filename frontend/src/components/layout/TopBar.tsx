import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Bug, Cloud, TrendingUp, FileText,
  Info as InfoIcon, CheckCircle, AlertTriangle, User as UserIcon,
  Sun, Moon, Menu
} from 'lucide-react';
import { useStore, nvidiaNimModels, NvidiaModel } from '../../store/useStore';
import { getNotifications } from '../../services/api';

const languages = [
  { code: 'en', label: 'EN 🇬🇧' },
  { code: 'ta', label: 'தமிழ் 🇮🇳' },
  { code: 'hi', label: 'हिंदी 🇮🇳' },
];

const getNotificationUIProps = (type: string) => {
  switch (type) {
    case 'alert':
    case 'disease':
      return { icon: Bug, color: 'text-red-400', bg: 'bg-red-400/10' };
    case 'warning':
    case 'weather':
      return { icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 'info':
    case 'market':
      return { icon: TrendingUp, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'success':
      return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    default:
      return { icon: InfoIcon, color: 'text-purple-400', bg: 'bg-purple-400/10' };
  }
};

const formatNotifTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { notifications, setNotifications, markAllRead, user, darkMode, toggleDarkMode, toggleSidebar, selectedNvidiaModel, setSelectedNvidiaModel } = useStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showNvidiaModels, setShowNvidiaModels] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await getNotifications();
      setNotifications(data);
    };
    fetchNotifs();
    // Poll notifications every 10s
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/mark-read', { method: 'POST' });
    } catch (e) {}
    markAllRead();
  };

  const getPageTitle = (path: string) => {
    const route = path.split('/')[1];
    if (!route) return 'Dashboard';
    return route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6 border-b border-slate-200 dark:border-[rgba(255,255,255,0.08)] bg-white/90 dark:bg-[#080C14]/90 backdrop-blur-md shadow-sm transition-colors duration-300">
      {/* Left: Menu Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 items-center justify-center max-w-xl mx-8">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search plots, tasks, or insights..."
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-[rgba(255,255,255,0.1)] rounded-full bg-slate-100 dark:bg-[rgba(15,23,42,0.6)] text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* NVIDIA NIM Model Selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowNvidiaModels(!showNvidiaModels)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
            title="Select NVIDIA NIM AI Model"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NVIDIA: {nvidiaNimModels.find((m: NvidiaModel) => m.id === selectedNvidiaModel)?.name.split(' ')[0] || 'Llama 3.1'}</span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-700 dark:text-emerald-300 font-mono">
              {nvidiaNimModels.find((m: NvidiaModel) => m.id === selectedNvidiaModel)?.badge}
            </span>
          </button>

          <AnimatePresence>
            {showNvidiaModels && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 z-50 text-slate-800 dark:text-white"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 font-bold text-xs text-slate-500 dark:text-gray-400 flex items-center justify-between">
                  <span>NVIDIA NIM Models</span>
                  <span className="text-[10px] text-emerald-500 font-mono">API Active</span>
                </div>
                {nvidiaNimModels.map((m: NvidiaModel) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedNvidiaModel(m.id);
                      setShowNvidiaModels(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedNvidiaModel === m.id
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400 font-mono">{m.badge}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full glass-card-hover hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors group"
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-500 dark:text-indigo-400 group-hover:text-slate-700 dark:group-hover:text-indigo-600" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguage(!showLanguage)}
            className="flex items-center justify-center px-3 py-1.5 rounded-full glass-card-hover border border-slate-200 dark:border-[rgba(255,255,255,0.05)] text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            {currentLang.label}
          </button>
          
          <AnimatePresence>
            {showLanguage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden py-1 z-50"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setCurrentLang(lang); setShowLanguage(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      currentLang.code === lang.code ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full glass-card-hover hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors group"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-gray-300 group-hover:text-slate-800 dark:group-hover:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-slate-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-150 dark:border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-xs text-[#10B981] hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.map((notif) => {
                    const ui = getNotificationUIProps(notif.type);
                    return (
                      <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.02)] hover:bg-slate-50 dark:hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors flex gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg ${ui.bg} ${ui.color} flex-shrink-0 h-min`}>
                          <ui.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-gray-200">{notif.title}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">{formatNotifTime(notif.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 text-center border-t border-slate-150 dark:border-[rgba(255,255,255,0.05)]">
                  <button className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#8B5CF6] p-[2px] cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-shadow duration-300">
          <div className="w-full h-full rounded-full bg-[#080C14] flex items-center justify-center overflow-hidden">
             {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-300" />
              )}
          </div>
        </div>
      </div>
    </header>
  );
};
