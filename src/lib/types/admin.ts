export type AdminRole =
  | 'growthbridge_super_admin'
  | 'growthbridge_admin'
  | 'growthbridge_content_manager'
  | 'growthbridge_project_manager'
  | 'growthbridge_recruiter'
  | 'growthbridge_analyst';

export interface AdminPermission {
  resource: string;
  actions: ('read' | 'create' | 'update' | 'delete')[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  avatar: string;
  permissions: AdminPermission[];
  lastLogin?: string;
  createdAt: string;
}

export type ApplicationType = 'talent' | 'partnership' | 'client' | 'volunteer';
export type ApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'completed';

export interface Application {
  id: string;
  type: ApplicationType;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  role?: string;
  skills?: string[];
  portfolio?: string;
  status: ApplicationStatus;
  assignee?: string;
  notes: ApplicationNote[];
  history: ApplicationHistoryItem[];
  submittedAt: string;
  updatedAt: string;
}

export interface ApplicationNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ApplicationHistoryItem {
  id: string;
  action: string;
  oldStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  actorId: string;
  actorName: string;
  timestamp: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  features: string[];
  status: 'draft' | 'published' | 'archived';
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  description: string;
  longDescription?: string;
  category: string;
  images: string[];
  technologies: string[];
  impactStats: { label: string; value: string }[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar?: string;
  skills: string[];
  experience: number;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'expert';
  portfolio?: string;
  resume?: string;
  availability: 'available' | 'interviewing' | 'hired' | 'unavailable';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  categories: string[];
  appliedAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  coverImage?: string;
  tags: string[];
  category: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  authorAvatar?: string;
  content: string;
  rating: number;
  projectId?: string;
  serviceId?: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  audience: 'public' | 'talent' | 'partners' | 'admin';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  folder: string;
  uploadedBy: string;
  altText?: string;
  createdAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  itemCount: number;
  createdAt: string;
}

export interface Partner {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  industry: string;
  description: string;
  status: 'prospect' | 'active' | 'inactive' | 'terminated';
  partnershipStartDate?: string;
  partnershipEndDate?: string;
  partnershipType: 'sponsor' | 'client' | 'collaborator' | 'vendor';
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject' | 'publish';
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: { field: string; oldValue?: string; newValue?: string }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  type: 'application' | 'contact' | 'partnership' | 'system' | 'content';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  actorName?: string;
}

export interface DashboardStats {
  totalVisitors: number;
  visitorsChange: number;
  activeServices: number;
  servicesChange: number;
  publishedProjects: number;
  projectsChange: number;
  talentApplications: number;
  applicationsChange: number;
  partnerRequests: number;
  partnerChange: number;
  contactSubmissions: number;
  contactChange: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface Settings {
  organization: {
    name: string;
    tagline: string;
    description: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
  };
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage?: string;
  };
  email: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    fromAddress: string;
    fromName: string;
  };
  api: {
    enablePublicApi: boolean;
    rateLimitPerMinute: number;
    apiKeys: { id: string; name: string; key: string; createdAt: string }[];
  };
  features: {
    enableTalentHub: boolean;
    enableBlog: boolean;
    enablePartnerPortal: boolean;
    enablePartnerCarousel?: boolean;
    enableAIAssistant: boolean;
    enableAnalytics: boolean;
    maintenanceMode: boolean;
  };
}
