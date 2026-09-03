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

function AdminIcon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    services:<><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></>,
    projects:<><path d="M4 19.5V9.8L12 5l8 4.8v9.7"/><path d="M8 19.5v-6h8v6M9 8.5h6"/></>,
    applications:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    inquiries:<><path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4H7a3 3 0 0 1-3-3z"/><path d="M8 8h8M8 11h5"/></>,
    people:<><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M16 15a5 5 0 0 1 4.5 5"/></>,
    talent:<><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0M19 7v4M21 9h-4"/></>,
    partners:<><path d="M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2M9 15l6-6"/></>,
    content:<><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    testimonials:<><path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4 4v-4H7a3 3 0 0 1-3-3z"/><path d="M8 9h.01M12 9h.01M16 9h.01"/></>,
    media:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 2-2 6 6"/></>,
    users:<><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M16 15a5 5 0 0 1 4.5 5"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.8-1.6L13.5 2h-3l-.3 2.8A7 7 0 0 0 7.4 6.4l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.8 1.6l.3 2.8h3l.3-2.8a7 7 0 0 0 2.8-1.6l2.3.9 2-3.4-2-1.5c.1-.5.2-1 .2-1.6z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.dashboard}</svg>;
}

const NAV_SECTIONS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'dashboard', resource: 'dashboard', badgeCount: null },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Services', href: '/admin/services', icon: 'services', resource: 'services', badgeCount: null },
      { label: 'Projects', href: '/admin/projects', icon: 'projects', resource: 'projects', badgeCount: null },
      { label: 'Applications', href: '/admin/applications', icon: 'applications', resource: 'applications', badgeCount: null },
      { label: 'Inquiries', href: '/admin/inquiries', icon: 'inquiries', resource: 'applications', badgeCount: null },
    ],
  },
  {
    section: 'People & Partners',
    items: [
      { label: 'People Directory', href: '/admin/people', icon: 'people', resource: 'people', badgeCount: null },
      { label: 'Talent Hub', href: '/admin/talent', icon: 'talent', resource: 'talent', badgeCount: null },
      { label: 'Partners', href: '/admin/partners', icon: 'partners', resource: 'partners', badgeCount: null },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Blog Posts', href: '/admin/blog', icon: 'content', resource: 'content', badgeCount: null },
      { label: 'Testimonials', href: '/admin/testimonials', icon: 'testimonials', resource: 'content', badgeCount: null },
      { label: 'FAQs', href: '/admin/faqs', icon: 'content', resource: 'content', badgeCount: null },
      { label: 'Announcements', href: '/admin/announcements', icon: 'content', resource: 'content', badgeCount: null },
      { label: 'Media Library', href: '/admin/media', icon: 'media', resource: 'media', badgeCount: null },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: 'users', resource: 'users', badgeCount: null },
      { label: 'Settings', href: '/admin/settings', icon: 'settings', resource: 'settings', badgeCount: null },
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
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-text-primary)] ring-1 ring-inset ring-[var(--gb-green-600)]/25'
          : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-white/[.035]',
        collapsed && 'justify-center px-2.5'
      )}
    >
      <span className={cn('w-5 h-5 flex items-center justify-center flex-shrink-0', active ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-tertiary)] group-hover:text-[var(--admin-text-primary)]')}><AdminIcon name={item.icon} size={17} /></span>
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
        <p className="text-xs text-[var(--admin-text-secondary)]">You don&apos;t have permission to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="w-96 max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-border)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Notifications</h3>
          <p className="text-[11px] text-[var(--admin-text-secondary)]">{unreadCount} unread</p>
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
            className="p-1 rounded text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-white/[.035] cursor-pointer"
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
          <div className="py-12 text-center text-xs text-[var(--admin-text-tertiary)]">No notifications</div>
        )}
        {notifications.map((n) => {
          const icons: Record<string, React.ReactNode> = {
            application: <AdminIcon name="applications" size={16} />,
            partnership: <AdminIcon name="partners" size={16} />,
            contact: <AdminIcon name="inquiries" size={16} />,
            system: <AdminIcon name="settings" size={16} />,
            content: <AdminIcon name="content" size={16} />,
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
                <span className="w-8 h-8 rounded-lg bg-[var(--admin-surface-deep)] border border-[var(--admin-border)] text-[var(--admin-accent)] flex items-center justify-center flex-shrink-0">{icons[n.type] || <AdminIcon name="content" size={16} />}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-semibold truncate', n.read ? 'text-[var(--admin-text-secondary)]' : 'text-[var(--admin-text-primary)]')}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-[var(--admin-text-secondary)] line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-[var(--admin-text-tertiary)] mt-1">
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
      <div className="relative w-full max-w-xl rounded-2xl bg-[var(--surface-page)] border border-[var(--admin-border)] shadow-2xl z-10 overflow-hidden">
        <div className="border-b border-[var(--admin-border)] p-4">
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
            <div className="py-12 text-center text-xs text-[var(--admin-text-tertiary)]">No results</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[var(--admin-surface-soft)] cursor-pointer transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{item.label}</p>
                  <p className="text-[10px] text-[var(--admin-text-tertiary)]">{item.section}</p>
                </div>
                <span className="text-[10px] text-[var(--admin-text-tertiary)]">↵</span>
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg">
            GB
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--admin-text-primary)]">Authentication Required</h2>
          <p className="text-xs text-[var(--admin-text-secondary)]">
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
            <svg className="w-6 h-6 text-[var(--danger-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--admin-text-primary)]">Access Denied</h2>
          <p className="text-xs text-[var(--admin-text-secondary)]">
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
  const currentNav = NAV_SECTIONS.flatMap((section) => section.items).find((item) => item.href !== '/admin' && pathname.startsWith(item.href)) || NAV_SECTIONS[0].items[0];

  return (
    <div className="admin-theme min-h-screen bg-[var(--admin-surface-page)] text-[var(--admin-text-primary)]">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 py-3 bg-[var(--admin-surface-sidebar)] border-b border-[var(--admin-border)] gb-safe-px pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-soft)] cursor-pointer"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center font-bold text-white text-xs">
            GB
          </div>
          <span className="text-sm font-extrabold text-[var(--admin-text-primary)]">Control Center</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setPaletteOpen(true)}
          className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-soft)] cursor-pointer"
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
            'fixed md:sticky top-0 md:top-0 h-screen z-50 md:z-0 flex-shrink-0 bg-[var(--admin-surface-sidebar)] border-r border-[var(--admin-border)] transition-all duration-300 flex flex-col',
            collapsed ? 'w-[76px]' : 'w-[264px]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            'md:block md:translate-x-0'
          )}
        >
          {/* Header */}
          <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-[var(--admin-border)]', collapsed && 'justify-center p-4')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white text-sm shadow-lg flex-shrink-0">
              GB
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div><h3 className="text-sm font-extrabold text-[var(--admin-text-primary)] truncate tracking-tight">GrowthBridge</h3><p className="text-[10px] text-[var(--admin-text-tertiary)] mt-0.5">Operations</p></div>
                <Badge variant="green" className="text-[9px] px-1.5 py-0 mt-1">
                  {user?.role && ROLE_LABELS[user.role] ? ROLE_LABELS[user.role] : 'Guest'}
                </Badge>
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop) */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-[var(--admin-border)]">
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-tertiary)]">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                'p-1.5 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-white/[.035] cursor-pointer transition-colors',
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
                    <p className="admin-eyebrow px-3 pb-1">
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
          <div className="border-t border-[var(--admin-border)] p-3 space-y-2 relative">
            <div
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-soft)] transition-colors cursor-pointer text-left',
                collapsed && 'justify-center'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {userInitial}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--admin-text-primary)] truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-[var(--admin-text-secondary)] truncate">{userDepartment}</p>
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
                <span aria-hidden="true" className="w-4 h-4 flex items-center justify-center">↪</span>
                <span>Sign out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 md:top-0 z-30 hidden md:flex items-center gap-5 px-5 lg:px-7 py-3.5 bg-[var(--admin-surface-page)]/92 backdrop-blur-xl border-b border-[var(--admin-border)]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] text-[var(--admin-text-tertiary)]">
                <span>Workspace</span><span>/</span><span className="text-[var(--admin-text-secondary)]">{currentNav.label}</span>
              </div>
              <div className="text-sm font-bold text-[var(--admin-text-primary)] mt-0.5">{currentNav.label}</div>
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              className="ml-auto w-full max-w-md flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white/[.025] border border-[var(--admin-border)] text-left text-xs text-[var(--admin-text-tertiary)] hover:text-[var(--admin-text-secondary)] hover:border-[var(--admin-border-strong)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1">Search pages, settings, users...</span>
              <kbd className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[var(--surface-subtle)] text-[var(--admin-text-tertiary)] border border-[var(--admin-border)]">
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
                className="p-2.5 rounded-xl text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-white/[.035] cursor-pointer transition-colors relative"
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
                <div className="absolute right-0 top-full mt-2 rounded-2xl bg-[var(--surface-page)] border border-[var(--admin-border)] shadow-2xl z-50 overflow-hidden p-3">
                  <NotificationsPanel onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </div>

            <Link href="/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-white/[.035] cursor-pointer transition-colors" title="View public website">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </header>

          <main className="flex-1 min-w-0 w-full p-4 sm:p-5 md:p-7 lg:p-8 md:pb-10 mt-14 md:mt-0 overflow-x-clip">{children}</main>
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
