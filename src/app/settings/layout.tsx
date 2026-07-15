import React from "react";
import Link from "next/link";
import { SettingsSearch } from "@/components/settings/SettingsSearch";

export const metadata = {
  title: "Settings | AI Valorant Coach",
};

const navigation = [
  { name: "Account", href: "/settings/account" },
  { name: "Appearance", href: "/settings/appearance" },
  { name: "Security", href: "/settings/security" },
  { name: "Notifications", href: "/settings/notifications" },
  { name: "Privacy", href: "/settings/privacy" },
  { name: "Accessibility", href: "/settings/accessibility" },
  { name: "Data & Storage", href: "/settings/data" },
  { name: "Language & Region", href: "/settings/language" },
  { name: "Integrations", href: "/settings/integrations" },
  { name: "About", href: "/settings/about" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0f1011]">
      <div className="flex flex-col w-full max-w-7xl mx-auto h-full">
        
        {/* Settings Header */}
        <header className="flex items-center justify-between py-6 px-8 border-b border-white/5 bg-[#0f1011]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          </div>
          <div className="flex-1 max-w-md ml-8">
            <SettingsSearch />
          </div>
        </header>

        {/* Settings Content & Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Settings Sidebar */}
          <aside className="w-64 border-r border-white/5 overflow-y-auto hidden md:block px-6 py-8">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-3xl">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}
