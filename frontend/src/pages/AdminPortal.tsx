import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Users, LayoutDashboard, BrainCircuit, Store, 
  Activity, Shield, Lock, AlertTriangle, CheckCircle, Server, HardDrive, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { getAuditLogs } from '../services/api';

const mockUserGrowthData = [
  { name: 'Jan', users: 1200 },
  { name: 'Feb', users: 1350 },
  { name: 'Mar', users: 1500 },
  { name: 'Apr', users: 1800 },
  { name: 'May', users: 2100 },
  { name: 'Jun', users: 2200 },
  { name: 'Jul', users: 2400 },
  { name: 'Aug', users: 2550 },
  { name: 'Sep', users: 2600 },
  { name: 'Oct', users: 2750 },
  { name: 'Nov', users: 2800 },
  { name: 'Dec', users: 2847 },
];

const mockModelUsage = [
  { name: 'Disease Detection', value: 45 },
  { name: 'Yield Prediction', value: 30 },
  { name: 'Nova Chat', value: 20 },
  { name: 'Satellite Data', value: 5 },
];

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

const mockAuditLogs = [
  { id: 1, time: '10:45 AM', action: 'LOGIN_SUCCESS', user: 'admin@agranex.in', ip: '192.168.1.105', status: 'success' },
  { id: 2, time: '10:42 AM', action: 'DISEASE_SCAN', user: 'farmer_raj@test.in', ip: '117.204.x.x', status: 'info' },
  { id: 3, time: '10:30 AM', action: 'LISTING_CREATED', user: 'suresh_p@test.in', ip: '103.11.x.x', status: 'success' },
  { id: 4, time: '10:15 AM', action: 'FAILED_LOGIN', user: 'unknown', ip: '45.22.1.1', status: 'error' },
  { id: 5, time: '09:50 AM', action: 'MODEL_RETRAIN', user: 'system', ip: 'localhost', status: 'warning' },
  { id: 6, time: '09:45 AM', action: 'PAYMENT_PROCESSED', user: 'venkatesh@test.in', ip: '112.19.x.x', status: 'success' },
  { id: 7, time: '09:20 AM', action: 'USER_BANNED', user: 'mod_1@agranex.in', ip: '192.168.1.102', status: 'warning' },
  { id: 8, time: '08:00 AM', action: 'SYSTEM_BACKUP', user: 'system', ip: 'localhost', status: 'info' },
];

const mockUsersList = [
  { id: 1, name: 'Admin One', email: 'admin@agranex.in', role: 'ADMIN', status: 'Active', joined: '2023-01-15' },
  { id: 2, name: 'Rajesh K', email: 'farmer_raj@test.in', role: 'FARMER', status: 'Active', joined: '2023-03-22' },
  { id: 3, name: 'Suresh Patil', email: 'suresh_p@test.in', role: 'BUYER', status: 'Active', joined: '2023-04-10' },
  { id: 4, name: 'AgriCorp Ltd', email: 'contact@agricorp.in', role: 'ENTERPRISE', status: 'Active', joined: '2023-06-05' },
  { id: 5, name: 'Spam User', email: 'spam123@test.in', role: 'FARMER', status: 'Banned', joined: '2023-11-20' },
];

