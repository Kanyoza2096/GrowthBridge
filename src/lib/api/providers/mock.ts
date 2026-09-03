import { BRAND } from '@/lib/constants/brand';
// Mock Backend Provider
// Full mock data for development and fallback

import type { BackendProvider } from '../backend-provider';
import type {
  Service,
  Project,
  BlogPost,
  Member,
  Person,
  PersonCategory,
  PeopleQueryParams,
  Testimonial,
  ImpactStats,
  ContactFormData,
  ApplicationData,
  PartnershipData,
  ApiResponse,
  SocialFeedItem,
  SocialFeedQueryParams,
} from '@/lib/types';
import type { Settings } from '@/lib/types/admin';


// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockServices: Service[] = [
  {
    id: '1',
    slug: 'digital',
    title: 'Growthbridge Digital',
    division: 'digital',
    tagline: 'Transforming Ideas into Digital Reality',
    description:
      'We build cutting-edge digital solutions that drive growth. From responsive websites and progressive web apps to full-stack platforms and AI integrations — our youth-led team delivers enterprise-grade technology with startup agility.',
    icon: 'Monitor',
    color: BRAND.navy,
    features: [
      'Custom Web & Mobile Development',
      'UI/UX Design & Prototyping',
      'E-Commerce Solutions',
      'API Development & Integration',
      'Cloud Architecture & DevOps',
      'AI & Machine Learning Solutions',
    ],
    benefits: [
      'Scalable, future-proof technology',
      'Rapid development with agile methodology',
      'Dedicated team of skilled young developers',
      'Ongoing support and maintenance',
    ],
    process: [
      { step: 1, title: 'Discovery', description: 'Understand your needs, goals, and audience' },
      { step: 2, title: 'Design', description: 'Create wireframes, prototypes, and visual designs' },
      { step: 3, title: 'Develop', description: 'Build with modern tech stacks and best practices' },
      { step: 4, title: 'Deploy', description: 'Launch, monitor, and optimize performance' },
    ],
    order: 1,
  },
  {
    id: '2',
    slug: 'business',
    title: 'Growthbridge Business',
    division: 'business',
    tagline: 'Strategic Solutions for Sustainable Growth',
    description:
      'We provide strategic business consulting and solutions that help organizations scale. From brand strategy and market analysis to digital transformation roadmaps — we bridge the gap between vision and execution.',
    icon: 'TrendingUp',
    color: BRAND.green,
    features: [
      'Brand Strategy & Identity',
      'Market Research & Analysis',
      'Digital Marketing & SEO',
      'Business Process Optimization',
      'Financial Planning & Modeling',
      'Pitch Deck & Investor Relations',
    ],
    benefits: [
      'Data-driven strategic insights',
      'Comprehensive brand development',
      'Measurable growth outcomes',
      'Fresh perspectives from young innovators',
    ],
    process: [
      { step: 1, title: 'Assess', description: 'Evaluate current business landscape and challenges' },
      { step: 2, title: 'Strategize', description: 'Develop actionable growth strategies' },
      { step: 3, title: 'Execute', description: 'Implement solutions with measurable KPIs' },
      { step: 4, title: 'Scale', description: 'Optimize and expand for sustained growth' },
    ],
    order: 2,
  },
  {
    id: '3',
    slug: 'people',
    title: 'Growthbridge People',
    division: 'people',
    tagline: 'Empowering Talent, Building Futures',
    description:
      'Our talent division connects skilled young professionals with opportunities. We provide mentorship, training, and placement services — building a pipeline of future-ready talent for the digital economy.',
    icon: 'Users',
    color: BRAND.orange,
    features: [
      'Talent Sourcing & Placement',
      'Skills Assessment & Matching',
      'Mentorship Programs',
      'Career Development Coaching',
      'Internship & Apprenticeship Programs',
      'Leadership Development',
    ],
    benefits: [
      'Access to vetted, skilled young talent',
      'Reduced hiring costs and time',
      'Diversity and fresh perspectives',
      'Community investment and social impact',
    ],
    process: [
      { step: 1, title: 'Identify', description: 'Map your talent needs and requirements' },
      { step: 2, title: 'Match', description: 'Connect with pre-vetted young professionals' },
      { step: 3, title: 'Develop', description: 'Provide ongoing mentorship and training' },
      { step: 4, title: 'Retain', description: 'Build long-term talent relationships' },
    ],
    order: 3,
  },
  {
    id: '4',
    slug: 'community',
    title: 'Growthbridge Community',
    division: 'community',
    tagline: 'Stronger Communities, Greater Impact',
    description:
      'We design and implement community-focused programs that create lasting social impact. From digital literacy initiatives and youth workshops to community tech hubs — we believe in technology as a tool for social good.',
    icon: 'Heart',
    color: '#EC4899',
    features: [
      'Digital Literacy Programs',
      'Youth Workshops & Bootcamps',
      'Community Tech Hubs',
      'Social Impact Projects',
      'NGO & NPO Technology Support',
      'Environmental Sustainability Initiatives',
    ],
    benefits: [
      'Measurable community impact',
      'Sustainable program design',
      'Technology-driven solutions',
      'Youth-led community engagement',
    ],
    process: [
      { step: 1, title: 'Listen', description: 'Understand community needs and challenges' },
      { step: 2, title: 'Plan', description: 'Design inclusive, sustainable programs' },
      { step: 3, title: 'Implement', description: 'Execute with community participation' },
      { step: 4, title: 'Measure', description: 'Track impact and iterate for improvement' },
    ],
    order: 4,
  },
  {
    id: '5',
    slug: 'events',
    title: 'Growthbridge Events',
    division: 'events',
    tagline: 'Experiences That Inspire and Connect',
    description:
      'We create memorable events that bring people together. From tech conferences and hackathons to training workshops and networking events — we design experiences that inspire innovation and foster collaboration.',
    icon: 'Calendar',
    color: '#8B5CF6',
    features: [
      'Tech Conferences & Summits',
      'Hackathons & Innovation Challenges',
      'Training Workshops & Seminars',
      'Networking & Mixer Events',
      'Virtual & Hybrid Event Production',
      'Corporate Team-Building Events',
    ],
    benefits: [
      'Professional event management',
      'Engaging, interactive formats',
      'Broad network and speaker access',
      'Hybrid and virtual event expertise',
    ],
    process: [
      { step: 1, title: 'Conceptualize', description: 'Define event vision, goals, and audience' },
      { step: 2, title: 'Curate', description: 'Design content, secure speakers, and venues' },
      { step: 3, title: 'Execute', description: 'Deliver seamless, memorable experiences' },
      { step: 4, title: 'Amplify', description: 'Post-event content, analytics, and follow-up' },
    ],
    order: 5,
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    slug: 'ubuntu-health-platform',
    title: 'Ubuntu Health Platform',
    client: 'Department of Health',
    category: 'web-development',
    description:
      'A comprehensive telehealth platform connecting rural communities with healthcare professionals. Features real-time video consultations, appointment scheduling, and health record management. Reduced patient wait times by 60% in pilot regions.',
    shortDescription:
      'Telehealth platform connecting rural communities with healthcare professionals.',
    image: '/images/projects/health-platform.jpg',
    technologies: ['Next.js', 'TypeScript', 'WebRTC', 'PostgreSQL', 'Docker'],
    impact: {
      metric: 'Patient Wait Time',
      value: '-60%',
      description: 'Reduced average patient wait time in pilot regions',
    },
    serviceDivision: 'digital',
    featured: true,
    completedAt: '2025-11-15',
  },
  {
    id: '2',
    slug: 'thandi-fashion-ecommerce',
    title: 'Thandi Fashion E-Commerce',
    client: 'Thandi Fashion House',
    category: 'web-development',
    description:
      'A modern e-commerce platform for a South African fashion brand, featuring AR try-on capabilities, multi-currency support, and integrated social commerce. Grew online sales by 340% within the first quarter.',
    shortDescription:
      'Modern e-commerce platform with AR try-on for South African fashion brand.',
    image: '/images/projects/fashion-ecommerce.jpg',
    technologies: ['React', 'Node.js', 'Stripe', 'AR.js', 'MongoDB'],
    impact: {
      metric: 'Online Sales Growth',
      value: '+340%',
      description: 'Growth in online sales within the first quarter of launch',
    },
    serviceDivision: 'digital',
    featured: true,
    completedAt: '2025-09-20',
  },
  {
    id: '3',
    slug: 'code-for-change-bootcamp',
    title: 'Code for Change Bootcamp',
    client: 'Growthbridge Community',
    category: 'training',
    description:
      'A 12-week intensive coding bootcamp for underserved youth, teaching full-stack web development. 85% of graduates secured employment or freelance contracts within 3 months of completion.',
    shortDescription:
      '12-week coding bootcamp empowering underserved youth with tech skills.',
    image: '/images/projects/bootcamp.jpg',
    technologies: ['JavaScript', 'React', 'Node.js', 'Git', 'Agile'],
    impact: {
      metric: 'Employment Rate',
      value: '85%',
      description: 'Graduates employed or freelancing within 3 months',
    },
    serviceDivision: 'community',
    featured: true,
    completedAt: '2025-08-10',
  },
  {
    id: '4',
    slug: 'green-energy-dashboard',
    title: 'Green Energy Dashboard',
    client: 'SolarTech SA',
    category: 'web-development',
    description:
      'Real-time energy monitoring dashboard for solar installations across South Africa. IoT-integrated system tracking energy production, consumption, and cost savings with predictive analytics.',
    shortDescription:
      'IoT-powered energy monitoring dashboard for solar installations.',
    image: '/images/projects/energy-dashboard.jpg',
    technologies: ['Vue.js', 'Python', 'FastAPI', 'InfluxDB', 'MQTT'],
    impact: {
      metric: 'Energy Efficiency',
      value: '+25%',
      description: 'Improvement in client energy efficiency through data insights',
    },
    serviceDivision: 'digital',
    featured: false,
    completedAt: '2025-07-05',
  },
  {
    id: '5',
    slug: 'youth-innovation-summit-2025',
    title: 'Youth Innovation Summit 2025',
    client: 'Multiple Sponsors',
    category: 'events',
    description:
      'A three-day tech conference bringing together 500+ young innovators, industry leaders, and investors. Featured 40 speakers, 15 workshops, and a 24-hour hackathon with R500K in prizes.',
    shortDescription:
      'Three-day tech conference for 500+ young innovators and industry leaders.',
    image: '/images/projects/innovation-summit.jpg',
    technologies: ['Event Tech', 'Live Streaming', 'Mobile App', 'AI Matchmaking'],
    impact: {
      metric: 'Attendees',
      value: '500+',
      description: 'Young innovators gathered for 3 days of learning and networking',
    },
    serviceDivision: 'events',
    featured: true,
    completedAt: '2025-06-20',
  },
  {
    id: '6',
    slug: 'mbali-brand-identity',
    title: 'Mbali Brand Identity',
    client: 'Mbali Organics',
    category: 'branding',
    description:
      'Complete brand identity development for an organic skincare startup. Included logo design, brand guidelines, packaging design, and a comprehensive social media strategy that grew their following by 200%.',
    shortDescription:
      'Complete brand identity for an organic skincare startup.',
    image: '/images/projects/brand-identity.jpg',
    technologies: ['Figma', 'Adobe Creative Suite', 'Brand Strategy'],
    impact: {
      metric: 'Social Media Growth',
      value: '+200%',
      description: 'Growth in social media following within 6 months',
    },
    serviceDivision: 'business',
    featured: false,
    completedAt: '2025-05-15',
  },
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'future-of-youth-tech-africa',
    title: 'The Future of Youth-Led Tech in Africa',
    excerpt:
      'How young African innovators are reshaping the continent\'s technology landscape and what it means for the global economy.',
    content:
      'Africa\'s tech ecosystem is experiencing an unprecedented transformation, driven largely by young innovators under 35...',
    author: {
      name: 'Sipho Ndlovu',
      avatar: '/images/team/sipho.jpg',
      role: 'CEO & Founder',
    },
    category: 'technology',
    tags: ['Africa', 'Youth', 'Technology', 'Innovation', 'Startup Ecosystem'],
    image: '/images/blog/youth-tech-africa.jpg',
    publishedAt: '2025-12-01',
    readTime: 8,
    featured: true,
  },
  {
    id: '2',
    slug: 'building-community-through-code',
    title: 'Building Community Through Code: Our Impact Story',
    excerpt:
      'A deep dive into how our Code for Change bootcamp is transforming lives and communities across South Africa.',
    content:
      'When we launched our first Code for Change bootcamp in 2024, we had a simple mission: equip young people with the skills they need to thrive in the digital economy...',
    author: {
      name: 'Naledi Mokoena',
      avatar: '/images/team/naledi.jpg',
      role: 'Community Lead',
    },
    category: 'community',
    tags: ['Community', 'Coding', 'Education', 'Impact', 'Bootcamp'],
    image: '/images/blog/community-code.jpg',
    publishedAt: '2025-11-15',
    readTime: 6,
    featured: true,
  },
  {
    id: '3',
    slug: 'design-thinking-for-social-impact',
    title: 'Design Thinking for Social Impact',
    excerpt:
      'How we apply design thinking principles to create technology solutions that address real community challenges.',
    content:
      'Design thinking isn\'t just a buzzword — it\'s a powerful methodology that can transform how we approach social challenges...',
    author: {
      name: 'Thabo Mthembu',
      avatar: '/images/team/thabo.jpg',
      role: 'Design Lead',
    },
    category: 'skills-development',
    tags: ['Design Thinking', 'Social Impact', 'UX', 'Innovation'],
    image: '/images/blog/design-thinking.jpg',
    publishedAt: '2025-10-28',
    readTime: 5,
    featured: false,
  },
  {
    id: '4',
    slug: 'scaling-startups-south-africa',
    title: 'Lessons From Scaling Startups in South Africa',
    excerpt:
      'Key insights and hard-won lessons from helping startups navigate the unique challenges of the South African market.',
    content:
      'Scaling a startup anywhere is challenging, but doing it in South Africa comes with its own unique set of hurdles and opportunities...',
    author: {
      name: 'Sipho Ndlovu',
      avatar: '/images/team/sipho.jpg',
      role: 'CEO & Founder',
    },
    category: 'entrepreneurship',
    tags: ['Startups', 'South Africa', 'Scaling', 'Business'],
    image: '/images/blog/scaling-startups.jpg',
    publishedAt: '2025-10-10',
    readTime: 10,
    featured: false,
  },
];

