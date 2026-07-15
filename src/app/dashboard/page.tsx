"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { checkHealth, getLinkedAccount, getPlayerStats, getRankColor, getRankEmoji } from "@/lib/api";
import { TrendingUp, Target, Zap, Shield, Activity, Star, ArrowUpRight, Link2, Brain, Gamepad2, ChevronRight } from "lucide-react";

type BackendStatus = "online" | "offline" | "checking";
type RankData  = { tier: string; rr: number; peak_tier?: string | null };
type MatchData = { result: string; agent: string; kills: number; deaths: number; assists: number; acs: number; map_name: string; score: string; rr_change?: number | null };
type FullData  = { rank: RankData | null; recent_matches: MatchData[]; stats: { win_rate: number; avg_acs: number; avg_hs_percent: number; avg_kda: number; matches_analyzed: number }; account_level: number };

const STATIC_INSIGHTS = [
  { title: "Crosshair Placement",  body: "Connect Riot account to get AI analysis of your crosshair placement and HS%.",   tag: "Aim",         color: "#ff4655", href: "/portal" },
  { title: "Economy Discipline",   body: "Link your account to see detailed economy management coaching across matches.",   tag: "Economy",     color: "#10b981", href: "/portal" },
  { title: "Positioning Habits",   body: "Connect account to analyze your map positioning and peeking tendencies.",         tag: "Positioning", color: "#f59e0b", href: "/portal" },
];

