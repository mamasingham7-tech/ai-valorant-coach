"use client";

import React, { useState, useEffect } from 'react';
import { SettingsCard } from '@/components/settings/SettingsCard';
import { SettingsButton } from '@/components/settings/SettingsButton';

export default function AccountSettingsPage() {
  const [user, setUser] = useState<{ email: string; role: string; is_verified: boolean } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(
          decodeURIComponent(
            atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        );
    // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({
          email: payload.email || payload.sub || 'User',
          role: payload.role || 'user',
          is_verified: payload.is_verified || false
        });
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Account</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Manage your account profile and credentials.
        </p>
      </div>

      <SettingsCard title="Profile Information" description="Your personal information.">
        <div className="py-4 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">Email Address</p>
            <p className="text-sm text-zinc-400">{user?.email || 'Not available'}</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium rounded-md bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">
            Change
          </button>
        </div>
        <div className="py-4 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">Role</p>
            <p className="text-sm text-zinc-400 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
        <div className="py-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">Verification Status</p>
            <p className="text-sm text-zinc-400">
              {user?.is_verified ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Verified
                </span>
              ) : 'Unverified'}
            </p>
          </div>
          {!user?.is_verified && (
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-[#ff4655] text-white hover:bg-[#ff4655]/90 transition-colors">
              Verify Email
            </button>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="Danger Zone" description="Irreversible account actions.">
        <SettingsButton
          id="account.delete"
          title="Delete Account"
          description="Permanently delete your account and all associated data."
          danger={true}
          buttonText="Delete"
        />
      </SettingsCard>
    </div>
  );
}
