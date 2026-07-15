"use client";
import AppShell from "@/components/layout/AppShell";
import { useState, useEffect } from "react";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";
import { Play, ExternalLink, Clock, Star, Zap, Trophy, Target } from "lucide-react";

type Drill = {
  id: string; title: string; category: string; difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: string; xp: number; rank: string; purpose: string;
  videos: Array<{ creator: string; url: string; platform: string }>;
  metric?: string;
  improvement?: string;
};

const DRILLS: Drill[] = [
  {
    id: "counter-strafe",
    title: "Counter-Strafe Accuracy",
    category: "Movement",
    difficulty: "Intermediate",
    duration: "15 min",
    xp: 120,
    rank: "Silver+",
    purpose: "Reduce first-bullet inaccuracy from movement. Critical for all duelist agents.",
    metric: "Avg HS%",
    improvement: "Improves first-bullet placement — directly raises HS%",
    videos: [
      { creator: "Woohoojin",  url: "https://www.youtube.com/results?search_query=woohoojin+counter+strafe+valorant",  platform: "YouTube" },
      { creator: "Sero",       url: "https://www.youtube.com/results?search_query=sero+counter+strafe+valorant",       platform: "YouTube" },
      { creator: "SkillCapped", url: "https://www.youtube.com/results?search_query=skillcapped+counter+strafe+valorant", platform: "YouTube" },
    ],
  },
  {
    id: "crosshair-placement",
    title: "Crosshair Placement",
    category: "Aim",
    difficulty: "Beginner",
    duration: "20 min",
    xp: 80,
    rank: "Iron+",
    purpose: "Keep crosshair at head-level at all times. The single highest-impact habit to develop.",
    metric: "Avg HS%",
    improvement: "Raises HS% by 5-15% within 1 week of consistent practice",
    videos: [
      { creator: "Woohoojin",  url: "https://www.youtube.com/results?search_query=woohoojin+crosshair+placement+valorant", platform: "YouTube" },
      { creator: "RoyalG",     url: "https://www.youtube.com/results?search_query=royalg+crosshair+placement+valorant",    platform: "YouTube" },
      { creator: "Voltaic",    url: "https://www.youtube.com/results?search_query=voltaic+valorant+aim+training",          platform: "YouTube" },
    ],
  },
  {
    id: "flick-training",
    title: "Flick Aim Training",
    category: "Aim",
    difficulty: "Advanced",
    duration: "25 min",
    xp: 200,
    rank: "Gold+",
    purpose: "Build fast-twitch muscle memory for unexpected angles and flanks.",
    metric: "Avg Kills",
    improvement: "Increases duel win rate and kill consistency",
    videos: [
      { creator: "Aim Lab",    url: "https://www.youtube.com/results?search_query=aim+lab+flick+training+valorant", platform: "YouTube" },
      { creator: "Voltaic",    url: "https://www.youtube.com/results?search_query=voltaic+flick+scenario",         platform: "YouTube" },
      { creator: "SkillCapped", url: "https://www.youtube.com/results?search_query=skillcapped+aim+valorant",      platform: "YouTube" },
    ],
  },
  {
    id: "spray-control",
    title: "Spray Control Patterns",
    category: "Aim",
    difficulty: "Intermediate",
    duration: "20 min",
    xp: 150,
    rank: "Bronze+",
    purpose: "Learn Vandal and Phantom spray patterns to control full-auto recoil accurately.",
    videos: [
      { creator: "ProGuides",  url: "https://www.youtube.com/results?search_query=proguides+spray+control+valorant", platform: "YouTube" },
      { creator: "SkillCapped", url: "https://www.youtube.com/results?search_query=skillcapped+recoil+control+valorant", platform: "YouTube" },
      { creator: "Sero",       url: "https://www.youtube.com/results?search_query=sero+valorant+spray+pattern",    platform: "YouTube" },
    ],
  },
  {
    id: "peeking",
    title: "Peeking & Jiggle Peek",
    category: "Positioning",
    difficulty: "Intermediate",
    duration: "15 min",
    xp: 120,
    rank: "Silver+",
    purpose: "Peek angles safely using jiggle, wide, and lurk peeks to gain information without dying.",
    videos: [
      { creator: "Woohoojin",  url: "https://www.youtube.com/results?search_query=woohoojin+peeking+valorant", platform: "YouTube" },
      { creator: "ProGuides",  url: "https://www.youtube.com/results?search_query=proguides+peeking+valorant", platform: "YouTube" },
    ],
  },
  {
    id: "utility-timing",
    title: "Utility Timing & Lineups",
    category: "Strategy",
    difficulty: "Expert",
    duration: "30 min",
    xp: 250,
    rank: "Platinum+",
    purpose: "Master agent-specific lineups and utility timing for site executes and post-plant.",
    metric: "Avg Assists",
    improvement: "Increases assist rate and team coordination score",
    videos: [
      { creator: "Woohoojin",  url: "https://www.youtube.com/results?search_query=woohoojin+utility+valorant", platform: "YouTube" },
      { creator: "RoyalG",     url: "https://www.youtube.com/results?search_query=royalg+lineups+valorant",   platform: "YouTube" },
      { creator: "ProGuides",  url: "https://www.youtube.com/results?search_query=proguides+lineups+valorant", platform: "YouTube" },
    ],
  },
  {
    id: "economy",
    title: "Economy Management",
    category: "Strategy",
    difficulty: "Intermediate",
    duration: "10 min",
    xp: 100,
    rank: "Iron+",
    purpose: "Learn when to save, force-buy, and full-buy to maintain team economy across rounds.",
    videos: [
      { creator: "SkillCapped", url: "https://www.youtube.com/results?search_query=skillcapped+economy+valorant",  platform: "YouTube" },
      { creator: "ProGuides",   url: "https://www.youtube.com/results?search_query=proguides+economy+valorant",   platform: "YouTube" },
    ],
  },
  {
    id: "clutch",
    title: "Clutch Situations",
    category: "Decision Making",
    difficulty: "Expert",
    duration: "20 min",
    xp: 300,
    rank: "Diamond+",
    purpose: "Practice 1v2 and 1v3 clutch scenarios — slow down, gather info, isolate duels.",
    videos: [
      { creator: "Woohoojin",   url: "https://www.youtube.com/results?search_query=woohoojin+clutch+valorant",   platform: "YouTube" },
      { creator: "SkillCapped", url: "https://www.youtube.com/results?search_query=skillcapped+clutch+valorant", platform: "YouTube" },
      { creator: "Voltaic",     url: "https://www.youtube.com/results?search_query=voltaic+clutch+practice",     platform: "YouTube" },
    ],
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#10b981", Intermediate: "#f59e0b", Advanced: "#8b5cf6", Expert: "#ff4655",
};

const CATEGORY_COLORS: Record<string, string> = {
  Aim: "#ff4655", Movement: "#00c8c8", Positioning: "#8b5cf6", Strategy: "#f59e0b", "Decision Making": "#10b981",
};

export default function TrainingPage() {
  const { linked, isMounted } = useLinkedAccount();
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Aim", "Movement", "Positioning", "Strategy", "Decision Making"];

  const filtered = DRILLS.filter(d => filter === "All" || d.category === filter);

  // Personalize recommendations based on actual stats (if linked)
  // In real impl these would come from API; for now we show drill recommendations based on thresholds
  function getAIReason(drill: Drill): string | null {
    if (!linked) return null;
    // These thresholds would normally use real stats from the API
    if (drill.id === "crosshair-placement" || drill.id === "flick-training") {
      return `Recommended because improving HS% and aim consistency are universal priorities.`;
    }
    if (drill.id === "utility-timing" || drill.id === "clutch") {
      return `High-impact drill for advancing to higher ranks.`;
    }
    return null;
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-white">Training Hub</h1>
          <p className="text-slate-400 text-sm mt-1">
            {!isMounted ? "Connect your Riot account for personalized AI drill recommendations" : linked
              ? `Personalized drills for ${linked.gameName} — connect data drives recommendations`
              : "Connect your Riot account for personalized AI drill recommendations"}
          </p>
        </div>

        {/* XP total display */}
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center">
            <Trophy size={18} className="text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">AVAILABLE DRILLS</p>
            <p className="text-white font-extrabold">{DRILLS.length} drills · {DRILLS.reduce((s, d) => s + d.xp, 0).toLocaleString()} total XP</p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-xs text-slate-400">Categories</p>
            <p className="text-white font-bold text-sm">5 skill areas</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === c
                  ? "bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/8 hover:text-white border border-white/10"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Drills grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(drill => {
            const aiReason = getAIReason(drill);
            const catColor = CATEGORY_COLORS[drill.category] ?? "#6b7280";
            const difColor = DIFFICULTY_COLORS[drill.difficulty];

            return (
              <div key={drill.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all flex flex-col">
                {/* Card header */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                          style={{ color: catColor, background: `${catColor}15`, borderColor: `${catColor}30` }}>
                          {drill.category}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                          style={{ color: difColor, background: `${difColor}15`, borderColor: `${difColor}30` }}>
                          {drill.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white">{drill.title}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[#f59e0b]">+{drill.xp} XP</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{drill.purpose}</p>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={10} /> {drill.duration}</span>
                    <span className="flex items-center gap-1"><Star size={10} /> {drill.rank}</span>
                    {drill.metric && <span className="flex items-center gap-1"><Target size={10} /> {drill.metric}</span>}
                  </div>

                  {/* Expected improvement */}
                  {drill.improvement && (
                    <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-lg p-2.5">
                      <p className="text-[10px] text-[#10b981] font-semibold flex items-center gap-1">
                        <Zap size={9} /> {drill.improvement}
                      </p>
                    </div>
                  )}

                  {/* AI personalized reason */}
                  {aiReason && (
                    <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 rounded-lg p-2.5">
                      <p className="text-[10px] text-[#8b5cf6] font-semibold flex items-start gap-1">
                        <span className="shrink-0 mt-0.5">🤖</span> {aiReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* YouTube links */}
                <div className="border-t border-white/5 p-4 space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Play size={9} /> Watch Drill
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {drill.videos.map(v => (
                      <a key={v.creator} href={v.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#ff0000]/10 hover:bg-[#ff0000]/20 border border-[#ff0000]/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                        <ExternalLink size={9} className="text-[#ff4444]" /> {v.creator}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
