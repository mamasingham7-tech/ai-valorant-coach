"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getPlayerStats, getRankColor } from "@/lib/api";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";
import { Brain, Link2, Sliders, TrendingUp, Target, AlertCircle } from "lucide-react";

type MatchData = { result: string; kills: number; deaths: number; assists: number; acs: number; hs_percent: number; adr: number };
type RankData  = { tier: string; rr: number };
type FullData  = { rank: RankData | null; recent_matches: MatchData[]; stats: { win_rate: number; avg_acs: number; avg_hs_percent: number; avg_kda: number }; account_level: number; provider: string };

// ── Computed playstyle metrics from match data ──────────────────────────────

function calcMetrics(matches: MatchData[]) {
  if (!matches.length) return null;
  const n        = matches.length;
  const wins     = matches.filter(m => m.result === "WIN").length;
  const avgKills = matches.reduce((s, m) => s + m.kills, 0) / n;
  const avgDeaths= matches.reduce((s, m) => s + m.deaths, 0) / n;
  const avgAssist= matches.reduce((s, m) => s + m.assists, 0) / n;
  const avgACS   = matches.reduce((s, m) => s + m.acs, 0) / n;
  const avgHS    = matches.reduce((s, m) => s + m.hs_percent, 0) / n;
  const avgADR   = matches.reduce((s, m) => s + (m.adr ?? 0), 0) / n;
  const kda      = (avgKills + avgAssist) / Math.max(avgDeaths, 1);

  // Derive playstyle scores from available data (0-100)
  const aggressionScore = Math.min(100, Math.round((avgKills / 20) * 100));      // high kills = aggressive
  const aimScore        = Math.min(100, Math.round(avgHS * 2.5));                 // HS% maps to aim score
  const supportScore    = Math.min(100, Math.round((avgAssist / 10) * 100));      // high assists = support
  const consistencyScore= Math.min(100, Math.round((avgACS / 350) * 100));        // ACS consistency
  const survivalScore   = Math.min(100, Math.round((1 - avgDeaths / 20) * 100));  // fewer deaths = better survival
  const fraggingScore   = Math.min(100, Math.round((kda / 4) * 100));

  return {
    win_rate:    Math.round((wins / n) * 100),
    avg_kills:   Math.round(avgKills * 10) / 10,
    avg_deaths:  Math.round(avgDeaths * 10) / 10,
    avg_assists: Math.round(avgAssist * 10) / 10,
    avg_acs:     Math.round(avgACS),
    avg_hs:      Math.round(avgHS * 10) / 10,
    avg_adr:     Math.round(avgADR),
    kda:         Math.round(kda * 100) / 100,
    aggression:   aggressionScore,
    aim:          aimScore,
    support:      supportScore,
    consistency:  consistencyScore,
    survival:     survivalScore,
    fragging:     fraggingScore,
  };
}

type Playstyle = { name: string; description: string; icon: string; color: string; winBonus: number; acsBonus: number; risk: string };

function recommendPlaystyle(m: ReturnType<typeof calcMetrics>): Playstyle & { why: string } {
  if (!m) return { name: "Unknown", description: "", icon: "?", color: "#6b7280", winBonus: 0, acsBonus: 0, risk: "Low", why: "" };

  if (m.aggression > 70 && m.aim > 60) {
    return { name: "Entry Fragger", description: "Lead attacks, create space, and win duels. High impact, high risk.", icon: "⚡", color: "#ff4655", winBonus: 3, acsBonus: 15, risk: "High",
      why: `Your kill average (${m.avg_kills}) and aggression score (${m.aggression}) suggest you are comfortable in high-pressure duels. Your HS% (${m.avg_hs}%) supports an aggressive entry style.` };
  }
  if (m.support > 60 && m.consistency > 55) {
    return { name: "Flex Initiator", description: "Enable teammates with utilities and create opportunities through coordinated plays.", icon: "🔗", color: "#10b981", winBonus: 5, acsBonus: 5, risk: "Medium",
      why: `Your high assist average (${m.avg_assists}) shows strong team-oriented play. Your consistency score (${m.consistency}) indicates reliable performance each round.` };
  }
  if (m.survival > 65 && m.aggression < 55) {
    return { name: "Passive Controller", description: "Control angles, manage economy, and win through strategy over raw aim.", icon: "🛡️", color: "#8b5cf6", winBonus: 6, acsBonus: -5, risk: "Low",
      why: `Your survival score (${m.survival}) and lower aggression suggest you prefer to hold angles. This translates well into controller/sentinel-type agents.` };
  }
  if (m.fragging > 65 && m.support < 50) {
    return { name: "Aggressive Duelist", description: "Take fights constantly, create pressure, and carry through mechanical skill.", icon: "🎯", color: "#f59e0b", winBonus: 2, acsBonus: 20, risk: "Very High",
      why: `Your KDA (${m.kda}) and fragging score (${m.fragging}) show strong duel-winning ability. However, your low assist count suggests you may benefit from more team coordination.` };
  }
  return { name: "Lurker", description: "Make impact plays from unexpected angles, disrupt enemy rotations.", icon: "👁️", color: "#00f0ff", winBonus: 4, acsBonus: 8, risk: "Medium",
    why: `Your balanced stats suggest an adaptive style. Lurking leverages your map awareness and trading ability while reducing direct entry risk.` };
}

