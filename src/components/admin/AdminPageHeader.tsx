import React from 'react';
import { cn } from '@/lib/utils';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('admin-page-header', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="admin-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="admin-title">{title}</h1>
        {description && <p className="admin-subtitle">{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </header>
  );
}

export function AdminToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('admin-toolbar', className)}>{children}</div>;
}

export function AdminPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('admin-panel', className)}>{children}</section>;
}

export function AdminSection({ title, description, actions, children, className }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('admin-section', className)}>
      <div className="admin-section__header">
        <div className="min-w-0">
          <h2 className="admin-section__title">{title}</h2>
          {description && <p className="admin-section__description">{description}</p>}
        </div>
        {actions && <div className="admin-section__actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
