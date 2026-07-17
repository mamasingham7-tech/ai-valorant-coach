import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Module' | 'Setting' | 'Player' | 'Match' | 'Guide';
  href: string;
  icon?: React.ReactNode; 
}

// Static search index of available routes and modules
const STATIC_INDEX: SearchResult[] = [
  { id: 'm1', title: 'Dashboard', category: 'Module', href: '/dashboard' },
  { id: 'm2', title: 'Match Analysis', category: 'Module', href: '/matches' },
  { id: 'm3', title: 'Digital Twin', category: 'Module', href: '/twin' },
  { id: 'm4', title: 'Live Coaching', category: 'Module', href: '/live' },
  { id: 'm5', title: 'Training Center', category: 'Module', href: '/training' },
  { id: 'm6', title: 'Riot Account Portal', category: 'Module', href: '/portal' },
  { id: 'm7', title: 'User Profile', category: 'Module', href: '/profile' },
  
  // Settings
  { id: 's1', title: 'General Settings', category: 'Setting', href: '/settings' },
  { id: 's2', title: 'Account Settings', category: 'Setting', href: '/settings/account' },
  { id: 's3', title: 'Appearance & Theme', category: 'Setting', href: '/settings/appearance' },
  { id: 's4', title: 'Security', category: 'Setting', href: '/settings/security' },
  { id: 's5', title: 'Notifications', category: 'Setting', href: '/settings/notifications' },
  { id: 's6', title: 'Privacy & Data', category: 'Setting', href: '/settings/privacy' },
  { id: 's7', title: 'Integrations', category: 'Setting', href: '/settings/integrations' },
  { id: 's8', title: 'Accessibility', category: 'Setting', href: '/settings/accessibility' },
  { id: 's9', title: 'Language', category: 'Setting', href: '/settings/language' },
  
  // Mock Data for demonstration since backend doesn't have a search endpoint
  { id: 'p1', title: 'TenZ', subtitle: 'Radiant O~T NA', category: 'Player', href: '/portal' },
  { id: 'p2', title: 'Demon1', subtitle: 'Radiant O~T NA', category: 'Player', href: '/portal' },
  { id: 'g1', title: 'Jett Entry Guide', subtitle: 'Mastering the dash', category: 'Guide', href: '/training' },
  { id: 'g2', title: 'Ascent B-Site Holds', subtitle: 'Cypher setups', category: 'Guide', href: '/training' },
  { id: 'c1', title: 'Ascent', subtitle: 'Map overview', category: 'Guide', href: '/dashboard' },
  { id: 'c2', title: 'Bind', subtitle: 'Map overview', category: 'Guide', href: '/dashboard' },
];

export function useSearch() {
  const [query, setQueryRaw] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const setQuery = (val: string) => {
    setQueryRaw(val);
    setIsSearching(true);
  };

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Execute search
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    
    const lowerQuery = debouncedQuery.toLowerCase();
    
    return STATIC_INDEX.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery)) ||
      item.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Max 10 results
  }, [debouncedQuery]);

  const executeResult = (result: SearchResult) => {
    router.push(result.href);
  };

  return {
    query,
    setQuery,
    isSearching,
    results,
    executeResult
  };
}
