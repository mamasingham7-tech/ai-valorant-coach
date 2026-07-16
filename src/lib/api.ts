// Centralised API client with auto-retry and connection health tracking

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-valorant-coach-backend.onrender.com";
const PORTAL_BASE = `${API_BASE}/api/v1/portal`;

// ── Health monitoring ──────────────────────────────────────────────────────

export type BackendStatus = "online" | "offline" | "checking";

export async function checkHealth(): Promise<{ status: BackendStatus; latency: number; mode?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE}/health/liveness`, { signal: AbortSignal.timeout(3000) });
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      return { status: "online", latency, mode: data.mode };
    }
    return { status: "offline", latency };
  } catch {
    return { status: "offline", latency: Date.now() - start };
  }
}

export async function checkReadiness(): Promise<{
  status: string; mode?: string; checks?: Record<string, string>; latency: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE}/health/readiness`, { signal: AbortSignal.timeout(4000) });
    const latency = Date.now() - start;
    const data = await res.json();
    return { ...data, latency };
  } catch {
    return { status: "offline", latency: Date.now() - start };
  }
}

// ── Generic fetch with retry ───────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
  retries = 1
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  
  // Read token from localStorage if available (client-side only)
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers = { 
    "Content-Type": "application/json", 
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}) 
  };

  // Ensure we always send cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
    signal: options?.signal ?? AbortSignal.timeout(8000),
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        // If unauthorized and we haven't already retried specifically for auth
        if (res.status === 401 && attempt < retries && !url.includes('/auth/refresh')) {
          // Attempt to refresh token
          const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data?.data?.access_token;
            if (newToken && typeof window !== "undefined") {
              localStorage.setItem("access_token", newToken);
              // Update headers for retry
              fetchOptions.headers = {
                ...fetchOptions.headers,
                "Authorization": `Bearer ${newToken}`
              };
            }
            // Refresh succeeded, retry original request
            continue; 
          }
        }
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err || `API error ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail ?? "Login failed");
  }
  return res.json();
}

export async function registerWithEmail(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail ?? "Registration failed");
  }
  return res.json();
}

// ── Player Portal ────────────────────────────────────────────────────────────

export async function getProviderInfo() {
  return apiFetch<{ data: { provider: string } }>(`/api/v1/portal/provider`);
}

export async function verifyRiotId(riotId: string) {
  const res = await fetch(`${PORTAL_BASE}/verify-riot-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riot_id: riotId }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail ?? "Riot ID not found");
  }
  return res.json();
}

export async function getPlayerStats(riotId: string, region: string) {
  const params = new URLSearchParams({ riot_id: riotId, region });
  return apiFetch<any>(`/api/v1/portal/player-stats?${params}`);
}

export async function getPlayerRank(riotId: string, region: string) {
  const params = new URLSearchParams({ riot_id: riotId, region });
  return apiFetch<any>(`/api/v1/portal/rank?${params}`);
}

export async function getPlayerMatches(riotId: string, region: string, mode = "competitive", size = 20) {
  const params = new URLSearchParams({ riot_id: riotId, region, mode, size: String(size) });
  return apiFetch<any>(`/api/v1/portal/matches?${params}`);
}

// ── Local storage helpers for persisting linked account ─────────────────────

export const STORAGE_KEY = "val_linked_account";

export type LinkedAccount = {
  riotId: string;
  gameName: string;
  tagLine: string;
  region: string;
  accountLevel: number;
  provider: string;
  linkedAt: string;
};

export function getLinkedAccount(): LinkedAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLinkedAccount(data: LinkedAccount) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearLinkedAccount() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── Valorant regions ─────────────────────────────────────────────────────────

export const VALORANT_REGIONS = [
  { value: "na",    label: "🇺🇸 North America",   short: "NA"    },
  { value: "latam", label: "🌎 Latin America",     short: "LATAM" },
  { value: "br",    label: "🇧🇷 Brazil",            short: "BR"    },
  { value: "eu",    label: "🇪🇺 Europe",            short: "EU"    },
  { value: "ap",    label: "🌏 Asia Pacific",       short: "AP"    },
  { value: "kr",    label: "🇰🇷 Korea",             short: "KR"    },
  { value: "me",    label: "🇸🇦 Middle East",       short: "ME"    },
  { value: "in",    label: "🇮🇳 India",             short: "IN"    },
];

// ── Rank display helpers ─────────────────────────────────────────────────────

export const RANK_COLORS: Record<string, string> = {
  Radiant: "#f0b232", Immortal: "#ff4655", Ascendant: "#2dfc9e",
  Diamond: "#b77fea", Platinum: "#00c8c8", Gold: "#f0b232",
  Silver: "#9aa4b2", Bronze: "#a05a2c", Iron: "#6b7280", Unranked: "#475569",
};

export function getRankColor(tier?: string | null): string {
  if (!tier) return "#475569";
  const base = tier.split(" ")[0];
  return RANK_COLORS[base] ?? "#475569";
}

export function getRankEmoji(tier?: string | null): string {
  if (!tier) return "—";
  const base = tier.split(" ")[0];
  const map: Record<string, string> = {
    Radiant: "✦", Immortal: "⟡", Ascendant: "◈", Diamond: "◆",
    Platinum: "◈", Gold: "◉", Silver: "◎", Bronze: "○", Iron: "▿",
  };
  return map[base] ?? "○";
}