const mockMembers: Member[] = [
  {
    id: '1',
    slug: 'sipho-ndlovu',
    fullName: 'Sipho Ndlovu',
    role: 'CEO & Founder',
    department: 'Leadership',
    bio: 'Visionary leader passionate about leveraging technology to empower African youth. 8+ years in tech entrepreneurship and community development.',
    avatar: '/images/team/sipho.jpg',
    skills: ['Strategy', 'Leadership', 'Full-Stack Development', 'Public Speaking'],
    experience: 'senior',
    availability: 'busy',
    linkedin: 'https://linkedin.com/in/sipho-ndlovu',
    github: 'https://github.com/sipho-ndlovu',
    featured: true,
  },
  {
    id: '2',
    slug: 'naledi-mokoena',
    fullName: 'Naledi Mokoena',
    role: 'Community Lead',
    department: 'Community',
    bio: 'Community builder and social impact strategist. Leads Growthbridge\'s community initiatives, workshops, and bootcamp programs.',
    avatar: '/images/team/naledi.jpg',
    skills: ['Community Building', 'Event Management', 'Content Strategy', 'Teaching'],
    experience: 'intermediate',
    availability: 'available',
    linkedin: 'https://linkedin.com/in/naledi-mokoena',
    featured: true,
  },
  {
    id: '3',
    slug: 'thabo-mthembu',
    fullName: 'Thabo Mthembu',
    role: 'Design Lead',
    department: 'Digital',
    bio: 'Creative designer specializing in user experience, brand identity, and digital product design. Believes great design can change the world.',
    avatar: '/images/team/thabo.jpg',
    skills: ['UI/UX Design', 'Figma', 'Brand Identity', 'Motion Graphics', 'Illustration'],
    experience: 'senior',
    availability: 'available',
    portfolio: 'https://thabo.design',
    linkedin: 'https://linkedin.com/in/thabo-mthembu',
    featured: true,
  },
  {
    id: '4',
    slug: 'amahle-khumalo',
    fullName: 'Amahle Khumalo',
    role: 'Full-Stack Developer',
    department: 'Digital',
    bio: 'Passionate full-stack developer skilled in React, Next.js, and Node.js. Loves building elegant solutions to complex problems.',
    avatar: '/images/team/amahle.jpg',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    experience: 'intermediate',
    availability: 'available',
    github: 'https://github.com/amahle-khumalo',
    linkedin: 'https://linkedin.com/in/amahle-khumalo',
    featured: true,
  },
  {
    id: '5',
    slug: 'mandla-dlamini',
    fullName: 'Mandla Dlamini',
    role: 'Business Strategist',
    department: 'Business',
    bio: 'Strategic thinker with expertise in market analysis, business development, and digital marketing. Helps businesses find their growth edge.',
    avatar: '/images/team/mandla.jpg',
    skills: ['Business Strategy', 'Market Analysis', 'Digital Marketing', 'SEO', 'Data Analytics'],
    experience: 'senior',
    availability: 'busy',
    linkedin: 'https://linkedin.com/in/mandla-dlamini',
    featured: false,
  },
  {
    id: '6',
    slug: 'zanele-sithole',
    fullName: 'Zanele Sithole',
    role: 'Mobile Developer',
    department: 'Digital',
    bio: 'Mobile-first developer specializing in React Native and Flutter. Building apps that make a difference in people\'s daily lives.',
    avatar: '/images/team/zanele.jpg',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    experience: 'intermediate',
    availability: 'available',
    github: 'https://github.com/zanele-sithole',
    featured: false,
  },
];

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    quote:
      'Growthbridge transformed our digital presence completely. Their young, energetic team brought fresh ideas and delivered a platform that exceeded our expectations. The results speak for themselves — 340% growth in online sales!',
    author: 'Nkosazana Dube',
    role: 'CEO',
    organization: 'Thandi Fashion House',
    rating: 5,
    featured: true,
  },
  {
    id: '2',
    quote:
      'The Code for Change bootcamp gave me skills I never thought I could learn. Six months ago, I didn\'t know what JavaScript was. Now I\'m a working developer. Growthbridge didn\'t just teach me to code — they gave me a future.',
    author: 'Bongani Nkosi',
    role: 'Bootcamp Graduate',
    organization: 'Code for Change Cohort 3',
    rating: 5,
    featured: true,
  },
  {
    id: '3',
    quote:
      'Working with Growthbridge on our telehealth platform was a game-changer. Their technical expertise combined with genuine community understanding produced a solution that is already saving lives in rural areas.',
    author: 'Dr. Precious Mkhize',
    role: 'Director of Digital Health',
    organization: 'Department of Health',
    rating: 5,
    featured: true,
  },
  {
    id: '4',
    quote:
      'The Youth Innovation Summit was one of the best-organized tech events I\'ve attended in South Africa. The energy, the speakers, the hackathon — everything was world-class. Can\'t wait for next year!',
    author: 'Kagiso Modise',
    role: 'CTO',
    organization: 'TechVentures SA',
    rating: 5,
    featured: false,
  },
];

