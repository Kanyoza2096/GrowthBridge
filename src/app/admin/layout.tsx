'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth, ROLE_LABELS } from '@/components/providers/AdminAuthProvider';
import { ThemeProvider, useTheme, noFlashThemeScript } from '@/components/providers/ThemeProvider';
import { AdminNotificationProvider, useAdminNotifications } from '@/components/providers/AdminNotificationProvider';
import { AdminDataProvider } from '@/components/providers/AdminDataProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '📊', resource: 'dashboard', badgeCount: null },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Services', href: '/admin/services', icon: '⚙️', resource: 'services', badgeCount: null },
      { label: 'Projects', href: '/admin/projects', icon: '🚀', resource: 'projects', badgeCount: null },
      { label: 'Applications', href: '/admin/applications', icon: '📝', resource: 'applications', badgeCount: null },
      { label: 'Inquiries', href: '/admin/inquiries', icon: '📥', resource: 'applications', badgeCount: null },
    ],
  },
  {
    section: 'People & Partners',
    items: [
      { label: 'People Directory', href: '/admin/people', icon: '👔', resource: 'talent', badgeCount: null },
      { label: 'Talent Hub', href: '/admin/talent', icon: '👥', resource: 'talent', badgeCount: null },
      { label: 'Partners', href: '/admin/partners', icon: '🤝', resource: 'partners', badgeCount: null },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Blog Posts', href: '/admin/blog', icon: '📰', resource: 'content', badgeCount: null },
      { label: 'Testimonials', href: '/admin/testimonials', icon: '💬', resource: 'content', badgeCount: null },
      { label: 'FAQs', href: '/admin/faqs', icon: '❓', resource: 'content', badgeCount: null },
      { label: 'Announcements', href: '/admin/announcements', icon: '📢', resource: 'content', badgeCount: null },
      { label: 'Media Library', href: '/admin/media', icon: '🖼️', resource: 'media', badgeCount: null },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: '⚡', resource: 'settings', badgeCount: null },
    ],
  },
];

