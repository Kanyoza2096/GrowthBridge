import React from 'react';
import { cn } from '@/lib/utils';

export function AdminEmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: {
  icon?: 'inbox' | 'search' | 'lock' | 'file';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    inbox: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5z"/><path d="M4 14h4l1.5 2h5L16 14h4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4.5 4.5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    file: <><path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M10 12h5M10 15.5h5"/></>,
  };

  return (
    <div className={cn('admin-empty-state', className)}>
      <div className="admin-empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icons[icon]}
        </svg>
      </div>
      <h2 className="admin-empty-state__title">{title}</h2>
      {description && <p className="admin-empty-state__description">{description}</p>}
      {action && <div className="admin-empty-state__action">{action}</div>}
    </div>
  );
}
