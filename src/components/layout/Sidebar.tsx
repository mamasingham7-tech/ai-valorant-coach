"use client";

import React from 'react';
import { useStore } from '@/store';
import { useSettings } from '@/lib/settings/SettingsContext';
import { 
  LayoutDashboard, 
  Sword, 
  Cpu, 
  Tv, 
  Award, 
  ShoppingBag, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function Sidebar() {
  const { sidebarOpen, activeTab, toggleSidebar, setSidebarOpen, setActiveTab } = useStore();
  const { preferences } = useSettings();

  React.useEffect(() => {
    if (preferences?.appearance?.sidebarCollapsed) {
      setSidebarOpen(false);
    }
  }, [preferences?.appearance?.sidebarCollapsed, setSidebarOpen]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'match', name: 'Match Analysis', icon: Sword },
    { id: 'twin', name: 'Digital Twin', icon: Cpu },
    { id: 'live', name: 'Live Overlay', icon: Tv },
    { id: 'training', name: 'Training Center', icon: Award },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag },
  ];


  return (
    <div 
      className={`glass-panel border-r border-white/5 h-screen sticky top-0 transition-all duration-300 flex flex-col z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header Logo */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white text-lg tracking-wider">
              V
            </div>
            <span className="font-extrabold text-sm tracking-widest text-white">AI COACH</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white text-lg mx-auto">
            V
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
