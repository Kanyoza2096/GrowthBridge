// Person & People Module Type Definitions

export type PersonCategory =
  | 'team'
  | 'advisor'
  | 'board'
  | 'alumni'
  | 'partner_rep'
  | 'contributor';

export const PERSON_CATEGORIES: PersonCategory[] = [
  'team',
  'advisor',
  'board',
  'alumni',
  'partner_rep',
  'contributor',
];

export const PERSON_CATEGORY_LABELS: Record<PersonCategory, string> = {
  team: 'Core Team',
  advisor: 'Advisory Board',
  board: 'Board of Directors',
  alumni: 'Alumni & Fellows',
  partner_rep: 'Partner Representatives',
  contributor: 'Contributors & Mentors',
};

export const PERSON_CATEGORY_DESCRIPTIONS: Record<PersonCategory, string> = {
  team: 'The full-time innovators, leaders, and staff driving Growthbridge forward every day.',
  advisor: 'Industry experts and thought leaders guiding our strategic growth and vision.',
  board: 'Fiduciary and governance leaders overseeing organizational direction.',
  alumni: 'Graduates of Growthbridge bootcamps and fellow programs making an impact worldwide.',
  partner_rep: 'Delegates and leaders from our institutional and corporate partners.',
  contributor: 'Community mentors, open-source contributors, and guest facilitators.',
};

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export interface RelatedProjectRef {
  slug: string;
  title: string;
}

export interface RelatedArticleRef {
  slug: string;
  title: string;
  publishedAt?: string;
}

export interface Person {
  id: string;
  slug: string;
  category: PersonCategory;
  fullName: string;
  title: string;
  department?: string;
  bio: string;
  shortBio?: string;
  photo?: string;
  email?: string;
  phone?: string;
  location?: string;
  joinedAt?: string;
  skills: string[];
  certifications?: string[];
  socialLinks?: SocialLinks;
  projects?: RelatedProjectRef[];
  articles?: RelatedArticleRef[];
  displayOrder: number;
  featured: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeopleQueryParams {
  category?: PersonCategory;
  onlyActive?: boolean;
  onlyFeatured?: boolean;
  search?: string;
}
