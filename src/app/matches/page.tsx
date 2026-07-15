"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getPlayerMatches, VALORANT_REGIONS } from "@/lib/api";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";
import { Filter, Search, RefreshCw, Link2, ChevronDown, ChevronUp, Trophy, Zap, Target, Activity, BarChart3 } from "lucide-react";

type Match = {
  match_id: string; map_name: string; game_mode: string; result: string;
  agent: string; kills: number; deaths: number; assists: number;
  acs: number; hs_percent: number; adr: number; score: string;
  rr_change?: number | null; started_at?: string;
};

const AGENT_ROLES: Record<string, string> = {
  Jett: "Duelist", Reyna: "Duelist", Neon: "Duelist", Phoenix: "Duelist", Yoru: "Duelist", Iso: "Duelist",
  Killjoy: "Sentinel", Cypher: "Sentinel", Sage: "Sentinel", Chamber: "Sentinel", Deadlock: "Sentinel",
  Omen: "Controller", Brimstone: "Controller", Viper: "Controller", Astra: "Controller", Harbor: "Controller",
  Sova: "Initiator", Breach: "Initiator", Kay_O: "Initiator", Skye: "Initiator", Fade: "Initiator", Gekko: "Initiator",
};

const ROLE_COLORS: Record<string, string> = {
  Duelist: "#ff4655", Sentinel: "#00c8c8", Controller: "#8b5cf6", Initiator: "#f59e0b",
};

const AGENT_EMOJIS: Record<string, string> = {
  Jett: "💨", Reyna: "👁️", Killjoy: "🤖", Chamber: "🔫", Sage: "💚",
  Omen: "👤", Brimstone: "🔥", Neon: "⚡", Yoru: "🌀", Iso: "⭕",
  Sova: "🏹", Breach: "💥", Skye: "🐺", Viper: "☠️", Fade: "😱",
};

