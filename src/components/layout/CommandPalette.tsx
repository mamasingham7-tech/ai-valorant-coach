"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { Search, X } from 'lucide-react';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPalette(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50">
      <div className="w-full max-w-lg glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 text-slate-400 w-full">
            <Search size={18} />
            <input 
              autoFocus
              type="text" 
              placeholder="Type a command or search..."
              className="bg-transparent border-0 outline-none text-white text-sm w-full placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={() => setCommandPalette(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 max-h-60 overflow-y-auto space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3">Navigation</span>
            <div className="mt-2 space-y-1">
              <button className="w-full text-left px-3 py-2 hover:bg-white/5 rounded text-sm text-slate-300 hover:text-white font-medium cursor-pointer">
                Go to Dashboard
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-white/5 rounded text-sm text-slate-300 hover:text-white font-medium cursor-pointer">
                Open Match Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
