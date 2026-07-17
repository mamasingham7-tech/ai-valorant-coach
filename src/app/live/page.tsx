"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlayerStats, getRankColor, getRankEmoji } from "@/lib/api";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";
import { Tv, Link2, Activity, Zap, Shield, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";

type MatchData = { result: string; kills: number; deaths: number; assists: number; acs: number; hs_percent: number };
type RankData  = { tier: string; rr: number };
type FullData  = { rank: RankData | null; recent_matches: MatchData[]; stats: { win_rate: number; avg_acs: number; avg_hs_percent: number; avg_kda: number }; account_level: number };

// Live session sim tips derived from real stats
function generateCoachingTips(stats: FullData["stats"] | undefined, matches: MatchData[]): string[] {
  if (!stats || !matches.length) return [];
  const tips: string[] = [];

  if (stats.avg_hs_percent < 20)
    tips.push(`Your HS% (${stats.avg_hs_percent}%) is below 20%. Focus on crosshair placement at head level before peeking.`);
  if (stats.avg_hs_percent >= 25)
    tips.push(`Strong HS% (${stats.avg_hs_percent}%). Maintain crosshair discipline in high-pressure rounds.`);

  const avgDeaths = matches.reduce((s, m) => s + m.deaths, 0) / matches.length;
  if (avgDeaths > 16)
    tips.push(`You're averaging ${avgDeaths.toFixed(1)} deaths per match. Trade before peeking wide and use utility to prefire.`);

  const winRate = stats.win_rate;
  if (winRate < 45)
    tips.push(`Win rate (${winRate}%) below 50%. Play slower, use communication, and avoid solo plays in decisive rounds.`);
  if (winRate >= 55)
    tips.push(`Win rate (${winRate}%) is strong. Keep the momentum by playing as a team in closing rounds.`);

  if (stats.avg_acs < 160)
    tips.push(`ACS (${stats.avg_acs}) is low. Increase round impact: take space, use utility, and take more duels.`);

  const avgAssists = matches.reduce((s, m) => s + m.assists, 0) / matches.length;
  if (avgAssists < 3)
    tips.push(`Low assist count (${avgAssists.toFixed(1)} avg). Use more utility — flashes, smokes — to set up teammates.`);

  if (tips.length < 2)
    tips.push("Strong performance. Maintain consistency and focus on clutch round execution.");

  return tips.slice(0, 4);
}

function StatDisplay({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{label}</div>
      {note && <div className="text-[9px] text-slate-600 mt-0.5">{note}</div>}
    </div>
  );
}

export default function LivePage() {
  const { linked, isMounted } = useLinkedAccount();
  const [data, setData]   = useState<FullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!linked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getPlayerStats(linked.riotId, linked.region)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [linked?.riotId, refreshKey]);

  const tips = generateCoachingTips(data?.stats, data?.recent_matches ?? []);
  const rankColor = getRankColor(data?.rank?.tier);

  if (!linked) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-24 text-center space-y-5">
          <div className="w-20 h-20 bg-[#00f0ff]/10 rounded-full flex items-center justify-center mx-auto">
            <Tv size={36} className="text-[#00f0ff]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Live Coaching</h1>
          <p className="text-slate-400">Connect your Riot account to unlock AI coaching based on your real stats.</p>
          <Link href="/portal" className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03545] text-white font-bold px-6 py-3 rounded-xl">
            <Link2 size={15} /> Connect Riot Account
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Live Coaching</h1>
            <p className="text-slate-400 text-sm mt-1">AI coaching based on your recent performance data.</p>
          </div>
          <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Live game detection notice */}
        <div className="glass-panel rounded-2xl p-4 border border-[#f59e0b]/20 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#f59e0b]">Live Game Detection</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Real-time in-game overlay requires the Valorant desktop client to be running.
              Currently showing AI coaching based on your last {data?.recent_matches?.length ?? 0} competitive matches.
              Full overlay (economy, rounds, ultimates) activates when a live game is detected.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655]">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="glass-card rounded-xl h-20 animate-pulse" />)}
          </div>
        ) : data && (
          <>
            {/* Player overview */}
            <div className="glass-panel rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl" style={{ background: `${rankColor}12` }} />
              <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shrink-0"
                style={{ background: `${rankColor}15`, borderColor: `${rankColor}40`, color: rankColor }}>
                {linked.gameName[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-white">{linked.gameName}<span className="text-slate-500">#{linked.tagLine}</span></h2>
                {data.rank ? (
                  <p className="font-bold text-sm mt-0.5" style={{ color: rankColor }}>{getRankEmoji(data.rank.tier)} {data.rank.tier} · {data.rank.rr} RR</p>
                ) : (
                  <p className="text-slate-500 text-sm mt-0.5">Rank unavailable</p>
                )}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Based on</div>
                <div className="text-white font-bold">{data.recent_matches?.length ?? 0} recent matches</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatDisplay label="Win Rate"  value={`${data.stats?.win_rate ?? 0}%`}               color="#10b981" note="last 20 matches" />
              <StatDisplay label="Avg ACS"   value={String(data.stats?.avg_acs ?? 0)}               color="#00f0ff" note="round performance" />
              <StatDisplay label="Avg HS%"   value={`${data.stats?.avg_hs_percent ?? 0}%`}          color="#ff4655" note="headshot rate" />
              <StatDisplay label="KDA"       value={String(data.stats?.avg_kda ?? 0)}               color="#8b5cf6" note="kill/death/assist" />
            </div>

            {/* AI coaching insights */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap size={15} className="text-[#8b5cf6]" /> AI Coaching Insights
                <span className="text-[10px] text-slate-500 font-normal">— derived from your match data</span>
              </h2>
              {tips.map((tip, i) => (
                <div key={i} className={`glass-card rounded-xl p-4 flex items-start gap-3 border ${i === 0 ? "border-[#ff4655]/15" : "border-white/5"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-[#ff4655]/15 text-[#ff4655]" : i === 1 ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "bg-[#10b981]/10 text-[#10b981]"
                  }`}>{i === 0 ? "!" : i === 1 ? "⚡" : "✓"}</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                </div>
              ))}
              {tips.length === 0 && !loading && (
                <div className="glass-card rounded-xl p-6 text-center text-slate-500 text-sm">
                  No match data to analyze. Play competitive matches and re-sync.
                </div>
              )}
            </div>

            {/* Live overlay guide */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2"><Tv size={14} className="text-[#00f0ff]" /> Live Overlay Guide</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The full live overlay activates automatically when Valorant is running on your PC.
                It will display:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Activity, label: "Current Round Stats",      desc: "Real-time K/D/A, ACS, economy",         color: "#10b981" },
                  { icon: Shield,   label: "Economy Tracker",          desc: "Credits, buy type, eco recommendation",  color: "#00f0ff" },
                  { icon: Zap,      label: "Round Coaching",           desc: "Save/buy/force callouts per round",      color: "#f59e0b" },
                  { icon: TrendingUp, label: "Performance Momentum",  desc: "Tilt indicator, fatigue score",           color: "#8b5cf6" },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                    <Icon size={16} className="shrink-0 mt-0.5" style={{ color }} />
                    <div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-[10px] text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600">
                Note: Live game detection uses the Valorant local client API (port 2999) which is available when the game is running.
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