function MatchCard({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const isWin    = match.result === "WIN";
  const kda      = ((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2);
  const role     = AGENT_ROLES[match.agent] ?? "Unknown";
  const roleColor= ROLE_COLORS[role] ?? "#6b7280";
  const perf     = match.acs > 270 ? "MVP" : match.acs > 220 ? "Good" : match.acs > 160 ? "Average" : "Poor";

  return (
    <div className={`glass-card rounded-2xl overflow-hidden border transition-all ${isWin ? "border-[#10b981]/10" : "border-[#ff4655]/10"} hover:border-white/15`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Win indicator */}
        <div className={`w-1.5 self-stretch rounded-full shrink-0 ${isWin ? "bg-[#10b981]" : "bg-[#ff4655]"}`} />

        {/* Agent */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${roleColor}18`, border: `1px solid ${roleColor}30` }}>
          {AGENT_EMOJIS[match.agent] ?? match.agent[0]}
        </div>

        {/* Map + agent + mode */}
        <div className="min-w-0 flex-shrink" style={{ minWidth: 100 }}>
          <div className="text-sm font-bold text-white truncate">{match.map_name}</div>
          <div className="text-[10px] text-slate-400">{match.agent} · <span className="capitalize">{match.game_mode}</span></div>
        </div>

        {/* Result + score */}
        <div className="text-center shrink-0 hidden sm:block">
          <div className={`text-sm font-extrabold ${isWin ? "text-[#10b981]" : "text-[#ff4655]"}`}>{match.result}</div>
          <div className="text-[10px] text-slate-400 font-mono">{match.score}</div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 ml-auto shrink-0">
          {[
            { label: "KDA",  value: `${match.kills}/${match.deaths}/${match.assists}`, color: "text-white" },
            { label: "ACS",  value: String(match.acs), color: match.acs > 250 ? "text-[#10b981]" : "text-white" },
            { label: "HS%",  value: `${match.hs_percent}%`, color: match.hs_percent > 25 ? "text-[#00f0ff]" : "text-white" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center hidden md:block">
              <div className={`text-sm font-bold ${color}`}>{value}</div>
              <div className="text-[9px] text-slate-500 uppercase">{label}</div>
            </div>
          ))}

          {/* RR change */}
          {match.rr_change != null && (
            <div className="text-center">
              <div className={`text-sm font-bold ${match.rr_change > 0 ? "text-[#10b981]" : "text-[#ff4655]"}`}>
                {match.rr_change > 0 ? `+${match.rr_change}` : match.rr_change}
              </div>
              <div className="text-[9px] text-slate-500">RR</div>
            </div>
          )}

          {/* Performance badge */}
          <div className="text-center hidden lg:block">
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              perf === "MVP"     ? "bg-[#f59e0b]/15 text-[#f59e0b]" :
              perf === "Good"    ? "bg-[#10b981]/15 text-[#10b981]" :
              perf === "Average" ? "bg-white/5 text-slate-400"       :
                                   "bg-[#ff4655]/10 text-[#ff4655]"
            }`}>{perf}</div>
          </div>

          {/* Expand button */}
          <button onClick={() => setOpen(!open)}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/5 px-5 py-4 grid sm:grid-cols-2 gap-4">
          {/* Extended stats */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Performance</h4>
            {[
              { label: "KDA Ratio",      value: kda },
              { label: "ACS",            value: String(match.acs) },
              { label: "ADR",            value: String(match.adr ?? "—") },
              { label: "HS%",            value: `${match.hs_percent}%` },
              { label: "Agent",          value: match.agent },
              { label: "Role",           value: role, color: roleColor },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold" style={{ color: color ?? "#fff" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* AI feedback for this match */}
          <div className="bg-white/3 rounded-xl p-4 space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Zap size={10} className="text-[#8b5cf6]" /> AI Analysis
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {match.hs_percent < 20 && (
                <p className="flex items-start gap-1.5"><span className="text-[#ff4655] shrink-0">⚠</span> HS% below 20% — focus on crosshair placement at head level</p>
              )}
              {match.acs < 150 && (
                <p className="flex items-start gap-1.5"><span className="text-[#ff4655] shrink-0">⚠</span> Low ACS — increase round impact through utility and entry</p>
              )}
              {match.kills > 20 && (
                <p className="flex items-start gap-1.5"><span className="text-[#10b981] shrink-0">✓</span> Strong kill performance — keep up the aggression</p>
              )}
              {match.acs > 250 && (
                <p className="flex items-start gap-1.5"><span className="text-[#10b981] shrink-0">✓</span> Excellent ACS — top-tier round impact</p>
              )}
              {match.hs_percent >= 20 && match.acs >= 150 && match.kills <= 20 && (
                <p className="text-slate-400">Performance within expected range for {role}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const { linked, isMounted } = useLinkedAccount();
  const [matches, setMatches]     = useState<Match[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [filterResult, setFilterResult] = useState("all");

  async function fetchMatches(mode: string) {
    if (!linked) return;
    setLoading(true); setError("");
    try {
      const res = await getPlayerMatches(linked.riotId, linked.region, mode === "all" ? "competitive" : mode, 30);
      setMatches(res.data?.matches ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMatches(filterMode); }, [linked?.riotId, filterMode]);

  const filtered = useMemo(() => matches.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch  = !q || m.map_name.toLowerCase().includes(q) || m.agent.toLowerCase().includes(q) || m.match_id.toLowerCase().includes(q);
    const matchesResult  = filterResult === "all" || m.result === filterResult.toUpperCase();
    return matchesSearch && matchesResult;
  }), [matches, search, filterResult]);

  const wins   = filtered.filter(m => m.result === "WIN").length;
  const avgACS = filtered.length ? Math.round(filtered.reduce((s, m) => s + m.acs, 0) / filtered.length) : 0;
  const avgHS  = filtered.length ? Math.round(filtered.reduce((s, m) => s + m.hs_percent, 0) / filtered.length * 10) / 10 : 0;

  if (!linked) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-24 text-center space-y-5">
          <div className="w-20 h-20 bg-[#ff4655]/10 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 size={36} className="text-[#ff4655]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Match History</h1>
          <p className="text-slate-400">Connect your Riot account to view your match history.</p>
          <Link href="/portal" className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03545] text-white font-bold px-6 py-3 rounded-xl">
            <Link2 size={15} /> Connect Riot Account
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Match History</h1>
            <p className="text-slate-400 text-sm mt-1">Real match data for <span className="text-white font-bold">{linked.gameName}#{linked.tagLine}</span></p>
          </div>
          <button onClick={() => fetchMatches(filterMode)} disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Stats summary */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[
              { label: "Matches",   value: String(filtered.length),              color: "#fff"     },
              { label: "Win Rate",  value: `${Math.round((wins/filtered.length)*100)}%`, color: wins/filtered.length > 0.5 ? "#10b981" : "#ff4655" },
              { label: "Avg ACS",   value: String(avgACS),                       color: "#00f0ff"  },
              { label: "Avg HS%",   value: `${avgHS}%`,                          color: "#f59e0b"  },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search map, agent, match ID…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/40 transition-all" />
          </div>

          <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
            <option value="all" className="bg-[#0d1117]">All Modes</option>
            <option value="competitive" className="bg-[#0d1117]">Competitive</option>
            <option value="unrated" className="bg-[#0d1117]">Unrated</option>
            <option value="swiftplay" className="bg-[#0d1117]">Swiftplay</option>
            <option value="deathmatch" className="bg-[#0d1117]">Deathmatch</option>
          </select>

          <select value={filterResult} onChange={e => setFilterResult(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
            <option value="all" className="bg-[#0d1117]">All Results</option>
            <option value="win" className="bg-[#0d1117]">Wins Only</option>
            <option value="loss" className="bg-[#0d1117]">Losses Only</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655]">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {/* Match list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((m, i) => <MatchCard key={m.match_id || i} match={m} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && !error && (
          <div className="glass-card rounded-2xl p-12 text-center space-y-3">
            <Activity className="mx-auto text-slate-600" size={32} />
            <p className="text-slate-400 font-semibold">
              {matches.length > 0 ? "No matches match your filters" : "No match history found"}
            </p>
            <p className="text-slate-500 text-sm">
              {matches.length === 0 && (linked.provider === "mock" ? "Mock provider returned no matches. Switch USE_MOCK_PROVIDER=false in backend .env for real data." : "Play competitive games and sync again.")}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
