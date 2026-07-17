"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNotifications, NotificationItem } from '@/hooks/useNotifications';

const getIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="text-green-500 w-5 h-5" />;
    case 'error': return <AlertCircle className="text-red-500 w-5 h-5" />;
    case 'warning': return <AlertCircle className="text-yellow-500 w-5 h-5" />;
    case 'info': default: return <Info className="text-blue-500 w-5 h-5" />;
  }
};

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4655] rounded-full ring-2 ring-[#11161d]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#11161d] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#11161d]/95 backdrop-blur">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-[#ff4655] hover:text-[#ff4655]/80 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                <Bell size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 flex gap-3 hover:bg-white/[0.02] transition-colors relative group ${!notif.isRead ? 'bg-white/[0.04]' : ''}`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655]" />
                    )}
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        {getTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
