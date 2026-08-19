// Navigation menu items

import type { NavigationItem } from '@/lib/types';

export const mainNavigation: NavigationItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about#story' },
      { label: 'Mission & Vision', href: '/about#mission' },
      { label: 'Leadership & Team', href: '/team' },
      { label: 'Partners', href: '/about#partners' },
      { label: 'Careers', href: '/talent-hub' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Growthbridge Digital', href: '/services/digital' },
      { label: 'Growthbridge Business', href: '/services/business' },
      { label: 'Growthbridge People', href: '/services/people' },
      { label: 'Growthbridge Community', href: '/services/community' },
      { label: 'Growthbridge Events', href: '/services/events' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'Talent Hub', href: '/talent-hub', badge: 'New' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavigation = {
  services: [
    { label: 'Digital Solutions', href: '/services/digital' },
    { label: 'Business Solutions', href: '/services/business' },
    { label: 'People & Talent', href: '/services/people' },
    { label: 'Community Impact', href: '/services/community' },
    { label: 'Events & Training', href: '/services/events' },
  ],
  quickLinks: [
    { label: 'About Us', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Talent Hub', href: '/talent-hub' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Case Studies', href: '/blog?category=case-study' },
    { label: 'Skills Resources', href: '/blog?category=skills-development' },
    { label: 'Partner With Us', href: '/contact?type=partnership' },
    { label: 'Join Our Team', href: '/talent-hub' },
  ],
};
