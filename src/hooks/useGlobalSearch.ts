import { useState, useEffect, useMemo } from 'react';
import { getLinkedAccount, getPlayerMatches, getPlayerStats } from '@/lib/api';

export type SearchResult = {
  id: string;
  title: string;
  type: 'navigation' | 'player' | 'match' | 'agent' | 'map' | 'setting';
  description?: string;
  url?: string;
  action?: () => void;
};

const STATIC_ROUTES: SearchResult[] = [
  { id: 'nav-dashboard', title: 'Dashboard', type: 'navigation', description: 'Go to your main dashboard overview', url: '/dashboard' },
  { id: 'nav-matches', title: 'Match Analysis', type: 'navigation', description: 'Analyze your recent matches', url: '/matches' },
  { id: 'nav-twin', title: 'Digital Twin', type: 'navigation', description: 'AI modeled after your playstyle', url: '/twin' },
  { id: 'nav-live', title: 'Live Overlay', type: 'navigation', description: 'Real-time coaching and stats', url: '/live' },
  { id: 'nav-training', title: 'Training Center', type: 'navigation', description: 'Improve your aim and mechanics', url: '/training' },
  { id: 'nav-market', title: 'Marketplace', type: 'navigation', description: 'Download community models and agents', url: '/marketplace' },
  { id: 'nav-settings', title: 'Settings', type: 'setting', description: 'Manage your account preferences', url: '/settings' },
  { id: 'nav-profile', title: 'Profile', type: 'navigation', description: 'View your linked Riot account', url: '/profile' },
];

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const q = debouncedQuery.toLowerCase();
      let combinedResults: SearchResult[] = [];

      // 1. Search Static Routes
      const staticMatches = STATIC_ROUTES.filter(route => 
        route.title.toLowerCase().includes(q) || 
        route.description?.toLowerCase().includes(q)
      );
      combinedResults = [...combinedResults, ...staticMatches];

      // 2. Fetch API Data if linked account exists
      const linked = getLinkedAccount();
      if (linked) {
        try {
          // If query is short, skip heavy API calls to avoid spam
          if (q.length >= 3) {
            // We can fetch matches and filter them
            const matchesRes = await getPlayerMatches(linked.riotId, linked.region, 'competitive', 10);
            if (matchesRes && matchesRes.data && matchesRes.data.length > 0) {
              const matchedGames = matchesRes.data.filter((m: any) => 
                m.agent.toLowerCase().includes(q) || 
                m.map?.toLowerCase().includes(q)
              );
              
              const matchResults: SearchResult[] = matchedGames.map((m: any) => ({
                id: `match-${m.match_id || crypto.randomUUID()}`,
                title: `Match on ${m.map || 'Unknown Map'}`,
                type: 'match',
                description: `Played ${m.agent} - ${m.kills}K/${m.deaths}D/${m.assists}A (${m.result})`,
                url: '/matches'
              }));
              
              combinedResults = [...combinedResults, ...matchResults];
            }
          }
        } catch (e) {
          console.error("Search API integration error", e);
        }
      }

      setResults(combinedResults);
      setLoading(false);
    }

    performSearch();
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    loading
  };
}
