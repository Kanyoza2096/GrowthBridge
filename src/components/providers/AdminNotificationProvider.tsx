'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AdminNotification } from '@/lib/types/admin';
import { adminFetch } from '@/lib/api/admin-client';

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}
const Context = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await adminFetch<any>('/api/admin/data/notifications');
      const data = response?.notifications ?? response?.data ?? response ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load notifications.');
    } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { if (window.location.pathname !== '/admin/login') void load(); else setIsLoading(false); }, [load]);

  const markRead = useCallback(async (id: string) => {
    await adminFetch(`/api/admin/data/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
    setNotifications(v => v.map(n => n.id === id ? {...n, read: true} : n));
  }, []);
  const markAllRead = useCallback(async () => {
    await adminFetch('/api/admin/data/notifications', { method: 'PATCH', body: JSON.stringify({ markAllRead: true }) });
    setNotifications(v => v.map(n => ({...n, read: true})));
  }, []);
  const clearAll = useCallback(async () => {
    await adminFetch('/api/admin/data/notifications', { method: 'DELETE' });
    setNotifications([]);
  }, []);

  return <Context.Provider value={{ notifications, unreadCount: notifications.filter(n => !n.read).length, isLoading, error, markAllRead, markRead, clearAll }}>{children}</Context.Provider>;
}
export function useAdminNotifications() { const ctx = useContext(Context); if (!ctx) throw new Error('useAdminNotifications must be used within AdminNotificationProvider'); return ctx; }
