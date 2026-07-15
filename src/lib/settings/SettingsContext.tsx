"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { SETTINGS_REGISTRY, SettingDefinition } from './settingsRegistry';

type Preferences = Record<string, any>;

interface SettingsContextType {
  preferences: Preferences;
  setPreference: (key: string, value: any) => void;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to set nested object properties by dot-notation key
function setNested(obj: any, path: string, value: any) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  if (lastKey) {
    current[lastKey] = value;
  }
  return obj;
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from API on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      // Only fetch if we have a token (user might be logged out)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response: any = await apiFetch('/api/v1/me/preferences');
        if (response && response.data) {
          setPreferences(response.data);
        }
      } catch (err: any) {
        // Silently ignore 401s on initial load (token might be expired)
        if (!err.message?.includes('401')) {
          console.warn('Failed to fetch preferences', err);
        }
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Sync DOM attributes whenever preferences change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Compact Mode
    if (preferences?.appearance?.compactMode) {
      document.body.setAttribute('data-compact', 'true');
    } else {
      document.body.removeAttribute('data-compact');
    }

    // Font Size
    const fontSize = preferences?.accessibility?.fontSize;
    if (fontSize) {
      document.body.setAttribute('data-font-size', fontSize);
    } else {
      document.body.removeAttribute('data-font-size');
    }

    // High Contrast
    if (preferences?.accessibility?.highContrast) {
      document.body.setAttribute('data-high-contrast', 'true');
    } else {
      document.body.removeAttribute('data-high-contrast');
    }

    // Reduced Motion
    if (preferences?.accessibility?.reducedMotion) {
      document.body.setAttribute('data-reduced-motion', 'true');
    } else {
      document.body.removeAttribute('data-reduced-motion');
    }
  }, [preferences]);

  const setPreference = useCallback(async (key: string, value: any) => {
    // We need to keep a reference to the updated object to send to the backend
    let updatedPrefs: Preferences = {};

    // Optimistic UI update
    setPreferences((prev) => {
      const newPrefs = JSON.parse(JSON.stringify(prev)); // deep clone
      setNested(newPrefs, key, value);
      updatedPrefs = newPrefs;
      return newPrefs;
    });

    // Only patch if we have a token (user is logged in)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    // Patch to backend: send the full deeply merged object to prevent backend shallow merge overwrites
    try {
      await apiFetch('/api/v1/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updatedPrefs)
      });
    } catch (err: any) {
      if (!err.message?.includes('401')) {
        console.warn(`Failed to save preference ${key}:`, err.message || err);
      }
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ preferences, setPreference, isLoading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