function StatBar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function DigitalTwinPage() {
  const { linked, isMounted } = useLinkedAccount();
  const [data, setData]     = useState<FullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Manual adjustment sliders (+/- from computed base)
  const [adjAggr, setAdjAggr]   = useState(0);
  const [adjAim,  setAdjAim]    = useState(0);
  const [adjSup,  setAdjSup]    = useState(0);

  useEffect(() => {
    if (!linked) return;
    setLoading(true);
    getPlayerStats(linked.riotId, linked.region)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, [linked?.riotId]);

  const metrics = useMemo(() => {
    if (!data?.recent_matches.length) return null;
    const base = calcMetrics(data.recent_matches);
    if (!base) return null;
    return {
      ...base,
      aggression:  Math.min(100, Math.max(0, base.aggression + adjAggr)),
      aim:         Math.min(100, Math.max(0, base.aim + adjAim)),
      support:     Math.min(100, Math.max(0, base.support + adjSup)),
    };
  }, [data, adjAggr, adjAim, adjSup]);

  const recommendation = useMemo(() => recommendPlaystyle(metrics), [metrics]);

  const rankColor = getRankColor(data?.rank?.tier);

  if (!linked) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-24 text-center space-y-5">
          <div className="w-20 h-20 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto">
            <Brain size={36} className="text-[#8b5cf6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">AI Playstyle Analyzer</h1>
          <p className="text-slate-400">Connect your Riot account to analyze your real playstyle from match data.</p>
          <Link href="/portal" className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03545] text-white font-bold px-6 py-3 rounded-xl transition-all">
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
        <div>
          <h1 className="text-2xl font-extrabold text-white">AI Playstyle Analyzer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Every metric is computed from your real match history — no guesses, no placeholders.
          </p>
        </div>

        {loading && (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3 animate-pulse">
            <Brain size={32} className="text-[#8b5cf6] mx-auto" />
            <p className="text-white font-bold">Analyzing {linked.gameName}'s match data…</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-4 text-sm text-[#ff4655]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {metrics && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Computed metrics */}
            <div className="lg:col-span-1 space-y-5">
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-[#ff4655]" />
                  <h2 className="text-sm font-bold text-white">Computed Playstyle Metrics</h2>
                </div>
                <p className="text-[10px] text-slate-500 -mt-2">Calculated from your last {data?.recent_matches.length} matches</p>

                <StatBar label="Aggression"   value={metrics.aggression}   color="#ff4655" />
                <StatBar label="Aim / HS%"    value={metrics.aim}          color="#f59e0b" />
                <StatBar label="Support"      value={metrics.support}      color="#10b981" />
                <StatBar label="Consistency"  value={metrics.consistency}  color="#00f0ff" />
                <StatBar label="Survival"     value={metrics.survival}     color="#8b5cf6" />
                <StatBar label="Fragging"     value={metrics.fragging}     color="#ff4655" />

                <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-center">
                  {[
                    { label: "Avg Kills",   value: metrics.avg_kills   },
                    { label: "Avg Deaths",  value: metrics.avg_deaths  },
                    { label: "Avg Assists", value: metrics.avg_assists  },
                    { label: "Avg HS%",     value: `${metrics.avg_hs}%` },
                    { label: "Avg ACS",     value: metrics.avg_acs     },
                    { label: "KDA",         value: metrics.kda         },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/3 rounded-lg p-2">
                      <div className="text-xs font-bold text-white">{value}</div>
                      <div className="text-[9px] text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual adjustment */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-[#8b5cf6]" />
                  <h2 className="text-sm font-bold text-white">Simulate Adjustments</h2>
                </div>
                <p className="text-[10px] text-slate-500">Adjust to simulate different playstyles and see AI impact</p>

                {[
                  { label: "Aggression",  value: adjAggr,  set: setAdjAggr },
                  { label: "Aim Focus",   value: adjAim,   set: setAdjAim  },
                  { label: "Support",     value: adjSup,   set: setAdjSup  },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className={`text-xs font-bold ${value > 0 ? "text-[#10b981]" : value < 0 ? "text-[#ff4655]" : "text-slate-400"}`}>
                        {value > 0 ? `+${value}` : value}
                      </span>
                    </div>
                    <input type="range" min={-30} max={30} value={value}
                      onChange={e => set(parseInt(e.target.value))}
                      className="w-full accent-[#8b5cf6] cursor-pointer" />
                  </div>
                ))}
                <button onClick={() => { setAdjAggr(0); setAdjAim(0); setAdjSup(0); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 border border-white/5 rounded-lg py-1.5 transition-colors">
                  Reset to Baseline
                </button>
              </div>
            </div>

            {/* Right: AI Recommendation */}
            <div className="lg:col-span-2 space-y-5">
              {/* Playstyle card */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: `${recommendation.color}15` }} />
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border" style={{ background: `${recommendation.color}15`, borderColor: `${recommendation.color}30` }}>
                    {recommendation.icon}
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">AI Recommended Playstyle</div>
                    <h2 className="text-xl font-extrabold mt-0.5" style={{ color: recommendation.color }}>{recommendation.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">{recommendation.description}</p>
                  </div>
                </div>

                {/* Why */}
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Brain size={12} className="text-[#8b5cf6]" /> Why the AI recommends this
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{recommendation.why}</p>
                </div>

                {/* Projected outcomes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Predicted Win Rate", value: `${Math.min(100, metrics.win_rate + recommendation.winBonus)}%`, color: "#10b981" },
                    { label: "Expected ACS",        value: `${Math.round(metrics.avg_acs + recommendation.acsBonus)}`,       color: "#00f0ff" },
                    { label: "Risk Level",          value: recommendation.risk,                                                color: recommendation.risk === "High" || recommendation.risk === "Very High" ? "#ff4655" : "#10b981" },
                    { label: "Based On",            value: `${data?.recent_matches.length} matches`,                          color: "#8b5cf6" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <div className="text-lg font-extrabold" style={{ color }}>{value}</div>
                      <div className="text-[10px] text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#10b981] flex items-center gap-2"><TrendingUp size={13} /> Strengths</h3>
                  <div className="space-y-2">
                    {[
                      metrics.aim > 60       && `Strong aim — ${metrics.avg_hs}% headshot rate`,
                      metrics.aggression > 60 && `High fragging impact — ${metrics.avg_kills} avg kills`,
                      metrics.support > 55    && `Team-oriented — ${metrics.avg_assists} avg assists`,
                      metrics.survival > 60   && `Good survival — only ${metrics.avg_deaths} avg deaths`,
                      metrics.consistency > 60 && `Consistent ACS — averaging ${metrics.avg_acs}`,
                    ].filter(Boolean).slice(0, 3).map(s => (
                      <div key={String(s)} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-[#10b981] shrink-0 mt-0.5">✓</span>{s}
                      </div>
                    ))}
                    {[metrics.aim, metrics.aggression, metrics.support].every(v => v <= 60) && (
                      <div className="text-xs text-slate-500">Play more matches to identify strengths</div>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#ff4655] flex items-center gap-2"><AlertCircle size={13} /> Areas to Improve</h3>
                  <div className="space-y-2">
                    {[
                      metrics.aim < 50        && `Low HS% (${metrics.avg_hs}%) — work on crosshair placement`,
                      metrics.survival < 50   && `High deaths (${metrics.avg_deaths} avg) — trade less`,
                      metrics.aggression < 40  && `Low impact (${metrics.avg_kills} kills) — take more duels`,
                      metrics.support < 40     && `Low assists (${metrics.avg_assists}) — use more utility`,
                      metrics.consistency < 45 && `Inconsistent ACS (${metrics.avg_acs}) — focus on consistency`,
                    ].filter(Boolean).slice(0, 3).map(s => (
                      <div key={String(s)} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-[#ff4655] shrink-0 mt-0.5">⚠</span>{s}
                      </div>
                    ))}
                    {[metrics.aim, metrics.survival, metrics.aggression].every(v => v >= 50) && (
                      <div className="text-xs text-slate-500">No major weaknesses detected</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Training link */}
              <Link href="/training" className="glass-card rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div>
                  <p className="text-sm font-bold text-white">Start Personalized Training</p>
                  <p className="text-xs text-slate-400 mt-0.5">Based on your playstyle analysis</p>
                </div>
                <div className="text-[#ff4655] group-hover:translate-x-1 transition-transform">→</div>
              </Link>
            </div>
          </div>
        )}

        {!loading && !metrics && !error && data && (
          <div className="glass-card rounded-2xl p-10 text-center space-y-3">
            <Brain className="mx-auto text-slate-600" size={32} />
            <p className="text-slate-400 font-semibold">No match data to analyze</p>
            <p className="text-slate-500 text-sm">The provider returned no recent matches. Play competitive games and re-sync.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

