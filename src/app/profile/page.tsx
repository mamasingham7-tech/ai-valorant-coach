"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlayerStats, VALORANT_REGIONS, getRankColor, getRankEmoji } from "@/lib/api";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";
import { User, Link2, Trophy, BarChart3, Zap, RefreshCw, ExternalLink } from "lucide-react";

type RankData  = { tier: string; rr: number; peak_tier?: string | null; elo?: number | null };
type MatchData = { result: string; agent: string; kills: number; deaths: number; assists: number; acs: number; hs_percent: number; rr_change?: number | null };
type FullData  = { rank: RankData | null; recent_matches: MatchData[]; stats: { win_rate: number; avg_acs: number; avg_hs_percent: number; avg_kda: number; matches_analyzed: number }; account_level: number; region: string; provider: string };

export default function ProfilePage() {
  const { linked, setLinked, isMounted } = useLinkedAccount();
  const [data, setData]       = useState<FullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!linked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getPlayerStats(linked.riotId, linked.region)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, [linked?.riotId]);

  const rankColor = getRankColor(data?.rank?.tier);

  // Compute agent frequency
  const agentFreq: Record<string, number> = {};
  data?.recent_matches.forEach(m => { agentFreq[m.agent] = (agentFreq[m.agent] ?? 0) + 1; });
  const topAgents = Object.entries(agentFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (!linked) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-24 text-center space-y-5">
          <div className="w-20 h-20 bg-[#ff4655]/10 rounded-full flex items-center justify-center mx-auto">
            <User size={36} className="text-[#ff4655]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Profile Unavailable</h1>
          <p className="text-slate-400">Connect your Riot account to view your personalised profile.</p>
          <Link href="/portal"
            className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03545] text-white font-bold px-6 py-3 rounded-xl transition-all">
            <Link2 size={15} /> Connect Riot Account
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-white">My Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Your Valorant identity and performance overview.</p>
          </div>
          <button onClick={() => { setLoading(true); getPlayerStats(linked.riotId, linked.region).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false)); }}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing…" : "Refresh"}
          </button>
        </div>

        {/* Hero card */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: `${rankColor}15` }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl border-2 flex items-center justify-center text-3xl font-black shrink-0"
              style={{ background: `${rankColor}18`, borderColor: `${rankColor}50`, color: rankColor }}>
              {linked.gameName[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-white">{linked.gameName}<span className="text-slate-500 text-lg font-medium">#{linked.tagLine}</span></h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-sm text-slate-400">{VALORANT_REGIONS.find(r => r.value === linked.region)?.label ?? linked.region}</span>
                <span className="text-sm text-slate-400">Level <strong className="text-white">{data?.account_level ?? linked.accountLevel}</strong></span>
                <span className="text-[10px] font-bold bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-400 capitalize">via {linked.provider}</span>
              </div>
              {loading && <p className="text-xs text-slate-500 animate-pulse mt-1">Fetching live data…</p>}
              {error && <p className="text-xs text-[#ff4655] mt-1">{error}</p>}
            </div>

            {/* Rank badge */}
            {data?.rank ? (
              <div className="shrink-0 text-center">
                <div className="text-4xl font-black" style={{ color: rankColor }}>{getRankEmoji(data.rank.tier)}</div>
                <div className="text-sm font-extrabold mt-1" style={{ color: rankColor }}>{data.rank.tier}</div>
                <div className="text-xs text-slate-400">{data.rank.rr} RR</div>
                {data.rank.peak_tier && <div className="text-[10px] text-slate-500 mt-0.5">Peak: {data.rank.peak_tier}</div>}
              </div>
            ) : !loading ? (
              <div className="shrink-0 text-center">
                <div className="text-slate-600 text-sm font-bold">Rank unavailable</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Play ranked to get a rank</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Stats grid */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Win Rate",   value: `${data.stats.win_rate}%`,         color: "#10b981", icon: Trophy },
              { label: "Avg ACS",    value: String(data.stats.avg_acs),         color: "#00f0ff", icon: BarChart3 },
              { label: "Avg HS%",    value: `${data.stats.avg_hs_percent}%`,   color: "#ff4655", icon: Zap },
              { label: "Avg KDA",    value: String(data.stats.avg_kda),         color: "#8b5cf6", icon: User },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="glass-card rounded-xl p-5 text-center space-y-2">
                <Icon size={18} className="mx-auto" style={{ color }} />
                <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Recent form + agents */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Recent W/L form */}
          {data?.recent_matches && data.recent_matches.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Recent Form</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.recent_matches.slice(0, 20).map((m, i) => (
                  <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${m.result === "WIN" ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30" : "bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20"}`}>
                    {m.result === "WIN" ? "W" : "L"}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                {data.recent_matches.filter(m => m.result === "WIN").length}W / {data.recent_matches.filter(m => m.result !== "WIN").length}L
                in last {data.recent_matches.length} matches
              </div>
            </div>
          )}

          {/* Top agents */}
          {topAgents.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Most Played Agents</h3>
              <div className="space-y-2">
                {topAgents.map(([agent, count], i) => {
                  const total = data?.recent_matches.length ?? 1;
                  const pct   = Math.round((count / total) * 100);
                  return (
                    <div key={agent} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#ff4655]/10 border border-[#ff4655]/20 flex items-center justify-center text-[10px] font-black text-[#ff4655] shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white">{agent}</span>
                          <span className="text-[10px] text-slate-400">{count} games</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#ff4655]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* No data placeholders */}
        {!loading && !data && (
          <div className="glass-card rounded-2xl p-10 text-center space-y-3">
            <BarChart3 className="mx-auto text-slate-600" size={32} />
            <p className="text-slate-400 font-semibold">No data yet</p>
            <p className="text-slate-500 text-sm">Stats could not be loaded from the backend.</p>
            <p className="text-xs text-slate-600">Make sure the backend is running and accessible</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/portal" className="flex items-center gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#ff4655]/20 transition-colors">
            <Link2 size={13} /> Manage Connection
          </Link>
          <Link href="/matches" className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            <ExternalLink size={13} /> View Match History
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

