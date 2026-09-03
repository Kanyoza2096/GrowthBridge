'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader, AdminToolbar } from '@/components/admin/AdminPageHeader';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { adminFetch } from '@/lib/api/admin-client';
import type { AdminRole } from '@/lib/types/admin';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  lastSignInAt?: string;
}

const ROLES: { value: AdminRole; label: string; description: string }[] = [
  { value: 'growthbridge_super_admin', label: 'Super Admin', description: 'Full platform access and user/role management.' },
  { value: 'growthbridge_admin', label: 'Organization Admin', description: 'Broad operational access without user administration.' },
  { value: 'growthbridge_content_manager', label: 'Content Manager', description: 'Content, media and read-only operational visibility.' },
  { value: 'growthbridge_project_manager', label: 'Project Manager', description: 'Projects, media and partner visibility.' },
  { value: 'growthbridge_recruiter', label: 'Recruiter', description: 'Talent profiles and applications.' },
  { value: 'growthbridge_analyst', label: 'Analyst', description: 'Read-only dashboard and analytics.' },
];

function RoleBadge({ role }: { role: AdminRole }) {
  const label = ROLES.find((r) => r.value === role)?.label || role;
  return <Badge variant={role === 'growthbridge_super_admin' ? 'orange' : role === 'growthbridge_admin' ? 'green' : 'gray'}>{label}</Badge>;
}

function UserEditor({ user, onSaved, onClose }: { user?: ManagedUser; onSaved: (u: ManagedUser) => void; onClose: () => void }) {
  const { success, error } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [role, setRole] = useState<AdminRole>(user?.role || 'growthbridge_analyst');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const path = user ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const body = user ? { name, department, role } : { name, email, department, role, password };
      const saved = await adminFetch<ManagedUser>(path, { method: user ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      onSaved(saved);
      success(user ? 'User Updated' : 'User Created', `${saved.name} now has the ${ROLES.find((r) => r.value === saved.role)?.label} role.`);
      onClose();
    } catch (err) {
      error(user ? 'Unable to Update User' : 'Unable to Create User', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="user-editor-title">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Close user editor" onClick={onClose} />
      <Card variant="admin" className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="admin-eyebrow">Access control</p>
            <h2 id="user-editor-title" className="text-xl font-bold text-[var(--admin-text-primary)]">{user ? 'Edit user' : 'Add team member'}</h2>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Provision a Growthbridge admin account and assign the least privilege required.</p>
          </div>
          <button onClick={onClose} className="gb-touch-target rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]" aria-label="Close">×</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
          {!user && <Input label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" />}
          {!user && <Input label="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" placeholder="At least 12 characters" />}
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={120} placeholder="e.g. Operations" />
          <div>
            <label htmlFor="user-role" className="block text-xs font-semibold text-[var(--admin-text-secondary)] mb-1.5">Role</label>
            <select id="user-role" value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className="w-full min-h-11 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-deep)] px-3 text-sm text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <p className="text-[11px] text-[var(--admin-text-tertiary)] mt-2">{ROLES.find((r) => r.value === role)?.description}</p>
          </div>
          {!user && <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] p-3 text-[11px] text-[var(--admin-text-secondary)]">The account is confirmed by the server and activated immediately. Store the temporary password securely and share it through an appropriate private channel.</div>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : user ? 'Save changes' : 'Create account'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user, hasPermission } = useAdminAuth();
  const { error, success } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [editor, setEditor] = useState<ManagedUser | 'new' | null>(null);

  const load = async () => {
    setLoading(true);
    try { setUsers(await adminFetch<ManagedUser[]>('/api/admin/users')); }
    catch (err) { error('Unable to Load Users', err instanceof Error ? err.message : 'Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'growthbridge_super_admin') load(); }, [user?.role]);

  const filtered = useMemo(() => users.filter((u) => {
    const q = query.trim().toLowerCase();
    return (!q || `${u.name} ${u.email} ${u.department}`.toLowerCase().includes(q)) && (roleFilter === 'all' || u.role === roleFilter);
  }), [users, query, roleFilter]);

  if (!hasPermission('users', 'read')) {
    router.replace('/admin');
    return null;
  }

  const toggleActive = async (target: ManagedUser) => {
    if (target.id === user?.id) return;
    try {
      const saved = await adminFetch<ManagedUser>(`/api/admin/users/${target.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !target.isActive }) });
      setUsers((current) => current.map((u) => u.id === saved.id ? saved : u));
      success(saved.isActive ? 'Account Activated' : 'Account Deactivated', `${saved.name} is now ${saved.isActive ? 'active' : 'inactive'}.`);
    } catch (err) { error('Unable to Update Account', err instanceof Error ? err.message : 'Please try again.'); }
  };

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader eyebrow="Access control" title="Users & Roles" description="Provision staff accounts, assign least-privilege roles, and control active access to the Growthbridge Control Center." actions={<Button variant="primary" onClick={() => setEditor('new')}>Add user</Button>} />
      <AdminToolbar>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or department…" className="w-full sm:w-72" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="min-h-11 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)] px-3 text-sm text-[var(--admin-text-primary)]">
          <option value="all">All roles</option>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <span className="text-xs text-[var(--admin-text-tertiary)] sm:ml-auto">{filtered.length} of {users.length} accounts</span>
      </AdminToolbar>

      {loading ? <Card variant="admin" className="h-72 animate-pulse" /> : users.length === 0 ? <AdminEmptyState title="No staff accounts" description="Create the first managed account for your Growthbridge team." actionLabel="Add user" onAction={() => setEditor('new')} /> : (
        <Card variant="admin" className="p-0 overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_150px_110px_150px] gap-4 px-5 py-3 border-b border-[var(--admin-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-tertiary)]"> <span>User</span><span>Department</span><span>Role</span><span>Status</span><span className="text-right">Actions</span></div>
          <div className="divide-y divide-[var(--admin-border)]">
            {filtered.map((u) => <div key={u.id} className="grid md:grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_150px_110px_150px] gap-3 md:gap-4 p-4 sm:p-5 items-center">
              <div className="min-w-0 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] flex items-center justify-center font-bold shrink-0">{u.name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="font-semibold text-sm text-[var(--admin-text-primary)] truncate">{u.name}{u.id === user?.id && <span className="ml-2 text-[10px] text-[var(--admin-accent)]">YOU</span>}</p><p className="text-xs text-[var(--admin-text-secondary)] truncate">{u.email}</p></div></div>
              <div className="text-xs text-[var(--admin-text-secondary)] truncate">{u.department || '—'}</div>
              <div><RoleBadge role={u.role} /></div>
              <div><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.isActive ? 'text-emerald-300' : 'text-[var(--admin-text-tertiary)]'}`}><span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />{u.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="flex md:justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => setEditor(u)}>Edit</Button><Button variant="ghost" size="sm" disabled={u.id === user?.id} onClick={() => toggleActive(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</Button></div>
            </div>)}
          </div>
          {filtered.length === 0 && <div className="p-12"><AdminEmptyState title="No matching users" description="Try a different search or role filter." /></div>}
        </Card>
      )}
      {editor && <UserEditor user={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSaved={(saved) => setUsers((current) => current.some((u) => u.id === saved.id) ? current.map((u) => u.id === saved.id ? saved : u) : [saved, ...current])} />}
    </div>
  );
}
