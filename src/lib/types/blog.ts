// Blog post type definitions

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string;
}

export interface BlogAuthor {
  name: string;
  avatar: string;
  role: string;
}

export type BlogCategory =
  | 'technology'
  | 'community'
  | 'skills-development'
  | 'entrepreneurship'
  | 'events'
  | 'case-study';

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  technology: 'Technology',
  community: 'Community',
  'skills-development': 'Skills Development',
  entrepreneurship: 'Entrepreneurship',
  events: 'Events',
  'case-study': 'Case Study',
};