const AdminPortal = () => {
  const { currentRole } = useStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [auditLogs, setAuditLogs] = useState<any[]>(mockAuditLogs);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      const data = await getAuditLogs();
      setAuditLogs(data);
    };
    loadLogs();
  }, []);

  if (currentRole !== 'admin') {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md w-full border-red-500/30">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">You do not have the required administrator privileges to view this portal.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'AI Models', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'Security', icon: <Lock className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 pb-12 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            Admin Control Center 🛡️
          </h1>
          <p className="text-gray-400 text-sm mt-1">Platform management and analytics</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.id}
          </button>
        ))}
      </div>

      {/* Tab Content - OVERVIEW */}
      {activeTab === 'Overview' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-xl border-l-2 border-l-blue-500">
              <p className="text-xs text-gray-400 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-white">2,847</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.3%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-2 border-l-emerald-500">
              <p className="text-xs text-gray-400 mb-1">Active Farms</p>
              <h3 className="text-2xl font-bold text-white">1,234</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5.2%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-2 border-l-purple-500">
              <p className="text-xs text-gray-400 mb-1">AI Scans Today</p>
              <h3 className="text-2xl font-bold text-white">456</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18.4%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-2 border-l-amber-500">
              <p className="text-xs text-gray-400 mb-1">Market Volume</p>
              <h3 className="text-2xl font-bold text-white">₹12.4L</h3>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-2 border-l-cyan-500">
              <p className="text-xs text-gray-400 mb-1">System Uptime</p>
              <h3 className="text-2xl font-bold text-white">99.97%</h3>
              <p className="text-xs text-emerald-400 mt-1">All systems operational</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">User Growth (12 Months)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockUserGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#080C14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">AI Model Usage</h3>
              <div className="h-64 flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockModelUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {mockModelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#080C14', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="text-xs text-gray-400">Total Req</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {mockModelUsage.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs & Health Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Recent Audit Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-lg">Action</th>
                      <th className="px-4 py-3 font-medium">User / IP</th>
                      <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => {
                      const logId = log.id || log.timestamp || `audit-${index}`;
                      const logAction = log.action || 'ACTION';
                      const logStatus = log.status || (
                        logAction.includes('SUCCESS') || logAction.includes('COMPLETE') ? 'success' :
                        logAction.includes('FAIL') || logAction.includes('ERROR') ? 'error' :
                        logAction.includes('RETRAIN') || logAction.includes('TRIGGER') || logAction.includes('WARNING') ? 'warning' :
                        'info'
                      );
                      const logTime = log.time || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM');
                      
                      return (
                        <tr key={logId} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide
                              ${logStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                logStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                                logStatus === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'}
                            `}>
                              {logAction}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            <div className="font-medium truncate max-w-[150px]">{log.user || 'system'}</div>
                            <div className="text-[10px] text-gray-500">{log.ip || 'localhost'}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 text-xs">
                            {logTime}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" /> System Health
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">API Response Time</span>
                    <span className="text-emerald-400">142ms</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Database Load</span>
                    <span className="text-emerald-400">23%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">AI Model Latency</span>
                    <span className="text-amber-400">1.2s</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 flex items-center gap-1"><HardDrive className="w-3 h-3" /> Storage Used</span>
                    <span className="text-blue-400">45.2 GB / 100 GB</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45.2%' }}></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between border border-white/10">
                  <span className="text-sm text-gray-300">Active WebSocket Connections</span>
                  <span className="text-lg font-bold text-white">234</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content - USERS */}
      {activeTab === 'Users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">User Management</h3>
            <input 
              type="text" 
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search users..." 
              className="bg-[#080C14]/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsersList.filter(u => 
                  u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                  u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
                ).map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-4 font-medium text-white">{user.name}</td>
                    <td className="px-4 py-4 text-gray-300">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 'ENTERPRISE' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-emerald-500/20 text-emerald-400'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className="text-gray-300">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{user.joined}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 mr-3 text-xs font-semibold">Edit</button>
                      {user.status === 'Active' ? (
                        <button className="text-red-400 hover:text-red-300 text-xs font-semibold">Ban</button>
                      ) : (
                        <button className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold">Unban</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab Content - SECURITY */}
      {activeTab === 'Security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-xl border-l-2 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">24h</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">142</h3>
              <p className="text-xs text-gray-400">Failed Logins</p>
            </div>
            
            <div className="glass-card p-5 rounded-xl border-l-2 border-l-orange-500">
              <div className="flex justify-between items-start mb-2">
                <Lock className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">12</h3>
              <p className="text-xs text-gray-400">Blocked IPs</p>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-2 border-l-amber-500">
              <div className="flex justify-between items-start mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">24h</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">84</h3>
              <p className="text-xs text-gray-400">Rate Limit Hits</p>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-2 border-l-emerald-500">
              <div className="flex justify-between items-start mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Status</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">AES-256</h3>
              <p className="text-xs text-gray-400 mt-1">DB Encryption Active</p>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">RLS Policy Violations</h3>
            <p className="text-gray-400 text-sm mb-6">Recent attempts to access restricted rows via API.</p>
            <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-white font-medium">No violations detected</h4>
              <p className="text-xs text-gray-500 mt-1">Row Level Security is functioning correctly.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Placeholders for AI Models Tab */}
      {activeTab === 'AI Models' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center rounded-2xl">
          <BrainCircuit className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">AI Model Management</h2>
          <p className="text-gray-400">View model versions, trigger retraining, and monitor inference accuracy.</p>
          <button className="mt-6 btn-primary">Go to Vertex AI Console</button>
        </motion.div>
      )}

    </div>
  );
};

export default AdminPortal;
