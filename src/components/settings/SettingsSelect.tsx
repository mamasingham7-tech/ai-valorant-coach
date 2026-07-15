"use client";

import React from 'react';
import { useSettings } from '@/lib/settings/SettingsContext';

interface SettingsSelectProps {
  id: string;
  title: string;
  description?: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  onChangeOverride?: (val: string) => void;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  id,
  title,
  description,
  options,
  defaultValue = '',
  onChangeOverride
}) => {
  const { preferences, setPreference } = useSettings();
  
  const value = (id.split('.').reduce((acc, part) => (acc as any)?.[part], preferences) as unknown as string) ?? defaultValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPreference(id, val);
    if (onChangeOverride) {
      onChangeOverride(val);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="space-y-0.5 max-w-[60%]">
        <label className="text-sm font-medium text-white">
          {title}
        </label>
        {description && (
          <p className="text-sm text-zinc-400">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 min-w-[150px]">
        <select
          value={value}
          onChange={handleChange}
          className="w-full rounded-md border border-white/10 bg-black/50 py-1.5 pl-3 pr-8 text-sm text-white focus:border-[#ff4655] focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
