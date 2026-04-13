export class PortfolioResponseDto {
  id: number;
  slug: string;
  isPublic: boolean;
  title?: string;
  subtitle?: string;
  bio?: string;
  description?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  viewCount: number;
  
  // Include user info
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };

  // Include theme
  theme?: any;

  // Include content
  skills?: any[];
  projects?: any[];
  experiences?: any[];
  education?: any[];
  socialLinks?: any[];
  
  createdAt: Date;
  updatedAt: Date;
}