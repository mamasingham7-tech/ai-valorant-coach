"use client";
import AppShell from "@/components/layout/AppShell";
import { useParams } from "next/navigation";

const MATCH_DATA: Record<string, { map: string; agent: string; score: string; result: string; rounds: Array<{ n: number; outcome: string; side: string; note: string; eco: string }>; }> = {
  m1: {
    map: "Haven", agent: "Jett", score: "13–8", result: "WIN",
    rounds: [
      { n: 1,  outcome: "WIN",  side: "ATK", note: "A-site execute with flash smoke combo",         eco: "Full buy"  },
      { n: 2,  outcome: "WIN",  side: "ATK", note: "Pistol follow-up on B-short",                   eco: "Pistol"    },
      { n: 3,  outcome: "LOSS", side: "ATK", note: "Forced buy — C-long hold failed",               eco: "Force buy" },
      { n: 4,  outcome: "WIN",  side: "ATK", note: "A-long peek + updraft kill",                    eco: "Full buy"  },
      { n: 5,  outcome: "WIN",  side: "ATK", note: "Post-plant hold on A-site",                     eco: "Full buy"  },
      { n: 6,  outcome: "LOSS", side: "ATK", note: "B-site retake failed after bad rotation",       eco: "Full buy"  },
      { n: 7,  outcome: "WIN",  side: "DEF", note: "B-site hold from B-lobby",                      eco: "Full buy"  },
      { n: 8,  outcome: "WIN",  side: "DEF", note: "A-retake success with Sage wall",               eco: "Full buy"  },
    ],
  },
  m2: {
    map: "Bind", agent: "Reyna", score: "13–11", result: "WIN",
    rounds: [
      { n: 1, outcome: "WIN",  side: "DEF", note: "A-short hold + dismiss chain",  eco: "Full buy"  },
      { n: 2, outcome: "LOSS", side: "DEF", note: "Lost B-elbow angle",            eco: "Pistol"    },
      { n: 3, outcome: "WIN",  side: "ATK", note: "B-execute with molly stall",    eco: "Full buy"  },
    ],
  },
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const match = MATCH_DATA[id] ?? MATCH_DATA["m1"];

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${match.result === "WIN" ? "bg-[#10b981]/15 text-[#10b981]" : "bg-[#ff4655]/15 text-[#ff4655]"}`}>
                {match.result}
              </span>
              <h1 className="text-xl font-extrabold text-white">{match.map}</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">{match.agent} · {match.score}</p>
          </div>
          <div className="glass-card rounded-xl px-5 py-3 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Coach Score</div>
            <div className="text-3xl font-black text-[#00f0ff] mt-1">82<span className="text-base text-slate-400">/100</span></div>
          </div>
        </div>

        {/* Round Timeline */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Round-by-Round Breakdown</h2>
          <div className="space-y-2">
            {match.rounds.map((r) => (
              <div key={r.n} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${r.outcome === "WIN" ? "bg-[#10b981]/15 text-[#10b981]" : "bg-[#ff4655]/15 text-[#ff4655]"}`}>
                  {r.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{r.note}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{r.side} · {r.eco}</div>
                </div>
                <div className={`text-xs font-bold shrink-0 ${r.outcome === "WIN" ? "text-[#10b981]" : "text-[#ff4655]"}`}>{r.outcome}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="glass-card rounded-2xl p-6 border-l-2 border-[#00f0ff]">
          <h3 className="text-sm font-bold text-[#00f0ff] uppercase tracking-wider mb-3">AI Coach Summary</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Strong A-site control and post-plant management. Your updraft duels on A-long were effective in rounds 4 and 5.
            However, rotation speed on B-site calls needs improvement — you lost 2 rounds due to late rotations. Focus drill: Bind rotation timing workshops.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
