"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

import { API_BASE } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.detail ?? "Registration failed.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#10b981]" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Account created!</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">Your account is ready. Connect your Riot ID to start coaching.</p>
          <Link href="/auth/login" className="inline-block bg-[#ff4655] hover:bg-[#e03545] text-white font-bold rounded-xl px-6 py-3 transition-all">
            Sign In Now →
          </Link>
        </div>
      </div>
    );
  }

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ff4655", "#f59e0b", "#10b981", "#00f0ff"];

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#ff4655]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#ff4655] rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 shadow-xl shadow-[#ff4655]/30">V</div>
          <h1 className="text-2xl font-extrabold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your AI coaching journey today</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-white/5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655] font-medium">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= pwStrength ? strengthColor[pwStrength] : "rgba(255,255,255,0.08)" }} />
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <input type={showPw ? "text" : "password"} required value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${confirm && confirm !== password ? "border-[#ff4655]/50" : "border-white/10 focus:border-[#ff4655]/50"}`} />
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              {confirm && confirm !== password && <p className="text-[10px] text-[#ff4655] font-semibold">Passwords don't match</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#ff4655] hover:bg-[#e03545] disabled:opacity-50 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ff4655]/20 hover:scale-[1.01]">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4 text-xs font-medium text-slate-500 uppercase tracking-wider before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            Or
          </div>

          <GoogleSignInButton mode="signup" />

          <p className="text-[10px] text-slate-600 text-center leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#ff4655] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
