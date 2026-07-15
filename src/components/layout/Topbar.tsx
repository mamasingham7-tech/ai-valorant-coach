"use client";

import React from 'react';
import { useStore } from '@/store';
import { Search, Bell } from 'lucide-react';

export default function Topbar() {
  const { setCommandPalette } = useStore();

  return (
    <header className="glass-panel border-b border-white/5 h-16 sticky top-0 px-8 flex items-center justify-between z-30">
      {/* Search Input Trigger */}
      <button 
        onClick={() => setCommandPalette(true)}
        className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-slate-400 hover:text-white transition-all text-xs w-64 justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search size={14} />
          <span>Quick search...</span>
        </div>
        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+K</kbd>
      </button>

      {/* Profile & Notifications Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
          <div className="flex flex-col text-right justify-center">
            <span className="text-xs font-bold text-white">Darshit Gupta</span>
          </div>
          <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-bold text-white text-xs hover:border-primary cursor-pointer transition-all">
            DG
          </div>
        </div>
      </div>
    </header>
  );
}
