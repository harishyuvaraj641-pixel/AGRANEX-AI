import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { VoiceFAB } from './components/layout/VoiceFAB';

// Pages
import { Dashboard } from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import SatelliteIntelligence from './pages/SatelliteIntelligence';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Marketplace from './pages/Marketplace';
import { WeatherIntelligence } from './pages/WeatherIntelligence';
import AgranexAssistant from './pages/AgranexAssistant';
import GovernmentSchemes from './pages/GovernmentSchemes';
import AdminPortal from './pages/AdminPortal';
import { LoginPage } from './pages/LoginPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { LogisticsDashboard } from './pages/LogisticsDashboard';
import { SharedTruckSystem } from './pages/SharedTruckSystem';
import { AgranexChat } from './pages/AgranexChat';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, darkMode, sidebarOpen } = useStore();
  const isLoginPage = location.pathname === '/login';

  // Global login route guard
  useEffect(() => {
    if (!user && !isLoginPage) {
      navigate('/login');
    }
  }, [user, isLoginPage, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('agranex_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-white flex overflow-hidden transition-colors duration-300">
      {!isLoginPage && <Sidebar />}
      
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${!isLoginPage && sidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'} transition-all duration-300 ease-in-out`}>
        {!isLoginPage && <TopBar />}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              className="p-6 w-full mx-auto"
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/digital-twin" element={<DigitalTwin />} />
                <Route path="/satellite" element={<SatelliteIntelligence />} />
                <Route path="/disease-ai" element={<DiseaseDetection />} />
                <Route path="/yield-predict" element={<YieldPrediction />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/weather" element={<WeatherIntelligence />} />
                <Route path="/agranex-ai" element={<AgranexAssistant />} />
                <Route path="/schemes" element={<GovernmentSchemes />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                <Route path="/logistics" element={<LogisticsDashboard />} />
                <Route path="/shared-truck" element={<SharedTruckSystem />} />
                <Route path="/chat" element={<AgranexChat />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {!isLoginPage && <VoiceFAB />}
    </div>
  );
}
