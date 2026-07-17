/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import AppShell from "@/components/layout/AppShell";
import { useState, useEffect } from "react";
import Link from "next/link";
import { verifyRiotId, getPlayerStats, saveLinkedAccount, clearLinkedAccount, getLinkedAccount, VALORANT_REGIONS, getRankColor, getRankEmoji, type LinkedAccount } from "@/lib/api";
import { Link2, CheckCircle, Loader2, AlertCircle, RefreshCw, X, Trophy, BarChart3, Gamepad2, Zap, Shield, Globe, Wifi, ChevronRight, LogIn } from "lucide-react";

type RankData    = { tier: string; rr: number; peak_tier?: string | null; elo?: number | null };
type MatchData   = { match_id: string; map_name: string; result: string; agent: string; kills: number; deaths: number; assists: number; acs: number; hs_percent: number; score: string; rr_change?: number | null };
type StatsData   = { win_rate: number; avg_acs: number; avg_hs_percent: number; avg_kda: number; matches_analyzed: number };
type FullData    = { rank: RankData | null; recent_matches: MatchData[]; stats: StatsData; account_level: number; region: string; provider: string };

type Step = "input" | "verifying" | "confirmed" | "syncing" | "done";

export default function PortalPage() {
  const [step, setStep]       = useState<Step>("input");
  const [riotId, setRiotId]   = useState("");
  const [region, setRegion]   = useState("na");
  const [error, setError]     = useState("");
  const [preview, setPreview] = useState<{ game_name: string; tag_line: string; account_level: number; region: string } | null>(null);
  const [full, setFull]       = useState<FullData | null>(null);
  const [linked, setLinked]   = useState<LinkedAccount | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = getLinkedAccount();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) { setLinked(saved); setRiotId(saved.riotId); setRegion(saved.region); }
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!riotId.includes("#")) { setError("Enter Riot ID as Name#TAG (e.g. TenZ#NA1)"); return; }
    setError(""); setStep("verifying");
    try {
      const res = await verifyRiotId(riotId);
      setPreview(res.data);
      setStep("confirmed");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Riot ID not found. Check spelling and try again.");
      setStep("input");
    }
  }

  async function handleSync() {
    setStep("syncing"); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p + 6, 88)), 150);
    try {
      const res = await getPlayerStats(riotId, region);
      clearInterval(tick); setProgress(100);
      setFull(res.data);
      const account: LinkedAccount = {
        riotId,
        gameName: preview?.game_name ?? riotId.split("#")[0],
        tagLine:  preview?.tag_line  ?? riotId.split("#")[1],
        region,
        accountLevel: res.data.account_level ?? 0,
        provider: res.data.provider ?? "henrikdev",
        linkedAt: new Date().toISOString(),
      };
      saveLinkedAccount(account);
      setLinked(account);
      setTimeout(() => setStep("done"), 500);
    } catch (err: any) {
      clearInterval(tick);
      setError(err instanceof Error ? err.message : "Failed to fetch player data. Try again.");
      setStep("confirmed");
    }
  }

  function handleDisconnect() {
    clearLinkedAccount();
    setLinked(null); setFull(null); setPreview(null);
    setRiotId(""); setError(""); setStep("input");
  }

  const rankColor = getRankColor(full?.rank?.tier);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Riot Account Portal</h1>
            <p className="text-slate-400 text-sm mt-1">
              Enter your Riot ID to import your Valorant profile, rank, and match history.
            </p>
          </div>
          {!linked && (
            <Link href="/auth/login" className="flex items-center gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#ff4655]/20 transition-colors">
              <LogIn size={13} /> Sign In for Persistent Data
            </Link>
          )}
        </div>

        {/* ── INPUT STEP ────────────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-4 border-l-2 border-[#00f0ff] flex items-start gap-3">
              <Shield size={16} className="text-[#00f0ff] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">How it works</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  Enter your Riot ID (e.g. <span className="font-mono text-white">YourName#TAG</span>).
                  In <strong className="text-[#10b981]">Mock Mode</strong> (current), any valid <code className="text-white font-mono text-[10px]">Name#TAG</code> format works instantly — great for testing.
                  For <strong className="text-[#00f0ff]">real data</strong>, add a free HenrikDev API key in <code className="text-white font-mono text-[10px]">.env</code>.
                </p>
                <a href="https://app.henrikdev.xyz" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-[#00f0ff] hover:underline mt-1 inline-block">
                  Get free HenrikDev API key → app.henrikdev.xyz
                </a>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-8 space-y-5">
              {error && (
                <div className="flex items-start gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655] font-semibold">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Riot ID</label>
                    <input type="text" required value={riotId} onChange={e => setRiotId(e.target.value)}
                      placeholder="GameName#TAG (e.g. TenZ#NA1)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 transition-all font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Region</label>
                    <select value={region} onChange={e => setRegion(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655]/50 transition-all">
                      {VALORANT_REGIONS.map(r => (
                        <option key={r.value} value={r.value} className="bg-[#0d1117]">{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit"
                  className="w-full bg-[#ff4655] hover:bg-[#e03545] text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ff4655]/20 hover:scale-[1.01]">
                  <Link2 size={15} /> Verify Riot ID
                </button>
              </form>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Globe,  label: "Public data only",   color: "#10b981" },
                  { icon: Shield, label: "No password needed", color: "#00f0ff" },
                  { icon: Wifi,   label: "Real match data",    color: "#8b5cf6" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="glass-card rounded-xl p-3 text-center">
                    <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                    <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VERIFYING ─────────────────────────────────────────────────────── */}
        {step === "verifying" && (
          <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
            <div className="w-16 h-16 bg-[#ff4655]/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 size={28} className="text-[#ff4655] animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white">Verifying <span className="text-[#ff4655] font-mono">{riotId}</span>…</h2>
            <p className="text-slate-500 text-sm">Checking HenrikDev API</p>
          </div>
        )}

        {/* ── CONFIRMED ─────────────────────────────────────────────────────── */}
        {step === "confirmed" && preview && (
          <div className="space-y-5">
            <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4655]/10 border border-[#ff4655]/30 flex items-center justify-center text-2xl font-black text-[#ff4655] shrink-0">
                {preview.game_name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-white">{preview.game_name}</h2>
                  <span className="text-slate-500 font-mono">#{preview.tag_line}</span>
                  <span className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={9} /> Verified
                  </span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-slate-400">
                  <span>{VALORANT_REGIONS.find(r => r.value === region)?.label ?? region}</span>
                  <span>Level <strong className="text-white">{preview.account_level}</strong></span>
                </div>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655] font-semibold">
                <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <p className="text-sm font-bold text-white mb-2">What will be imported</p>
              {[["🏆", "Current rank + RR + peak rank"], ["⚔️", "Last 20 competitive matches"], ["📊", "ACS, HS%, ADR, KDA stats"], ["🤖", "AI coaching recommendations"]].map(([ic, lbl]) => (
                <div key={lbl} className="flex items-center gap-2 text-sm text-slate-300"><span>{ic}</span>{lbl}</div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("input"); setError(""); }}
                className="flex-1 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-400 hover:text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all">
                <X size={13} /> Change
              </button>
              <button onClick={handleSync}
                className="flex-1 bg-[#ff4655] hover:bg-[#e03545] text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ff4655]/20">
                <RefreshCw size={13} /> Import Data
              </button>
            </div>
          </div>
        )}

        {/* ── SYNCING ───────────────────────────────────────────────────────── */}
        {step === "syncing" && (
          <div className="glass-panel rounded-2xl p-16 text-center space-y-6">
            <div className="w-16 h-16 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw size={28} className="text-[#8b5cf6] animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Importing your data…</h2>
              <p className="text-slate-400 text-sm mt-1">Fetching rank, match history, and performance stats</p>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg,#ff4655,#8b5cf6)" }} />
            </div>
            <p className="text-xs text-slate-500">{progress}%</p>
          </div>
        )}

        {/* ── DONE ──────────────────────────────────────────────────────────── */}
        {step === "done" && full && (
          <div className="space-y-6">
            {/* Account header */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: `${rankColor}12` }} />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shrink-0"
                  style={{ background: `${rankColor}15`, borderColor: `${rankColor}40`, color: rankColor }}>
                  {linked?.gameName?.[0]?.toUpperCase() ?? "V"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-white">{linked?.gameName}#{linked?.tagLine}</h2>
                    <span className="bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/20">✓ Connected</span>
                  </div>
                  {full.rank ? (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-extrabold text-base" style={{ color: rankColor }}>{getRankEmoji(full.rank.tier)} {full.rank.tier}</span>
                      <span className="text-xs text-slate-400">{full.rank.rr} RR</span>
                      {full.rank.peak_tier && <span className="text-[10px] text-slate-500">Peak: {full.rank.peak_tier}</span>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Rank data unavailable</p>
                  )}
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                    <span>{VALORANT_REGIONS.find(r => r.value === region)?.label ?? region}</span>
                    <span>Lv. {full.account_level}</span>
                    <span className="capitalize">via {full.provider}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleSync}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-400 hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                    <RefreshCw size={11} /> Sync
                  </button>
                  <button onClick={handleDisconnect}
                    className="flex items-center gap-1.5 bg-[#ff4655]/10 hover:bg-[#ff4655]/20 border border-[#ff4655]/20 text-[#ff4655] text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                    <X size={11} /> Disconnect
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            {full.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Win Rate",   value: `${full.stats.win_rate}%`,         color: "#10b981" },
                  { label: "Avg ACS",    value: String(full.stats.avg_acs),         color: "#00f0ff" },
                  { label: "Avg HS%",    value: `${full.stats.avg_hs_percent}%`,   color: "#ff4655" },
                  { label: "Avg KDA",    value: String(full.stats.avg_kda),         color: "#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{full.stats.matches_analyzed} matches</div>
                  </div>
                ))}
              </div>
            )}

            {/* Match history */}
            {full.recent_matches.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Recent Matches</h3>
                  <span className="text-xs text-slate-500">{full.recent_matches.length} imported</span>
                </div>
                <div className="space-y-2">
                  {full.recent_matches.slice(0, 10).map((m, i) => (
                    <div key={m.match_id || i} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${m.result === "WIN" ? "bg-[#10b981]" : "bg-[#ff4655]"}`} />
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white shrink-0">
                        {m.agent?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">{m.map_name}</div>
                        <div className="text-[10px] text-slate-500">{m.agent} · {m.kills}/{m.deaths}/{m.assists} KDA</div>
                      </div>
                      <div className="hidden sm:grid grid-cols-3 gap-4 text-center text-xs shrink-0">
                        <div>
                          <div className={`font-bold ${m.result === "WIN" ? "text-[#10b981]" : "text-[#ff4655]"}`}>{m.result}</div>
                          <div className="text-[10px] text-slate-500">{m.score}</div>
                        </div>
                        <div>
                          <div className="font-bold text-white">{m.acs}</div>
                          <div className="text-[10px] text-slate-500">ACS</div>
                        </div>
                        <div>
                          <div className={`font-bold ${m.rr_change != null && m.rr_change > 0 ? "text-[#10b981]" : "text-[#ff4655]"}`}>
                            {m.rr_change != null ? (m.rr_change > 0 ? `+${m.rr_change}` : m.rr_change) : "—"}
                          </div>
                          <div className="text-[10px] text-slate-500">RR</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/matches" className="flex items-center justify-center gap-2 text-xs text-[#ff4655] font-bold hover:underline py-2">
                  View all matches <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-10 text-center">
                <Gamepad2 className="mx-auto text-slate-600 mb-3" size={32} />
                <p className="text-slate-400 text-sm font-semibold">No competitive matches found</p>
                <p className="text-slate-500 text-xs mt-1">
                  {full.provider === "mock"
                    ? "Switch USE_MOCK_PROVIDER=false in .env to use real data"
                    : "Play some competitive games and sync again"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Already linked — show reconnect option */}
        {linked && step === "input" && (
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-lg font-black text-[#10b981] shrink-0">
              {linked.gameName[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{linked.gameName}#{linked.tagLine}</div>
              <div className="text-xs text-slate-400 mt-0.5">{VALORANT_REGIONS.find(r => r.value === linked.region)?.label} · Lv. {linked.accountLevel}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Linked {new Date(linked.linkedAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setRiotId(linked.riotId); setRegion(linked.region); setStep("verifying"); handleVerify({ preventDefault: () => {} } as React.FormEvent); }}
                className="bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#ff4655]/20 transition-colors flex items-center gap-1.5">
                <RefreshCw size={11} /> Re-sync
              </button>
              <button onClick={handleDisconnect}
                className="bg-white/5 border border-white/10 text-slate-400 text-xs font-bold px-3 py-2 rounded-lg hover:text-white transition-colors flex items-center gap-1.5">
                <X size={11} /> Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

