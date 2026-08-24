'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { adminFetch } from '@/lib/api/admin-client';
import type {
  Service,
  Project,
  TalentProfile,
  Application,
  BlogPost,
  Testimonial,
  FAQ,
  Announcement,
  MediaItem,
  MediaFolder,
  Partner,
  AuditLogEntry,
  Settings,
  DashboardStats,
  ChartDataPoint,
} from '@/lib/types/admin';

interface AdminDataContextType {
  services: Service[];
  projects: Project[];
  talent: TalentProfile[];
  applications: Application[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  announcements: Announcement[];
  media: MediaItem[];
  mediaFolders: MediaFolder[];
  partners: Partner[];
  auditLog: AuditLogEntry[];
  settings: Settings | null;
  dashboardStats: DashboardStats | null;
  visitorTrend: ChartDataPoint[];
  applicationTrend: ChartDataPoint[];
  servicePopularity: ChartDataPoint[];
  projectEngagement: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  upsertService: (s: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  upsertProject: (p: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateTalent: (id: string, updates: Partial<TalentProfile>) => Promise<void>;
  approveTalent: (id: string) => Promise<void>;
  rejectTalent: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: string) => Promise<void>;
  addApplicationNote: (id: string, content: string, authorId: string, authorName: string) => Promise<void>;
  upsertBlogPost: (b: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  upsertTestimonial: (t: Partial<Testimonial>) => Promise<void>;
  upsertFAQ: (f: Partial<FAQ>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  upsertAnnouncement: (a: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  upsertPartner: (p: Partial<Partner>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  uploadMedia: (file: File, metadata: Partial<MediaItem>) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
  addAuditLog: (entry: Partial<AuditLogEntry>) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

function unwrap<T>(value: any, key?: string): T {
  const data = value?.data ?? value;
  if (key && data && !Array.isArray(data) && Array.isArray(data[key])) return data[key] as T;
  return data as T;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [visitorTrend, setVisitorTrend] = useState<ChartDataPoint[]>([]);
  const [applicationTrend, setApplicationTrend] = useState<ChartDataPoint[]>([]);
  const [servicePopularity, setServicePopularity] = useState<ChartDataPoint[]>([]);
  const [projectEngagement, setProjectEngagement] = useState<ChartDataPoint[]>([]);
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
        read<Service[]>('services', 'services'),
        read<Project[]>('projects', 'projects'),
        read<TalentProfile[]>('talent', 'talent'),
        read<Application[]>('applications', 'applications'),
        read<BlogPost[]>('blog', 'posts'),
        read<Testimonial[]>('testimonials', 'testimonials'),
        read<FAQ[]>('faqs', 'faqs'),
        read<Announcement[]>('announcements', 'announcements'),
        read<MediaItem[]>('media', 'media'),
        read<MediaFolder[]>('media-folders', 'folders'),
        read<Partner[]>('partners', 'partners'),
        read<AuditLogEntry[]>('audit-logs', 'logs'),
        read<Settings>('settings'),
        read<DashboardStats>('dashboard', 'stats'),
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

  const mutate = useCallback(async <T extends { id?: string }>(resource: string, value: Partial<T>, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    const method = value.id ? 'PUT' : 'POST';
    const endpoint = value.id
      ? `/api/admin/data/${resource}/${encodeURIComponent(value.id)}`
      : `/api/admin/data/${resource}`;
    const saved = unwrap<T>(await adminFetch(endpoint, { method, body: JSON.stringify(value) }));
    setter((current) => (value.id ? current.map((item) => (item.id === value.id ? saved : item)) : [...current, saved]));
  }, []);

  const remove = useCallback(async <T extends { id?: string }>(resource: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    await adminFetch(`/api/admin/data/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setter((current) => current.filter((item) => item.id !== id));
  }, []);

  const upsertService = useCallback((s: Partial<Service>) => mutate('services', s, setServices), [mutate]);
  const deleteService = useCallback((id: string) => remove('services', id, setServices), [remove]);
  const upsertProject = useCallback((p: Partial<Project>) => mutate('projects', p, setProjects), [mutate]);
  const deleteProject = useCallback((id: string) => remove('projects', id, setProjects), [remove]);
  const updateTalent = useCallback((id: string, updates: Partial<TalentProfile>) => mutate('talent', { ...updates, id }, setTalent), [mutate]);
  const approveTalent = useCallback((id: string) => updateTalent(id, { verificationStatus: 'verified' }), [updateTalent]);
  const rejectTalent = useCallback((id: string) => updateTalent(id, { verificationStatus: 'unverified' }), [updateTalent]);
  const updateApplicationStatus = useCallback((id: string, status: string) => mutate('applications', { id, status }, setApplications), [mutate]);
  const addApplicationNote = useCallback(async (id: string, content: string, authorId: string, authorName: string) => {
    const current = applications.find((item) => item.id === id);
    const note = { id: crypto.randomUUID(), content, authorId, authorName, createdAt: new Date().toISOString() };
    await mutate('applications', { id, notes: [...(current?.notes ?? []), note] }, setApplications);
  }, [applications, mutate]);
  const upsertBlogPost = useCallback((b: Partial<BlogPost>) => mutate('blog', b, setBlogPosts), [mutate]);
  const deleteBlogPost = useCallback((id: string) => remove('blog', id, setBlogPosts), [remove]);
  const upsertTestimonial = useCallback((t: Partial<Testimonial>) => mutate('testimonials', t, setTestimonials), [mutate]);
  const upsertFAQ = useCallback((f: Partial<FAQ>) => mutate('faqs', f, setFaqs), [mutate]);
  const deleteFAQ = useCallback((id: string) => remove('faqs', id, setFaqs), [remove]);
  const upsertAnnouncement = useCallback((a: Partial<Announcement>) => mutate('announcements', a, setAnnouncements), [mutate]);
  const deleteAnnouncement = useCallback((id: string) => remove('announcements', id, setAnnouncements), [remove]);
  const upsertPartner = useCallback((p: Partial<Partner>) => mutate('partners', p, setPartners), [mutate]);
  const deletePartner = useCallback((id: string) => remove('partners', id, setPartners), [remove]);
  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = unwrap<Settings>(await adminFetch('/api/admin/data/settings', { method: 'PUT', body: JSON.stringify(patch) }));
    setSettings(next);
  }, []);
  const uploadMedia = useCallback(async (file: File, metadata: Partial<MediaItem>) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    const saved = unwrap<MediaItem>(await adminFetch('/api/admin/data/media', { method: 'POST', body: form }));
    setMedia((v) => [saved, ...v]);
    return saved;
  }, []);
  const deleteMedia = useCallback(async (id: string) => { await remove('media', id, setMedia); }, [remove]);
  const addAuditLog = useCallback(async (entry: Partial<AuditLogEntry>) => {
    const saved = unwrap<AuditLogEntry>(await adminFetch('/api/admin/data/audit-logs', { method: 'POST', body: JSON.stringify(entry) }));
    setAuditLog((v) => [saved, ...v]);
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