export default function DashboardPage() {
  const [status, setStatus]   = useState<BackendStatus>("checking");
  const [latency, setLatency] = useState<number | null>(null);
  const [linked, setLinked] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<FullData | null>(null);

  const doHealthCheck = useCallback(async () => {
    const r = await checkHealth();
    setStatus(r.status);
    setLatency(r.latency);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    setLinked(getLinkedAccount());
  }, []);

  useEffect(() => {
    doHealthCheck();
    const interval = setInterval(doHealthCheck, 15000);
    return () => clearInterval(interval);
  }, [doHealthCheck]);

  useEffect(() => {
    if (!linked) return;
    getPlayerStats(linked.riotId, linked.region)
      .then(res => setData(res.data))
      .catch(() => {});
  }, [linked?.riotId]);

  const rankColor = getRankColor(data?.rank?.tier);
  const isOnline  = status === "online";

  // Compute insights from real data
  const insights = data?.stats ? [
    data.stats.avg_hs_percent < 20 && {
      title: "Low Headshot Rate",
      body: `Your HS% is ${data.stats.avg_hs_percent}% — below the 20% threshold. Focus on crosshair placement at head height.`,
      tag: "Aim", color: "#ff4655", href: "/twin",
    },
    data.stats.win_rate < 50 && {
      title: "Win Rate Opportunity",
      body: `${data.stats.win_rate}% win rate over last ${data.stats.matches_analyzed} matches. Slow down in clutch rounds and trade less.`,
      tag: "Strategy", color: "#f59e0b", href: "/twin",
    },
    data.stats.avg_acs < 180 && {
      title: "ACS Below Threshold",
      body: `Averaging ${data.stats.avg_acs} ACS. Increase round impact through utility usage and entry fragging.`,
      tag: "Impact", color: "#8b5cf6", href: "/training",
    },
    {
      title: data.stats.avg_kda > 1.2 ? "Strong KDA" : "KDA Room to Grow",
      body: data.stats.avg_kda > 1.2
        ? `Your KDA ratio of ${data.stats.avg_kda} is above average. Keep up the consistent fragging.`
        : `KDA of ${data.stats.avg_kda}. Consider trading less and prioritizing high-value duels.`,
      tag: "Aim", color: data.stats.avg_kda > 1.2 ? "#10b981" : "#ff4655", href: "/training",
    },
  ].filter(Boolean) : STATIC_INSIGHTS;

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* Welcome banner */}
        <div className="relative overflow-hidden glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#ff4655]/8 rounded-full blur-3xl pointer-events-none" />
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {!isMounted ? "Welcome to Valorant AI Coach 👋" : linked ? `Welcome back, ${linked.gameName} 👋` : "Welcome to Valorant AI Coach 👋"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {!isMounted 
                ? "Loading your coaching profile..." 
                : data?.stats
                  ? `Your AI Coach analyzed ${data.stats.matches_analyzed} matches. Win Rate: ${data.stats.win_rate}% • ACS: ${data.stats.avg_acs}.`
                  : linked
                    ? "Syncing your match data..."
                    : "Connect your Riot account to get started with AI coaching."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-[#10b981] animate-pulse" : status === "checking" ? "bg-[#f59e0b]" : "bg-[#ff4655]"}`} />
            <span className={`text-xs font-bold ${isOnline ? "text-[#10b981]" : status === "checking" ? "text-[#f59e0b]" : "text-[#ff4655]"}`}>
              Backend {status === "checking" ? "Checking…" : isOnline ? `Online · ${latency}ms` : "Offline"}
            </span>
          </div>
        </div>

        {/* No account prompt */}
        {!linked && (
          <div className="glass-panel rounded-2xl p-6 border border-[#ff4655]/20 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-14 h-14 bg-[#ff4655]/10 rounded-2xl flex items-center justify-center shrink-0">
              <Link2 size={24} className="text-[#ff4655]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-base font-extrabold text-white">Connect Your Riot Account</h2>
              <p className="text-slate-400 text-sm mt-1">Link your Riot ID to unlock real match analysis, AI coaching, and rank tracking.</p>
            </div>
            <Link href="/portal" className="bg-[#ff4655] hover:bg-[#e03545] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 shrink-0">
              Connect Now →
            </Link>
          </div>
        )}

        {/* Stats grid — real data if linked, empty states if not */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Rank",      value: data?.rank?.tier ?? (linked ? "Syncing…" : "—"), sub: data?.rank ? `${data.rank.rr} RR` : "Connect account", color: data?.rank ? rankColor : "#475569", icon: Star },
            { label: "Win Rate",  value: data?.stats ? `${data.stats.win_rate}%` : "—",    sub: `${data?.stats?.matches_analyzed ?? 0} matches`,        color: data?.stats && data.stats.win_rate > 50 ? "#10b981" : "#ff4655", icon: TrendingUp },
            { label: "ACS",       value: data?.stats ? String(data.stats.avg_acs) : "—",   sub: "avg per match",                                          color: "#00f0ff", icon: Activity },
            { label: "HS%",       value: data?.stats ? `${data.stats.avg_hs_percent}%` : "—", sub: "headshot rate",                                       color: "#8b5cf6", icon: Target },
            { label: "KDA",       value: data?.stats ? String(data.stats.avg_kda) : "—",   sub: "kills+assists/deaths",                                   color: "#ff4655", icon: Zap },
            { label: "Level",     value: data?.account_level ? String(data.account_level) : "—", sub: linked?.region ?? "—",                             color: "#f59e0b", icon: Shield },
          ].map(({ label, value, sub, color, icon: Icon }) => (
            <div key={label} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
              </div>
              <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
              <div className="text-[10px] text-slate-500">{sub}</div>
            </div>
          ))}
        </div>

        {/* Recent matches */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Recent Matches</h2>
              <Link href="/matches" className="text-xs text-[#ff4655] hover:underline font-bold flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {data?.recent_matches && data.recent_matches.length > 0 ? (
              <div className="space-y-2">
                {data.recent_matches.slice(0, 5).map((m, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                    <div className={`w-1.5 h-10 rounded-full shrink-0 ${m.result === "WIN" ? "bg-[#10b981]" : "bg-[#ff4655]"}`} />
                    <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0">
                      {m.agent?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{m.map_name}</p>
                      <p className="text-[10px] text-slate-500">{m.agent} · {m.kills}/{m.deaths}/{m.assists}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-bold ${m.result === "WIN" ? "text-[#10b981]" : "text-[#ff4655]"}`}>{m.result}</div>
                      <div className="text-[10px] text-slate-500">{m.score}</div>
                    </div>
                    <div className="text-center hidden md:block">
                      <div className="text-sm font-bold text-white">{m.acs}</div>
                      <div className="text-[9px] text-slate-500">ACS</div>
                    </div>
                    {m.rr_change != null && (
                      <div className={`text-sm font-bold ${m.rr_change > 0 ? "text-[#10b981]" : "text-[#ff4655]"}`}>
                        {m.rr_change > 0 ? `+${m.rr_change}` : m.rr_change}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center space-y-3">
                <Gamepad2 className="mx-auto text-slate-600" size={28} />
                <p className="text-slate-500 text-sm">
                  {linked ? "No recent matches found. Sync your account on the Portal page." : "Connect Riot account to view matches."}
                </p>
                <Link href="/portal" className="text-xs text-[#ff4655] hover:underline font-bold">
                  Go to Portal →
                </Link>
              </div>
            )}
          </div>

          {/* AI insights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brain size={14} className="text-[#8b5cf6]" /> AI Insights
              </h2>
              <Link href="/twin" className="text-xs text-[#ff4655] hover:underline font-bold flex items-center gap-1">
                Full analysis <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {(insights as Array<{ title: string; body: string; tag: string; color: string; href: string }>).slice(0, 3).map((ins) => (
                <Link key={ins.title} href={ins.href} className="block glass-card rounded-xl p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ color: ins.color, background: `${ins.color}18` }}>{ins.tag}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{ins.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ins.body}</p>
                    </div>
                    <ArrowUpRight size={13} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick links */}
            <div className="space-y-2 pt-2">
              {[
                { href: "/portal",   label: "Connect Riot Account", icon: Link2,    color: "#ff4655" },
                { href: "/training", label: "Start Training",       icon: Target,   color: "#10b981" },
                { href: "/twin",     label: "Playstyle Analysis",   icon: Brain,    color: "#8b5cf6" },
              ].map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href} className="flex items-center gap-3 glass-card rounded-xl px-4 py-2.5 hover:bg-white/5 transition-colors group">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
                  <ChevronRight size={12} className="ml-auto text-slate-600 group-hover:text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
