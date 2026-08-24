// Member/Talent type definitions

export interface Member {
  id: string;
  slug: string;
  fullName: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  skills: string[];
  experience: ExperienceLevel;
  availability: AvailabilityStatus;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  featured: boolean;
}

export type ExperienceLevel = 'junior' | 'intermediate' | 'senior' | 'lead';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  intermediate: 'Intermediate',
  senior: 'Senior',
  lead: 'Lead / Expert',
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  busy: 'Currently Busy',
  unavailable: 'Unavailable',
};
