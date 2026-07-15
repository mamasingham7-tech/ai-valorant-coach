"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0e11] text-white selection:bg-primary/30 selection:text-white">
      {/* Navbar header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white text-lg tracking-wider">
            V
          </div>
          <span className="font-extrabold text-sm tracking-widest text-white">AI COACH</span>
        </div>
        <Link 
          href="/dashboard" 
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Open Coach Portal</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-bold mb-8">
          <Sparkles size={12} />
          <span>PHASE 10 HYPERSCALE ACTIVE</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Coaching the Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">
            Generation of Champions
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
          Esports analytics powered by Multi-Agent AI and Digital Twins. Master recoil, optimize positioning, and coordinate drafts in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/dashboard"
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/20 transition-all w-full sm:w-auto cursor-pointer"
          >
            Get Started Free
          </Link>
          <a 
            href="#features"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-8 py-4 rounded-xl transition-all w-full sm:w-auto cursor-pointer"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl font-extrabold text-center mb-16 tracking-tight">AI Coaching Ecosystem</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-xl font-bold mb-4">Live Play Overlay</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              WS telemetry metrics overlays tracking win probability margins, combat indexes, and focus/fatigue updates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue mb-6">
              <Sparkles size={22} />
            </div>
            <h3 className="text-xl font-bold mb-4">Digital Twin Simulation</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Explore decision trees counterfactual paths. Optimize aggression and peeking rates using simulated DNA splits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className="w-12 h-12 bg-purple/10 rounded-xl flex items-center justify-center text-purple mb-6">
              <Users size={22} />
            </div>
            <h3 className="text-xl font-bold mb-4">Esports Playbooks</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Manage custom agent drafts, communication overlap indices, and strategy defaults maps executes.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 text-center">
        <h2 className="text-3xl font-extrabold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-16">
          Level up your gameplay with zero-lockin pricing plans.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Free Plan</span>
            <div className="flex items-baseline gap-1 mt-4 mb-6">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-slate-400 text-xs font-medium">/month</span>
            </div>
            <ul className="space-y-3 text-slate-300 text-sm mb-8 font-medium">
              <li className="flex items-center gap-2">✓ Match Telemetry Logs</li>
              <li className="flex items-center gap-2">✓ Basic Drill Packs</li>
            </ul>
            <Link 
              href="/dashboard"
              className="block text-center bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Radiant Plan */}
          <div className="glass-card p-8 rounded-2xl border border-primary/30 text-left relative">
            <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              POPULAR
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Radiant Plan</span>
            <div className="flex items-baseline gap-1 mt-4 mb-6">
              <span className="text-4xl font-extrabold">$15</span>
              <span className="text-slate-400 text-xs font-medium">/month</span>
            </div>
            <ul className="space-y-3 text-slate-300 text-sm mb-8 font-medium">
              <li className="flex items-center gap-2 text-primary">✓ Live Overlay Dashboard</li>
              <li className="flex items-center gap-2">✓ Digital Twin counterfactual paths</li>
              <li className="flex items-center gap-2">✓ Custom visual AI workflows</li>
            </ul>
            <Link 
              href="/dashboard"
              className="block text-center bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-colors cursor-pointer"
            >
              Unlock Radiant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-xs font-medium">
        <p>© 2026 AI Valorant Coach Backend & Frontend Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
