"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { query, setQuery, isSearching, results, executeResult } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal interactions
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        executeResult(results[selectedIndex]);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-slate-500 text-xs hover:border-white/10 transition-colors cursor-text w-44"
      >
        <Search size={12} />
        <span>Search...</span>
        <kbd className="ml-auto bg-white/10 rounded px-1 text-[10px]">⌘K</kbd>
      </button>

      {/* Mobile search button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        <Search size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-0">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-[#11161d] w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
              <Search className="text-slate-400 w-5 h-5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search players, modules, settings..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-base"
              />
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 shrink-0" />
              ) : (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {query.trim() === '' ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm">Type anything to start searching</p>
                  <div className="mt-4 flex gap-2 justify-center text-xs opacity-70">
                    <span className="bg-white/5 px-2 py-1 rounded">↑↓ to navigate</span>
                    <span className="bg-white/5 px-2 py-1 rounded">↵ to select</span>
                    <span className="bg-white/5 px-2 py-1 rounded">Esc to close</span>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm">No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        executeResult(result);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left
                        ${idx === selectedIndex ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20' : 'hover:bg-white/5 text-slate-300'}
                      `}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold
                            ${idx === selectedIndex ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}
                          `}>
                            {result.category}
                          </span>
                          <span className="font-semibold text-sm">{result.title}</span>
                        </div>
                        {result.subtitle && (
                          <p className={`text-xs mt-1 ${idx === selectedIndex ? 'text-white/80' : 'text-slate-500'}`}>
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      
                      <ArrowRight size={16} className={`shrink-0 transition-transform ${idx === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-500 shrink-0">
              <div className="flex gap-4">
                <span><kbd className="bg-white/5 px-1 py-0.5 rounded mr-1">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white/5 px-1 py-0.5 rounded mr-1">↵</kbd> Select</span>
                <span><kbd className="bg-white/5 px-1 py-0.5 rounded mr-1">Esc</kbd> Close</span>
              </div>
              <span className="font-medium text-[#ff4655]">AI Coach Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
