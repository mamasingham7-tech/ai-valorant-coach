"use client";

import React from 'react';
import { useSettings } from '@/lib/settings/SettingsContext';

interface SettingsButtonProps {
  id: string;
  title: string;
  description?: string;
  danger?: boolean;
  action?: () => void;
  buttonText?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  title,
  description,
  danger = false,
  action,
  buttonText = "Execute",
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="space-y-0.5 max-w-[70%]">
        <label className="text-sm font-medium text-white">
          {title}
        </label>
        {description && (
          <p className="text-sm text-zinc-400">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={action}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          danger 
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};