const mockStats: ImpactStats = {
  projectsCompleted: 47,
  youthEmpowered: 1200,
  communitiesServed: 15,
  clientSatisfaction: 98,
  activeMembers: 85,
  eventsHosted: 24,
};

let mockPeople: Person[] = [
  {
    id: 'p-1',
    slug: 'sipho-ndlovu',
    category: 'team',
    fullName: 'Sipho Ndlovu',
    title: 'CEO & Founder',
    department: 'Leadership',
    bio: 'Visionary leader passionate about leveraging technology to empower African youth. 8+ years in tech entrepreneurship and community development.',
    shortBio: 'Visionary leader passionate about leveraging technology to empower African youth.',
    photo: '/images/team/sipho.jpg',
    email: 'sipho@growthbridge.org',
    location: 'Johannesburg, South Africa',
    joinedAt: '2024-01-15',
    skills: ['Strategy', 'Leadership', 'Full-Stack Development', 'Public Speaking'],
    certifications: ['AWS Certified Solutions Architect', 'Agile Certified Practitioner'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sipho-ndlovu',
      github: 'https://github.com/sipho-ndlovu',
      twitter: 'https://twitter.com/siphondlovu',
    },
    displayOrder: 1,
    featured: true,
    active: true,
  },
  {
    id: 'p-2',
    slug: 'naledi-mokoena',
    category: 'team',
    fullName: 'Naledi Mokoena',
    title: 'Community Lead',
    department: 'Community',
    bio: 'Community builder and social impact strategist. Leads Growthbridge\'s community initiatives, workshops, and bootcamp programs.',
    shortBio: 'Community builder and social impact strategist leading youth initiatives.',
    photo: '/images/team/naledi.jpg',
    email: 'naledi@growthbridge.org',
    location: 'Pretoria, South Africa',
    joinedAt: '2024-03-01',
    skills: ['Community Building', 'Event Management', 'Content Strategy', 'Teaching'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/naledi-mokoena',
    },
    displayOrder: 2,
    featured: true,
    active: true,
  },
  {
    id: 'p-3',
    slug: 'thabo-mthembu',
    category: 'team',
    fullName: 'Thabo Mthembu',
    title: 'Design Lead',
    department: 'Digital',
    bio: 'Creative designer specializing in user experience, brand identity, and digital product design. Believes great design can change the world.',
    shortBio: 'Creative designer specializing in UI/UX, brand identity, and digital design.',
    photo: '/images/team/thabo.jpg',
    email: 'thabo@growthbridge.org',
    location: 'Johannesburg, South Africa',
    joinedAt: '2024-02-10',
    skills: ['UI/UX Design', 'Figma', 'Brand Identity', 'Motion Graphics', 'Illustration'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/thabo-mthembu',
      website: 'https://thabo.design',
    },
    displayOrder: 3,
    featured: true,
    active: true,
  },
  {
    id: 'p-4',
    slug: 'dr-aris-thorne',
    category: 'advisor',
    fullName: 'Dr. Aris Thorne',
    title: 'Technology Advisory Chair',
    department: 'Advisory Board',
    bio: 'Former VP of Infrastructure with 20+ years of enterprise tech architecture experience. Advises Growthbridge on platform scalability and cloud strategy.',
    shortBio: 'Enterprise technology veteran advising Growthbridge on platform architecture.',
    photo: '/images/team/aris.jpg',
    email: 'aris.thorne@advisors.growthbridge.org',
    location: 'Cape Town, South Africa',
    skills: ['Cloud Architecture', 'Governance', 'Distributed Systems', 'Tech Strategy'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/aris-thorne',
    },
    displayOrder: 1,
    featured: true,
    active: true,
  },
  {
    id: 'p-5',
    slug: 'prof-kagiso-venter',
    category: 'advisor',
    fullName: 'Prof. Kagiso Venter',
    title: 'Youth Innovation Advisor',
    department: 'Advisory Board',
    bio: 'Professor of Digital Economy at Wits University. Specialist in African digital youth policy, skills frameworks, and economic inclusion.',
    shortBio: 'Academic researcher specializing in digital economy and youth policy.',
    photo: '/images/team/kagiso.jpg',
    skills: ['Policy Research', 'Youth Empowerment', 'Economic Development', 'Curriculum Design'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/kagiso-venter',
    },
    displayOrder: 2,
    featured: true,
    active: true,
  },
  {
    id: 'p-6',
    slug: 'nomvula-nkosi',
    category: 'board',
    fullName: 'Nomvula Nkosi',
    title: 'Board Chairperson',
    department: 'Board of Directors',
    bio: 'Executive Director of African Enterprise Development Fund. Oversees Growthbridge governance, financial integrity, and partner alignment.',
    shortBio: 'Executive governance leader ensuring financial integrity and strategic growth.',
    photo: '/images/team/nomvula.jpg',
    skills: ['Corporate Governance', 'Financial Management', 'Strategic Oversight', 'CSR'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/nomvula-nkosi',
    },
    displayOrder: 1,
    featured: true,
    active: true,
  },
  {
    id: 'p-7',
    slug: 'david-chen',
    category: 'board',
    fullName: 'David Chen',
    title: 'Board Member & Strategic Advisor',
    department: 'Board of Directors',
    bio: 'Venture partner at Pan-African Impact Ventures. Focused on scaling social impact initiatives and venture philanthropy.',
    shortBio: 'Venture investor advising on sustainable expansion and capital strategy.',
    skills: ['Venture Capital', 'Impact Investing', 'Scale-up Strategy'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/david-chen-impact',
    },
    displayOrder: 2,
    featured: false,
    active: true,
  },
  {
    id: 'p-8',
    slug: 'bongani-nkosi',
    category: 'alumni',
    fullName: 'Bongani Nkosi',
    title: 'Frontend Software Engineer',
    department: 'Alumni Network',
    bio: 'Graduated from Growthbridge Code for Change Cohort 3. Now working full-time as a frontend engineer at TechVentures SA.',
    shortBio: 'Code for Change graduate now working as a full-time software engineer.',
    photo: '/images/team/bongani.jpg',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/bongani-nkosi-dev',
      github: 'https://github.com/bongani-dev',
    },
    displayOrder: 1,
    featured: true,
    active: true,
  },
  {
    id: 'p-9',
    slug: 'sarah-jenkins',
    category: 'partner_rep',
    fullName: 'Sarah Jenkins',
    title: 'Head of Youth Ecosystems, GlobalTech',
    department: 'Partnership Representatives',
    bio: 'Leads CSR and developer relations partnerships at GlobalTech Africa. Coordinates internship programs and grant funding with Growthbridge.',
    shortBio: 'Corporate partner liaison driving youth tech funding and internships.',
    skills: ['Partnership Strategy', 'CSR', 'Developer Ecosystems'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarah-jenkins-tech',
    },
    displayOrder: 1,
    featured: false,
    active: true,
  },
  {
    id: 'p-10',
    slug: 'tariq-al-mansoor',
    category: 'contributor',
    fullName: 'Tariq Al-Mansoor',
    title: 'Senior Cloud Mentor',
    department: 'Contributors',
    bio: 'Volunteer DevOps engineer providing weekly code reviews and architecture mentoring for Growthbridge bootcamps.',
    shortBio: 'Volunteer Cloud mentor guiding students on DevOps and infrastructure.',
    skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS'],
    socialLinks: {
      github: 'https://github.com/tariq-ops',
    },
    displayOrder: 1,
    featured: false,
    active: true,
  },
];

