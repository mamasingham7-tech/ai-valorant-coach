/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { useSettings } from '@/lib/settings/SettingsContext';

interface SettingsToggleProps {
  id: string;
  title: string;
  description?: string;
  defaultValue?: boolean;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  id,
  title,
  description,
  defaultValue = false,
}) => {
  const { preferences, setPreference } = useSettings();
  
  // Resolve value from nested key (e.g. "appearance.compactMode")
  const value = (id.split('.').reduce((acc, part) => (acc as any)?.[part], preferences) as any as boolean) ?? defaultValue;

  const handleToggle = () => {
    setPreference(id, !value);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="space-y-0.5 max-w-[70%]">
        <label className="text-sm font-medium text-white select-none cursor-pointer" onClick={handleToggle}>
          {title}
        </label>
        {description && (
          <p className="text-sm text-zinc-400">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ff4655] focus:ring-offset-2 focus:ring-offset-black
          ${value ? 'bg-[#ff4655]' : 'bg-zinc-700'}
        `}
      >
        <span className="sr-only">Toggle {title}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};
