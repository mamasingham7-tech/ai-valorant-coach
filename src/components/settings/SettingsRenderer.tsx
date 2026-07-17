"use client";

import React from 'react';
import { SETTINGS_REGISTRY } from '@/lib/settings/settingsRegistry';
import { SettingsCard } from './SettingsCard';
import { SettingsToggle } from './SettingsToggle';
import { SettingsSelect } from './SettingsSelect';
import { SettingsButton } from './SettingsButton';
import { useTheme } from 'next-themes';

interface SettingsRendererProps {
  pagePath: string; // The path of the page to render settings for
}

export const SettingsRenderer: React.FC<SettingsRendererProps> = ({ pagePath }) => {
  const { setTheme } = useTheme();

  // Filter settings that belong to this page
  const pageSettings = SETTINGS_REGISTRY.filter((s) => s.path === pagePath);

  // Group settings by their category
  const groupedSettings = pageSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof pageSettings>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedSettings).map(([category, settings]) => (
        <SettingsCard key={category} title={category}>
          {settings.map((setting) => {
            if (setting.type === 'toggle') {
              return (
                <SettingsToggle
                  key={setting.id}
                  id={setting.id}
                  title={setting.title}
                  description={setting.description}
                  defaultValue={setting.defaultValue as boolean}
                />
              );
            }
            if (setting.type === 'select') {
              return (
                <SettingsSelect
                  key={setting.id}
                  id={setting.id}
                  title={setting.title}
                  description={setting.description}
                  options={setting.options || []}
                  defaultValue={setting.defaultValue as string}
                  onChangeOverride={(val) => {
                    if (setting.id === 'appearance.theme') {
                      setTheme(val); // special sync with next-themes
                    }
                  }}
                />
              );
            }
            if (setting.type === 'button') {
              return (
                <SettingsButton
                  key={setting.id}
                  id={setting.id}
                  title={setting.title}
                  description={setting.description}
                  danger={setting.danger}
                  buttonText={setting.action ? "Execute" : "Action"}
                />
              );
            }
            return null;
          })}
        </SettingsCard>
      ))}
      
      {pageSettings.length === 0 && (
        <div className="text-zinc-500 text-sm py-8 text-center">
          No settings found for this section.
        </div>
      )}
    </div>
  );
};
