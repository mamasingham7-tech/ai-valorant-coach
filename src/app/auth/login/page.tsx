"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // POST to FastAPI /api/v1/auth/login (OAuth2PasswordRequestForm)
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: form.toString(),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.detail ?? "Login failed. Check your credentials.");
      }
      const data = await res.json();
      const token = data?.data?.access_token ?? data?.access_token;
      if (token) {
        localStorage.setItem("access_token", token);
        window.location.href = "/portal";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#ff4655] rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 shadow-xl shadow-[#ff4655]/30">V</div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your AI Coach account</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 border border-white/5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-[#ff4655]/10 border border-[#ff4655]/20 rounded-xl p-3 text-xs text-[#ff4655] font-medium">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot" className="text-[10px] text-[#ff4655] hover:underline font-semibold">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#ff4655] hover:bg-[#e03545] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ff4655]/20 hover:shadow-[#ff4655]/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4 text-xs font-medium text-slate-500 uppercase tracking-wider before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            Or
          </div>

          <GoogleSignInButton mode="login" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] text-slate-600 uppercase tracking-widest">
              <span className="bg-[#11161d] px-3">or continue with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: "Discord", color: "#5865f2", icon: "D" },
            ].map(s => (
              <button key={s.name}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <span className="font-black text-sm" style={{ color: s.color }}>{s.icon}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-[#ff4655] font-bold hover:underline">Sign up</Link>
        </p>

        <p className="text-center text-xs text-slate-600 mt-3">
          <Link href="/dashboard" className="hover:text-slate-400 transition-colors">← Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
