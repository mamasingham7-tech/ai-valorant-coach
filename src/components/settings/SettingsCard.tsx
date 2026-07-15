"use client";

import React, { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden mb-6">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
      </div>
      <div className="px-6 py-2">
        {children}
      </div>
    </div>
  );
};
