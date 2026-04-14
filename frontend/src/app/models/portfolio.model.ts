export interface Skill {
  id: string | number;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools';
  level: number;
}

export interface Project {
  id: string | number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveLink: string;
  githubLink: string;
  featured: boolean;
}

export interface Experience {
  id: string | number;
  company: string;
  position: string;
  duration: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface Education {
  id: string | number;
  institution: string;
  degree: string;
  field?: string;
  grade?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface SocialLink {
  id: string | number;
  platform: string;
  url: string;
  username?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface AboutData {
  bio: string;
  description: string;
  yearsExperience: number;
}

export interface ContactData {
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  medium: string;
  tableau: string;
  leetcode: string;
  instagram: string;
  youtube: string;
  portfolio: string;
}

export interface Portfolio {
  id: string | number;
  userId?: number;
  title: string;
  subtitle?: string;
  slug: string;
  isPublic: boolean;
  bio?: string;
  description?: string;
  profilePhotoUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface Theme {
  id?: string | number;
  portfolioId?: string | number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  fontSize: 'small' | 'medium' | 'large';
  template: 'modern' | 'classic' | 'minimal' | 'creative';
  layout: 'single' | 'multi';
  showAbout: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showContact: boolean;
}
