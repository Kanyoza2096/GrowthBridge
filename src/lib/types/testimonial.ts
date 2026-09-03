// Testimonial type definitions

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  avatar?: string;
  rating: number;
  featured: boolean;
}