// ─── Mock Provider Implementation ────────────────────────────────────────────

export class MockBackendProvider implements BackendProvider {
  async getServices(): Promise<Service[]> {
    await delay(300);
    return [...mockServices].sort((a, b) => a.order - b.order);
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    await delay(200);
    return mockServices.find((s) => s.slug === slug) || null;
  }

  async getProjects(): Promise<Project[]> {
    await delay(300);
    return [...mockProjects];
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    await delay(200);
    return mockProjects.find((p) => p.slug === slug) || null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    await delay(300);
    return [...mockBlogPosts];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    await delay(200);
    return mockBlogPosts.find((p) => p.slug === slug) || null;
  }

  async getMembers(): Promise<Member[]> {
    await delay(300);
    return [...mockMembers];
  }

  async getMemberBySlug(slug: string): Promise<Member | null> {
    await delay(200);
    return mockMembers.find((m) => m.slug === slug) || null;
  }

  // ─── People Module Methods ──────────────────────────────────────────────────

  async getPeople(params: PeopleQueryParams = {}): Promise<Person[]> {
    await delay(300);
    let list = [...mockPeople];
    if (params.category) {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.onlyActive !== false) {
      list = list.filter((p) => p.active);
    }
    if (params.onlyFeatured) {
      list = list.filter((p) => p.featured);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getPersonBySlug(slug: string): Promise<Person | null> {
    await delay(200);
    return mockPeople.find((p) => p.slug === slug) || null;
  }

  async getPersonById(id: string): Promise<Person | null> {
    await delay(150);
    return mockPeople.find((p) => p.id === id) || null;
  }

  async createPerson(data: Partial<Person>): Promise<Person> {
    await delay(400);
    const newPerson: Person = {
      id: `p-${Date.now()}`,
      slug: data.slug || (data.fullName ? data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `person-${Date.now()}`),
      category: data.category || 'team',
      fullName: data.fullName || 'New Member',
      title: data.title || 'Team Member',
      department: data.department || '',
      bio: data.bio || '',
      shortBio: data.shortBio || '',
      photo: data.photo,
      email: data.email,
      phone: data.phone,
      location: data.location,
      skills: data.skills || [],
      certifications: data.certifications || [],
      socialLinks: data.socialLinks || {},
      projects: data.projects || [],
      articles: data.articles || [],
      displayOrder: data.displayOrder ?? 99,
      featured: Boolean(data.featured),
      active: data.active !== undefined ? Boolean(data.active) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPeople.push(newPerson);
    return newPerson;
  }

  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    await delay(400);
    const idx = mockPeople.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Person with ID ${id} not found.`);
    }
    mockPeople[idx] = {
      ...mockPeople[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockPeople[idx];
  }

  async deletePerson(id: string): Promise<boolean> {
    await delay(300);
    const initialLen = mockPeople.length;
    mockPeople = mockPeople.filter((p) => p.id !== id);
    return mockPeople.length < initialLen;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    await delay(200);
    return [...mockTestimonials];
  }

  async getStats(): Promise<ImpactStats> {
    await delay(150);
    return { ...mockStats };
  }

  async getSettings(): Promise<Settings> {
    await delay(200);
    return { ...mockSettings };
  }

  async getSocialFeed(params?: SocialFeedQueryParams): Promise<SocialFeedItem[]> {
    await delay(300);
    let items = [...mockSocialFeed];
    if (params?.platform && params.platform !== 'all') {
      items = items.filter((item) => item.platform === params.platform);
    }
    if (params?.limit) {
      items = items.slice(0, params.limit);
    }
    return items;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    await delay(400);
    mockSettings = {
      ...mockSettings,
      ...data,
      organization: { ...mockSettings.organization, ...(data.organization || {}) },
      social: { ...mockSettings.social, ...(data.social || {}) },
      seo: { ...mockSettings.seo, ...(data.seo || {}) },
      email: { ...mockSettings.email, ...(data.email || {}) },
      api: { ...mockSettings.api, ...(data.api || {}) },
      features: { ...mockSettings.features, ...(data.features || {}) },
    };
    return { ...mockSettings };
  }

  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    await delay(800);
    console.log('Mock: Contact form submitted', data);
    return { success: true, message: 'Thank you! We\'ll get back to you soon.' };
  }

  async submitApplication(data: ApplicationData): Promise<ApiResponse> {
    await delay(800);
    console.log('Mock: Application submitted', data);
    return { success: true, message: 'Application received! We\'ll review and reach out.' };
  }

  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    await delay(800);
    console.log('Mock: Partnership inquiry submitted', data);
    return { success: true, message: 'Partnership inquiry received! Let\'s build together.' };
  }
}

let mockSettings: Settings = {
  organization: {
    name: 'Growthbridge Virtual Platform',
    tagline: 'Bridging Skills. Driving Growth.',
    description: 'Growthbridge is a youth-driven organization committed to harnessing skills, technology, and partnerships to create practical solutions that drive growth and strengthen communities across Malawi.',
    logo: '/logo.svg',
    address: 'Area 3, Executive Suites, Lilongwe, Malawi',
    phone: '+265 999 000 000',
    email: 'info@growthbridge.org',
  },
  social: {
    linkedin: 'https://linkedin.com/company/growthbridge',
    twitter: 'https://twitter.com/growthbridge',
    facebook: 'https://facebook.com/growthbridge',
    instagram: 'https://instagram.com/growthbridge',
    youtube: 'https://youtube.com/@growthbridge',
  },
  seo: {
    defaultTitle: 'Growthbridge — Bridging Skills. Driving Growth.',
    defaultDescription: 'Empowering African youth with digital, business, people, and community solutions.',
    defaultKeywords: ['Growthbridge', 'Youth Skills', 'Malawi', 'Digital Solutions', 'Community Development'],
    ogImage: '/images/og-growthbridge.jpg',
  },
  email: {
    fromAddress: 'info@growthbridge.org',
    fromName: 'Growthbridge Team',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
  },
  api: {
    enablePublicApi: true,
    rateLimitPerMinute: 60,
    apiKeys: [],
  },
  features: {
    enableTalentHub: true,
    enableBlog: true,
    enablePartnerPortal: true,
    enablePartnerCarousel: true,
    enableAIAssistant: true,
    enableAnalytics: true,
    maintenanceMode: false,
  },
};

const mockSocialFeed: SocialFeedItem[] = [
  {
    id: 'sf-1',
    platform: 'linkedin',
    authorName: 'Growthbridge Virtual Organization',
    authorHandle: '@growthbridge-org',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    verified: true,
    content: '🎉 Thrilled to announce the graduation of 120 young software developers from our Youth Digital Skills Cohort 4 in Lilongwe! Over 80% have already been paired with local enterprise projects. Bridging Skills. Driving Growth.',
    mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    publishedAt: '2 hours ago',
    likesCount: 284,
    commentsCount: 42,
    sharesCount: 19,
    postUrl: 'https://linkedin.com/company/growthbridge',
    tags: ['#YouthEmpowerment', '#DigitalSkills', '#TechMalawi', '#Growthbridge'],
  },
  {
    id: 'sf-2',
    platform: 'twitter',
    authorName: 'Growthbridge',
    authorHandle: '@GrowthbridgeOrg',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    verified: true,
    content: 'Youth-led. Technology-driven. Community-focused. 🚀 Check out our latest SME Bookkeeping & Digitalization Toolkit built by our Business Solutions team! Download free on our portal.',
    publishedAt: '5 hours ago',
    likesCount: 145,
    commentsCount: 18,
    sharesCount: 37,
    postUrl: 'https://twitter.com/GrowthbridgeOrg',
    tags: ['#SMEMalawi', '#Growthbridge', '#Innovation'],
  },
  {
    id: 'sf-3',
    platform: 'instagram',
    authorName: 'Growthbridge Impact',
    authorHandle: '@growthbridge_impact',
    authorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
    verified: true,
    content: 'Community Clean & Green initiative in action! 🌱 Over 50 volunteers joined forces to revitalize urban green spaces and implement sustainable waste recycling in Area 25.',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    publishedAt: '1 day ago',
    likesCount: 512,
    commentsCount: 64,
    postUrl: 'https://instagram.com/growthbridge',
    tags: ['#CleanAndGreen', '#SustainableMalawi', '#YouthAction'],
  },
  {
    id: 'sf-4',
    platform: 'youtube',
    authorName: 'Growthbridge Media',
    authorHandle: '@GrowthbridgeMedia',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    verified: true,
    content: '📺 WATCH: "From Classroom to Code: How Growthbridge Digital Hubs Are Transforming Rural Youth Careers in Malawi" (Full Documentary)',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    mediaType: 'video',
    publishedAt: '2 days ago',
    likesCount: 890,
    commentsCount: 110,
    postUrl: 'https://youtube.com/@growthbridge',
    tags: ['#Documentary', '#TechEducation', '#AfricaInnovates'],
  },
  {
    id: 'sf-5',
    platform: 'facebook',
    authorName: 'Growthbridge Organization',
    authorHandle: '@GrowthbridgeOfficial',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    verified: true,
    content: 'Applications are now OPEN for the 2026 Growthbridge Corporate Mentorship & Internship Program! Connect with experienced industry leaders across HR, IT, and Finance.',
    mediaUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    publishedAt: '3 days ago',
    likesCount: 320,
    commentsCount: 55,
    sharesCount: 48,
    postUrl: 'https://facebook.com/growthbridge',
    tags: ['#Internship2026', '#CareerGrowth', '#MalawiYouth'],
  },
];

