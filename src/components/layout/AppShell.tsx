"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sword, Cpu, Tv, Trophy, User, Settings,
  ChevronLeft, ChevronRight, Search, Bell, Menu, X, Link2, LogIn,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { href: "/matches",   label: "Match Analysis", icon: Sword            },
  { href: "/portal",    label: "Riot Account",   icon: Link2            },
  { href: "/twin",      label: "Digital Twin",   icon: Cpu              },
  { href: "/live",      label: "Live Coaching",  icon: Tv               },
  { href: "/training",  label: "Training",       icon: Trophy           },
  { href: "/profile",   label: "Profile",        icon: User             },
  { href: "/admin",     label: "Admin",          icon: Settings         },
  { href: "/settings",  label: "Settings",       icon: Settings         },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string, initials: string, picture?: string } | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(decodeURIComponent(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
        const email = payload.email || payload.sub || "User";
        const picture = payload.picture;
        
        // Generate initials
        const parts = email.split('@')[0].split(/[._-]/);
        let initials = parts[0].substring(0, 1).toUpperCase();
        if (parts.length > 1 && parts[1].length > 0) {
            initials += parts[1].substring(0, 1).toUpperCase();
        } else {
            initials += parts[0].length > 1 ? parts[0].substring(1, 2).toUpperCase() : "";
        }
        
        setUser({ email, initials, picture });
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e11]">
      {/* ── Mobile overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col border-r border-white/5
          bg-[#11161d]/90 backdrop-blur-xl transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar Toggle */}
        <div className="flex items-center justify-end p-4 pb-0 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                  ${active
                    ? "bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user badge */}
        {!collapsed && (
          <div className="p-4 border-t border-white/5 space-y-2">
            {user && (
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-[#ff4655]/30" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 flex items-center justify-center text-xs font-bold text-[#ff4655]">{user.initials}</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate" title={user.email}>
                    {user.email.split('@')[0].replace(/[0-9]/g, '').replace(/^./, (c) => c.toUpperCase()) || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                </div>
              </div>
            )}
            {user ? (
              <button 
                onClick={() => { localStorage.removeItem('access_token'); setUser(null); window.location.href = '/'; }}
                className="flex items-center justify-center gap-1.5 w-full bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg py-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                <LogIn size={11} className="rotate-180" /> Sign Out
              </button>
            ) : (
              <Link href="/auth/login"
                className="flex items-center justify-center gap-1.5 w-full bg-[#ff4655]/10 hover:bg-[#ff4655]/20 border border-[#ff4655]/30 rounded-lg py-2 text-[10px] font-bold text-[#ff4655] transition-colors">
                <LogIn size={11} /> Sign In / Register
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#11161d]/60 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb */}
            <nav className="text-xs text-slate-500 font-medium hidden sm:block">
              <span className="text-slate-400">{NAV.find(n => pathname.startsWith(n.href))?.label ?? "Home"}</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-slate-500 text-xs hover:border-white/10 transition-colors cursor-text w-44">
              <Search size={12} />
              <span>Search…</span>
              <kbd className="ml-auto bg-white/10 rounded px-1 text-[10px]">⌘K</kbd>
            </div>
            {/* Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4655] rounded-full" />
            </button>
            {/* Avatar */}
            {user ? (
              user.picture ? (
                <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#ff4655]/30 cursor-pointer hover:border-[#ff4655]/60 transition-colors" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 flex items-center justify-center text-[10px] font-bold text-[#ff4655] cursor-pointer hover:border-[#ff4655]/60 transition-colors">
                  {user.initials}
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-white/10 transition-colors">
                <User size={14} />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
