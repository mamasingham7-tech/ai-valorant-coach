"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store';
import { Search, X, Loader2, Navigation, User, Sword, Map, Crosshair, Settings as SettingsIcon } from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useRouter } from 'next/navigation';

const typeIcons = {
  navigation: <Navigation size={14} className="text-blue-400" />,
  player: <User size={14} className="text-purple-400" />,
  match: <Sword size={14} className="text-red-400" />,
  agent: <User size={14} className="text-orange-400" />,
  map: <Map size={14} className="text-green-400" />,
  setting: <SettingsIcon size={14} className="text-slate-400" />
};

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useStore();
  const { query, setQuery, results, loading } = useGlobalSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen, setQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPalette(!commandPaletteOpen);
      }
      
      if (!commandPaletteOpen) return;

      if (e.key === 'Escape') {
        setCommandPalette(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, results, selectedIndex, setCommandPalette]);

  const handleSelect = (item: SearchResult) => {
    setCommandPalette(false);
    if (item.action) {
      item.action();
    } else if (item.url) {
      router.push(item.url);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50">
      <div 
        className="absolute inset-0" 
        onClick={() => setCommandPalette(false)}
      />
      <div className="relative w-full max-w-2xl glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-background/50">
          <div className="flex items-center gap-3 text-slate-400 w-full">
            <Search size={20} className="text-slate-300" />
            <input 
              ref={inputRef}
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dashboard, matches, settings..."
              className="bg-transparent border-0 outline-none text-white text-base w-full placeholder:text-slate-500"
            />
          </div>
          {loading ? (
            <Loader2 size={18} className="text-slate-400 animate-spin" />
          ) : (
            <button 
              onClick={() => setCommandPalette(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Crosshair size={32} className="opacity-50" />
              <p className="text-sm">Start typing to search globally.</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Search size={32} className="opacity-20" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {results.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-primary/20 text-white shadow-[inset_2px_0_0_0_#ff4655]' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="shrink-0 p-2 bg-white/5 rounded-lg">
                    {typeIcons[item.type] || <Search size={14} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-sm font-semibold truncate leading-tight">
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="text-xs text-slate-400 truncate leading-tight mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Enter to open
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">↑↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">↵</kbd> to select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
