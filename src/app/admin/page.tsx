"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Server, Database, Cpu, Zap, Activity, Clock, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { checkHealth, checkReadiness } from "@/lib/api";

type HealthCheck = { status: string; latency: number; mode?: string; checks?: Record<string, string> };

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-[#10b981] animate-pulse" : "bg-[#ff4655]"}`} />;
}

function HealthCard({ label, value, ok, icon: Icon, note }: {
  label: string; value: string; ok: boolean; icon: React.ElementType; note?: string;
}) {
  return (
    <div className={`glass-card rounded-xl p-4 border ${ok ? "border-[#10b981]/20" : "border-[#ff4655]/20"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={ok ? "text-[#10b981]" : "text-[#ff4655]"} />
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-base font-extrabold capitalize ${ok ? "text-[#10b981]" : "text-[#ff4655]"}`}>
        <StatusDot ok={ok} /> <span className="ml-1">{value}</span>
      </div>
      {note && <div className="text-[10px] text-slate-500 mt-1">{note}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [liveness, setLiveness]   = useState<HealthCheck | null>(null);
  const [readiness, setReadiness] = useState<HealthCheck | null>(null);
  const [checking, setChecking]   = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [history, setHistory]     = useState<Array<{ t: string; ok: boolean; ms: number }>>([]);
  const [role, setRole]           = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setRole('guest');
      return;
    }
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      setRole(JSON.parse(jsonPayload).role || 'user');
    } catch {
      setRole('guest');
    }
  }, []);

  const doCheck = useCallback(async () => {
    setChecking(true);
    const [live, ready] = await Promise.all([checkHealth(), checkReadiness()]);
    setLiveness(live);
    setReadiness(ready);
    setLastCheck(new Date());
    setHistory(h => [...h.slice(-19), { t: new Date().toLocaleTimeString(), ok: live.status === "online", ms: live.latency }]);
    setChecking(false);
  }, []);

  // Initial check + auto-retry every 10 seconds
  useEffect(() => {
    doCheck();
    const interval = setInterval(doCheck, 10000);
    return () => clearInterval(interval);
  }, [doCheck]);

  const isOnline = liveness?.status === "online";
  const checks   = readiness?.checks ?? {};

  const FLAGS = [
    { name: "live_overlay_v2",       enabled: true,  rollout: 100 },
    { name: "digital_twin_sim",      enabled: true,  rollout: 80  },
    { name: "player_portal",         enabled: true,  rollout: 100 },
    { name: "federated_learning",    enabled: false, rollout: 0   },
    { name: "federated_auth",        enabled: false, rollout: 0   },
  ];

  if (role === null) return <AppShell><div className="flex items-center justify-center min-h-screen text-slate-400">Loading...</div></AppShell>;
  if (role !== 'admin' && role !== 'system') {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertTriangle size={48} className="text-[#ff4655] mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-center max-w-md">
            You do not have the required administrative privileges to view this page.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Control Panel</h1>
            <p className="text-slate-400 text-sm mt-1">Platform monitoring, health, and feature management.</p>
          </div>
          <button onClick={doCheck} disabled={checking}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50">
            <RefreshCw size={13} className={checking ? "animate-spin" : ""} />
            {checking ? "Checking…" : "Refresh"}
          </button>
        </div>

        {/* Backend online/offline banner */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 border ${isOnline
          ? "bg-[#10b981]/5 border-[#10b981]/20"
          : "bg-[#ff4655]/5 border-[#ff4655]/20 animate-pulse"}`}>
          {isOnline
            ? <Wifi size={18} className="text-[#10b981] shrink-0" />
            : <WifiOff size={18} className="text-[#ff4655] shrink-0" />}
          <div className="flex-1">
            <p className={`text-sm font-extrabold ${isOnline ? "text-[#10b981]" : "text-[#ff4655]"}`}>
              FastAPI Backend — {isOnline ? "Online" : "Offline"}
            </p>
            <p className="text-[11px] text-slate-400">
              {isOnline
                ? `Latency ${liveness?.latency}ms · Mode: ${liveness?.mode ?? readiness?.mode ?? "production"} · Last checked: ${lastCheck?.toLocaleTimeString()}`
                : `Not reachable. Auto-retry every 10 seconds. Last attempt: ${lastCheck?.toLocaleTimeString() ?? "—"}`}
            </p>
          </div>
          {!isOnline && (
            <div className="text-[10px] text-[#ff4655] font-bold">
              Run: uvicorn app.main:app --reload
            </div>
          )}
        </div>

        {/* Health grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <HealthCard label="Backend API"  value={isOnline ? "Online"  : "Offline"}       ok={isOnline}                            icon={Server}   note={isOnline ? `${liveness?.latency}ms` : "Not reachable"} />
          <HealthCard label="Database"     value={checks.database ?? (isOnline ? "sqlite_ok" : "unknown")} ok={isOnline}           icon={Database} note="SQLite (dev mode)" />
          <HealthCard label="Redis"        value={checks.redis ?? "in-memory fallback"} ok={isOnline} icon={Cpu}   note="Fallback active" />
          <HealthCard label="Provider"     value={checks.provider ?? (isOnline ? "henrikdev" : "unknown")} ok={isOnline}           icon={Zap}      note="HenrikDev API" />
        </div>

        {/* Latency history sparkline */}
        {history.length > 1 && (
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity size={14} className="text-[#00f0ff]" /> Latency History
              </h2>
              <span className="text-[10px] text-slate-500">Last {history.length} polls · 10s interval</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {history.map((h, i) => {
                const max = Math.max(...history.map(x => x.ms), 1);
                const pct = Math.max((h.ms / max) * 100, 8);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{ height: `${pct}%`, background: h.ok ? "#10b981" : "#ff4655", opacity: 0.7 + (i / history.length) * 0.3 }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a2030] text-[9px] text-white px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {h.ms}ms
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] rounded-sm inline-block" /> Online</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#ff4655] rounded-sm inline-block" /> Offline</span>
            </div>
          </div>
        )}

        {/* Feature flags */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Feature Flags</h2>
          <div className="space-y-2">
            {FLAGS.map(f => (
              <div key={f.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusDot ok={f.enabled} />
                  <span className="text-sm text-white font-mono">{f.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 w-28">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#00f0ff]" style={{ width: `${f.rollout}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{f.rollout}%</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.enabled ? "bg-[#10b981]/10 text-[#10b981]" : "bg-white/5 text-slate-500"}`}>
                    {f.enabled ? "ENABLED" : "DISABLED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend startup instructions when offline */}
        {!isOnline && (
          <div className="glass-panel rounded-2xl p-6 border border-[#ff4655]/20 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#ff4655]" />
              <h2 className="text-sm font-bold text-[#ff4655]">Backend is not running</h2>
            </div>
            <p className="text-sm text-slate-400">Open a PowerShell terminal and run:</p>
            <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-[#00f0ff] space-y-1">
              <div className="text-slate-500 text-xs">## Navigate to backend</div>
              <div>cd "OneDrive\Documents\ai valorant coach\backend"</div>
              <div className="mt-2 text-slate-500 text-xs">## Start the server</div>
              <div>uvicorn app.main:app --reload</div>
            </div>
            <p className="text-xs text-slate-500">The page will automatically detect when backend comes online (checks every 10 seconds).</p>
          </div>
        )}

        {/* System info */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Uptime",         value: isOnline ? "Running"    : "Down",       icon: Clock  },
            { label: "Architecture",   value: "FastAPI + SQLite",                      icon: Server },
            { label: "API Version",    value: "v1 (REST + WebSocket)",                 icon: Zap    },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Icon size={16} className="text-[#00f0ff] shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-sm font-bold text-white">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
