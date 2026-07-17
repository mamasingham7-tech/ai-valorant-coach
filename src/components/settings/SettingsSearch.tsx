"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SETTINGS_REGISTRY, SettingDefinition } from '@/lib/settings/settingsRegistry';

export const SettingsSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus search on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SETTINGS_REGISTRY.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q) || false;
      const matchCategory = s.category.toLowerCase().includes(q);
      const matchKeywords = s.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (setting: SettingDefinition) => {
    setIsOpen(false);
    setQuery('');
    router.push(setting.path);
    // Could also highlight the setting by passing a hash/query param in the URL
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(val.trim().length > 0);
          }}
          placeholder="Search settings..."
          className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-md leading-5 bg-black/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655] sm:text-sm transition duration-150 ease-in-out"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#121212] border border-white/10 shadow-lg max-h-96 rounded-md overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((setting) => (
                <li
                  key={setting.id}
                  onClick={() => handleSelect(setting)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-white">{setting.title}</p>
                    <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{setting.category}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{setting.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-zinc-400 text-center">
              No matching settings found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