function SidebarItem({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: (typeof NAV_SECTIONS)[0]['items'][0];
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
        active
          ? 'bg-[var(--gb-green-600)]/20 text-[var(--chip-green-text)] border border-[var(--gb-green-600)]/40'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]',
        collapsed && 'justify-center px-2.5'
      )}
    >
      <span className={cn('text-base flex-shrink-0', collapsed && 'text-lg')}>{item.icon}</span>
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
    </Link>
  );
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAllRead, markRead } = useAdminNotifications();
  const { hasPermission } = useAdminAuth();
  const canView = hasPermission('notifications', 'read');

  if (!canView) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-[var(--text-secondary)]">You don&apos;t have permission to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="w-96 max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Notifications</h3>
          <p className="text-[11px] text-[var(--text-secondary)]">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="text-[10px] font-semibold text-[var(--chip-green-text)] hover:text-[var(--gb-green-600)] px-2 py-1 rounded hover:bg-[var(--chip-green-bg)] cursor-pointer"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {notifications.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">No notifications</div>
        )}
        {notifications.map((n) => {
          const icons: Record<string, string> = {
            application: '👤',
            partnership: '🤝',
            contact: '✉️',
            system: '⚙️',
            content: '📰',
          };
          return (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={onClose}
              onMouseEnter={() => !n.read && markRead(n.id)}
              className={cn(
                'block p-3 rounded-xl transition-colors cursor-pointer',
                n.read ? 'hover:bg-[var(--surface-soft)]' : 'bg-[var(--surface-soft)] hover:bg-[var(--surface-subtle)] border-l-2 border-[var(--gb-green-600)]'
              )}
            >
              <div className="flex gap-3">
                <span className="text-lg flex-shrink-0">{icons[n.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-semibold truncate', n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { hasPermission } = useAdminAuth();

  const allItems = useMemo(() => {
    const items: { label: string; href: string; icon: string; section: string }[] = [];
    NAV_SECTIONS.forEach((sec) => {
      sec.items.forEach((i) => {
        if (hasPermission(i.resource, 'read')) {
          items.push({ label: i.label, href: i.href, icon: i.icon, section: sec.section });
        }
      });
    });
    return items;
  }, [hasPermission]);

  const filtered = allItems.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.section.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 sm:p-20">
      <div className="fixed inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-[var(--surface-page)] border border-[var(--border-subtle)] shadow-2xl z-10 overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-4">
          <Input
            placeholder="Search pages, settings, users... (⌘K)"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">No results</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[var(--surface-soft)] cursor-pointer transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{item.section}</p>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">↵</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, canAccessRoute } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useAdminNotifications();
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--gradient-brand)] flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg">
            GB
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Authentication Required</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Please sign in to access the Growthbridge Control Center.
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 rounded-xl bg-[var(--gb-green-600)] text-white text-sm font-bold hover:bg-[var(--gb-green-800)] transition-colors"
          >
            Go to Admin Login →
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessRoute(pathname)) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--danger-bg)] border border-[var(--danger-border)] flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Access Denied</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Your current role does not have permission to view this page.
          </p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 rounded-xl bg-[var(--gb-navy-600)] text-white text-sm font-bold hover:bg-[var(--gb-navy-800)] transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Safe user name handling
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'G';
  const userDisplayName = user?.name || 'Admin User';
  const userDepartment = user?.department || 'Growthbridge';

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 py-3 bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] cursor-pointer"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--gradient-brand)] flex items-center justify-center font-bold text-white text-xs">
            GB
          </div>
          <span className="text-sm font-extrabold text-[var(--text-primary)]">Control Center</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setPaletteOpen(true)}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] cursor-pointer"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Sidebar backdrop (mobile) */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed md:sticky top-0 md:top-0 h-screen z-50 md:z-0 flex-shrink-0 bg-[var(--surface-page)] border-r border-[var(--border-subtle)] transition-all duration-300 flex flex-col',
            collapsed ? 'w-20' : 'w-72',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            'md:block md:translate-x-0'
          )}
        >
          {/* Header */}
          <div className={cn('flex items-center gap-3 p-5 border-b border-[var(--border-subtle)]', collapsed && 'justify-center p-4')}>
            <div className="w-10 h-10 rounded-xl bg-[var(--gradient-brand)] flex items-center justify-center font-bold text-white text-sm shadow-lg flex-shrink-0">
              GB
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] truncate">Control Center</h3>
                <Badge variant="green" className="text-[9px] px-1.5 py-0 mt-1">
                  {user?.role && ROLE_LABELS[user.role] ? ROLE_LABELS[user.role] : 'Guest'}
                </Badge>
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop) */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                'p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] cursor-pointer transition-colors',
                collapsed && 'mx-auto'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {NAV_SECTIONS.map((sec) => {
              const visibleItems = sec.items.filter((i) => canAccessRoute(i.href));
              if (visibleItems.length === 0) return null;
              return (
                <div key={sec.section} className="space-y-1">
                  {!collapsed && (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-3 pb-1">
                      {sec.section}
                    </p>
                  )}
                  {visibleItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Footer: User card */}
          <div className="border-t border-[var(--border-subtle)] p-3 space-y-2 relative">
            <div
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-soft)] transition-colors cursor-pointer text-left',
                collapsed && 'justify-center'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-[var(--gradient-brand)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {userInitial}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">{userDepartment}</p>
                </div>
              )}
            </div>


            {!collapsed && (
              <button
                onClick={() => {
                  logout();
                  router.push('/admin/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition-colors cursor-pointer font-semibold"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 md:top-0 z-30 hidden md:flex items-center gap-4 px-6 py-4 bg-[var(--surface-page)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex-1 max-w-xl flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1">Search pages, settings, users...</span>
              <kbd className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                ⌘K
              </kbd>
            </button>

            <div className="flex-1" />

            {/* Theme toggle */}
            <ThemeToggle size="md" variant="ghost" />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] cursor-pointer transition-colors relative"
                aria-label="Notifications"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 rounded-2xl bg-[var(--surface-page)] border border-[var(--border-subtle)] shadow-2xl z-50 overflow-hidden p-3">
                  <NotificationsPanel onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </div>

            <Link href="/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] cursor-pointer transition-colors" title="View public website">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 md:pb-8 mt-14 md:mt-0">{children}</main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Admin runs a SECOND, independent ThemeProvider with `admin` scope.
          (Different storage key + different default = dark, matching the
          recommendation that dashboards default to dark.)  */}
      <ThemeProvider scope="admin">
        <AdminAuthProvider>
          <AdminNotificationProvider>
            <AdminDataProvider>
              <AdminLayoutContent>{children}</AdminLayoutContent>
            </AdminDataProvider>
          </AdminNotificationProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </>
  );
}
