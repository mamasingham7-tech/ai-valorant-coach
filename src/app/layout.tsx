import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Valorant Coach - Hyperscale AI Esports Platform",
  description: "Enterprise gaming analytics powered by Multi-Agent AI and Digital Twins. Master recoil, optimize positioning, and coordinate drafts in real time.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/lib/settings/SettingsContext";
import { GoogleProvider } from "@/components/providers/GoogleProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`} suppressHydrationWarning>
        <GoogleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </ThemeProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
