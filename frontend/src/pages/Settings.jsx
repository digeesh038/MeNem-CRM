import { useState, useEffect, useCallback } from 'react';
import { User, Info, Server, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import { INITIAL_USER } from '../constants/user';

// API base URL — same one used by customerApi.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Settings / About page — shows admin profile, system status, and tech info
export default function Settings() {
  // 'checking' | 'online' | 'offline'
  const [apiStatus, setApiStatus] = useState('checking');

  // Ping the backend's /health endpoint to see if it's reachable
  const checkHealth = useCallback(async () => {
    try {
      await axios.get(`${API_URL}/health`);
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    }
  }, []);

  // Check health once when the Settings page first loads
  useEffect(() => { checkHealth(); }, [checkHealth]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-[#c3c6d6]/20 pb-4">
        <h2 className="text-2xl font-bold text-[#003d9b]">About This Application</h2>
        <p className="text-sm text-[#737685] mt-1">Project details, tech stack, and system status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Admin Profile — values pulled from constants/user.js */}
        <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#edeef0] pb-3">
            <User className="h-4 w-4 text-[#003d9b]" />
            <h3 className="font-bold text-sm text-[#191c1e]">Admin Profile</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#737685] font-medium">Name</span>
              <span className="text-[#191c1e] font-bold">{INITIAL_USER.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737685] font-medium">Email</span>
              <span className="text-[#191c1e] font-bold">{INITIAL_USER.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737685] font-medium">Role</span>
              <span className="text-[#191c1e] font-bold">CRM Administrator</span>
            </div>
          </div>
        </div>

        {/* System Status — live API health check */}
        <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#edeef0] pb-3">
            <Server className="h-4 w-4 text-[#003d9b]" />
            <h3 className="font-bold text-sm text-[#191c1e]">System Status</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#737685] font-medium">Backend API</span>
              <span className={`flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full ${
                apiStatus === 'online' ? 'bg-green-50 text-green-700' :
                apiStatus === 'offline' ? 'bg-red-50 text-red-700' :
                'bg-yellow-50 text-yellow-700'
              }`}>
                {apiStatus === 'online' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737685] font-medium">Database</span>
              <span className="text-[#191c1e] font-bold">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737685] font-medium">API Base URL</span>
              <span className="text-[#191c1e] font-mono text-xs">{API_URL}</span>
            </div>
          </div>
        </div>

        {/* Project Info — static cards listing tech stack details */}
        <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-[#edeef0] pb-3">
            <Info className="h-4 w-4 text-[#003d9b]" />
            <h3 className="font-bold text-sm text-[#191c1e]">Project Information</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              ['Project', 'MeNem CRM'],
              ['Type', 'MERN Stack CRM'],
              ['Frontend', 'React 19 + Vite + Tailwind CSS'],
              ['Backend', 'Node.js + Express.js'],
              ['Database', 'MongoDB + Mongoose'],
              ['API Style', 'RESTful API'],
              ['Deployment', 'Vercel'],
              ['Version', 'v1.0.0'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#f8f9fb] rounded-lg p-3 border border-[#c3c6d6]/30">
                <p className="text-[10px] font-bold text-[#737685] uppercase tracking-wide">{label}</p>
                <p className="text-xs font-bold text-[#191c1e] mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
