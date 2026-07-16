"use client";

import React, { useEffect } from 'react';
import { X, Check, Trash2, Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

type NotificationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const typeIcons = {
  info: <Info className="text-blue-400" size={16} />,
  success: <Check className="text-green-400" size={16} />,
  warning: <AlertTriangle className="text-yellow-400" size={16} />,
  error: <AlertCircle className="text-red-400" size={16} />,
};

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-sm h-full glass-panel border-l border-white/5 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-slate-200" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-end px-4 py-2 border-b border-white/5 bg-white/5">
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <Bell size={48} className="text-slate-400" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">No Notifications</p>
                <p className="text-xs text-slate-400">You're all caught up!</p>
              </div>
            </div>
          ) : (
            notifications.map((notif: Notification) => (
              <div 
                key={notif.id}
                className={`relative group flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  notif.isRead 
                    ? 'bg-transparent border-white/5 opacity-70' 
                    : 'bg-white/5 border-white/10 shadow-lg'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-primary rounded-full" />
                )}
                
                <div className="mt-1 shrink-0 p-1.5 bg-white/5 rounded-full">
                  {typeIcons[notif.type || 'info'] || typeIcons['info']}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-white/10 rounded"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
