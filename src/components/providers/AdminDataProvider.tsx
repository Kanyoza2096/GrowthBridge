'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { adminFetch } from '@/lib/api/admin-client';

// Define types (simplified — use `any` for now to fix build)
interface AdminDataContextType {
  services: any[];
  projects: any[];
  talent: any[];
  applications: any[];
  blogPosts: any[];
  testimonials: any[];
  faqs: any[];
  announcements: any[];
  media: any[];
  mediaFolders: any[];
  partners: any[];
  auditLog: any[];
  settings: any;
  dashboardStats: any;
  visitorTrend: any[];
  applicationTrend: any[];
  servicePopularity: any[];
  projectEngagement: any[];
  isLoading: boolean;
  error: string | null;
  upsertService: (s: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  upsertProject: (p: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateTalent: (id: string, updates: any) => Promise<void>;
  approveTalent: (id: string) => Promise<void>;
  rejectTalent: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: string) => Promise<void>;
  addApplicationNote: (id: string, content: string, authorId: string, authorName: string) => Promise<void>;
  upsertBlogPost: (b: any) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  upsertTestimonial: (t: any) => Promise<void>;
  upsertFAQ: (f: any) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  upsertAnnouncement: (a: any) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  upsertPartner: (p: any) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  updateSettings: (patch: any) => Promise<void>;
  uploadMedia: (file: File, metadata: any) => Promise<any>;
  deleteMedia: (id: string) => Promise<void>;
  addAuditLog: (entry: any) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

function unwrap<T>(value: any, key?: string): T {
  const data = value?.data ?? value;
  if (key && data && !Array.isArray(data) && Array.isArray(data[key])) return data[key] as T;
  return data as T;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [talent, setTalent] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [mediaFolders, setMediaFolders] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [visitorTrend, setVisitorTrend] = useState<any[]>([]);
  const [applicationTrend, setApplicationTrend] = useState<any[]>([]);
  const [servicePopularity, setServicePopularity] = useState<any[]>([]);
  const [projectEngagement, setProjectEngagement] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const read = async <T,>(resource: string, key?: string): Promise<T | null> => {
      try {
        return unwrap<T>(await adminFetch(`/api/admin/data/${resource}`), key);
      } catch (e) {
        console.warn(`[Admin] ${resource}:`, e);
        return null;
      }
    };

    try {
      const [s, p, t, a, b, te, f, an, m, mf, pa, al, st, ds, analytics] = await Promise.all([
        read<any[]>('services', 'services'),
        read<any[]>('projects', 'projects'),
        read<any[]>('talent', 'talent'),
        read<any[]>('applications', 'applications'),
        read<any[]>('blog', 'posts'),
        read<any[]>('testimonials', 'testimonials'),
        read<any[]>('faqs', 'faqs'),
        read<any[]>('announcements', 'announcements'),
        read<any[]>('media', 'media'),
        read<any[]>('media-folders', 'folders'),
        read<any[]>('partners', 'partners'),
        read<any[]>('audit-logs', 'logs'),
        read<any>('settings'),
        read<any>('dashboard', 'stats'),
        read<any>('analytics'),
      ]);

      if (s) setServices(s);
      if (p) setProjects(p);
      if (t) setTalent(t);
      if (a) setApplications(a);
      if (b) setBlogPosts(b);
      if (te) setTestimonials(te);
      if (f) setFaqs(f);
      if (an) setAnnouncements(an);
      if (m) setMedia(m);
      if (mf) setMediaFolders(mf);
      if (pa) setPartners(pa);
      if (al) setAuditLog(al);
      if (st) setSettings(st);
      if (ds) setDashboardStats(ds);
      
      if (analytics) {
        setVisitorTrend(analytics.visitorTrend ?? analytics.visitors ?? []);
        setApplicationTrend(analytics.applicationTrend ?? analytics.applications ?? []);
        setServicePopularity(analytics.servicePopularity ?? []);
        setProjectEngagement(analytics.projectEngagement ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
      void load();
    } else {
      setIsLoading(false);
    }
  }, [load]);

  const mutate = useCallback(async <T,>(resource: string, value: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    const method = value.id ? 'PUT' : 'POST';
    const endpoint = value.id
      ? `/api/admin/data/${resource}/${encodeURIComponent(value.id)}`
      : `/api/admin/data/${resource}`;
    const saved = unwrap<T>(await adminFetch(endpoint, { method, body: JSON.stringify(value) }));
    setter((current) => value.id ? current.map((item: any) => item.id === value.id ? saved : item) : [...current, saved]);
  }, []);

  const remove = useCallback(async <T,>(resource: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    await adminFetch(`/api/admin/data/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setter((current: any[]) => current.filter((item) => item.id !== id));
  }, []);

  const upsertService = useCallback((s: any) => mutate('services', s, setServices), [mutate]);
  const deleteService = useCallback((id: string) => remove('services', id, setServices), [remove]);
  const upsertProject = useCallback((p: any) => mutate('projects', p, setProjects), [mutate]);
  const deleteProject = useCallback((id: string) => remove('projects', id, setProjects), [remove]);
  const updateTalent = useCallback((id: string, updates: any) => mutate('talent', { ...updates, id }, setTalent), [mutate]);
  const approveTalent = useCallback((id: string) => updateTalent(id, { verificationStatus: 'verified' }), [updateTalent]);
  const rejectTalent = useCallback((id: string) => updateTalent(id, { verificationStatus: 'unverified' }), [updateTalent]);
  const updateApplicationStatus = useCallback((id: string, status: string) => mutate('applications', { id, status }, setApplications), [mutate]);
  const addApplicationNote = useCallback(async (id: string, content: string, authorId: string, authorName: string) => {
    const current = applications.find((item) => item.id === id);
    const note = { id: crypto.randomUUID(), content, authorId, authorName, createdAt: new Date().toISOString() };
    await mutate('applications', { id, notes: [...(current?.notes ?? []), note] }, setApplications);
  }, [applications, mutate]);
  const upsertBlogPost = useCallback((b: any) => mutate('blog', b, setBlogPosts), [mutate]);
  const deleteBlogPost = useCallback((id: string) => remove('blog', id, setBlogPosts), [remove]);
  const upsertTestimonial = useCallback((t: any) => mutate('testimonials', t, setTestimonials), [mutate]);
  const upsertFAQ = useCallback((f: any) => mutate('faqs', f, setFaqs), [mutate]);
  const deleteFAQ = useCallback((id: string) => remove('faqs', id, setFaqs), [remove]);
  const upsertAnnouncement = useCallback((a: any) => mutate('announcements', a, setAnnouncements), [mutate]);
  const deleteAnnouncement = useCallback((id: string) => remove('announcements', id, setAnnouncements), [remove]);
  const upsertPartner = useCallback((p: any) => mutate('partners', p, setPartners), [mutate]);
  const deletePartner = useCallback((id: string) => remove('partners', id, setPartners), [remove]);
  const updateSettings = useCallback(async (patch: any) => {
    const next = unwrap<any>(await adminFetch('/api/admin/data/settings', { method: 'PUT', body: JSON.stringify(patch) }));
    setSettings(next);
  }, []);
  const uploadMedia = useCallback(async (file: File, metadata: any) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    const saved = unwrap<any>(await adminFetch('/api/admin/data/media', { method: 'POST', body: form }));
    setMedia(v => [saved, ...v]);
    return saved;
  }, []);
  const deleteMedia = useCallback(async (id: string) => { await remove('media', id, setMedia); }, [remove]);
  const addAuditLog = useCallback(async (entry: any) => {
    const saved = unwrap<any>(await adminFetch('/api/admin/data/audit-logs', { method: 'POST', body: JSON.stringify(entry) }));
    setAuditLog(v => [saved, ...v]);
  }, []);

  const value = useMemo<AdminDataContextType>(() => ({
    services, projects, talent, applications, blogPosts, testimonials, faqs, announcements,
    media, mediaFolders, partners, auditLog, settings, dashboardStats,
    visitorTrend, applicationTrend, servicePopularity, projectEngagement,
    isLoading, error,
    upsertService, deleteService, upsertProject, deleteProject,
    updateTalent, approveTalent, rejectTalent, updateApplicationStatus, addApplicationNote,
    upsertBlogPost, deleteBlogPost, upsertTestimonial, upsertFAQ, deleteFAQ,
    upsertAnnouncement, deleteAnnouncement, upsertPartner, deletePartner,
    updateSettings, uploadMedia, deleteMedia, addAuditLog,
  }), [
    services, projects, talent, applications, blogPosts, testimonials, faqs, announcements,
    media, mediaFolders, partners, auditLog, settings, dashboardStats,
    visitorTrend, applicationTrend, servicePopularity, projectEngagement,
    isLoading, error,
    upsertService, deleteService, upsertProject, deleteProject,
    updateTalent, approveTalent, rejectTalent, updateApplicationStatus, addApplicationNote,
    upsertBlogPost, deleteBlogPost, upsertTestimonial, upsertFAQ, deleteFAQ,
    upsertAnnouncement, deleteAnnouncement, upsertPartner, deletePartner,
    updateSettings, uploadMedia, deleteMedia, addAuditLog,
  ]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
}
