import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Education, Skill, Project, Experience, AboutData, ContactData, SocialLink, Portfolio, Theme } from '../models/portfolio.model';
import { API_BASE_URL, HEALTH_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);

  // Core data signals
  private skillsData = signal<Skill[]>([]);
  private projectsData = signal<Project[]>([]);
  private experienceData = signal<Experience[]>([]);
  private educationData = signal<Education[]>([]);
  private socialLinksData = signal<SocialLink[]>([]);
  private portfolioData = signal<Portfolio | null>(null);
  private themeData = signal<Theme | null>(null);

  // User info
  about = signal<AboutData>({ bio: '', description: '', yearsExperience: 0 });
  contact = signal<ContactData>({
    email: '', phone: '', location: '',
    github: '', linkedin: '', medium: '',
    tableau: '', leetcode: '', instagram: '',
    youtube: '', portfolio: ''
  });

  // Loading states
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Public readonly signals
  getSkills = this.skillsData.asReadonly();
  getProjects = this.projectsData.asReadonly();
  getExperience = this.experienceData.asReadonly();
  getEducation = this.educationData.asReadonly();
  getSocialLinks = this.socialLinksData.asReadonly();
  getPortfolio = this.portfolioData.asReadonly();
  theme = this.themeData.asReadonly();

  // Computed values
  isPublicPortfolio = computed(() => this.portfolioData()?.isPublic ?? false);
  portfolioSlug = computed(() => this.portfolioData()?.slug ?? '');
  portfolioUrl = computed(() => this.portfolioData()?.slug ? `/p/${this.portfolioData()?.slug}` : '');

  checkHealth() {
    return this.http.get<{ success?: boolean; message?: string }>(HEALTH_URL);
  }

  // Load authenticated user's portfolio
  loadPortfolio(headers?: HttpHeaders) {
    this.isLoading.set(true);
    this.error.set(null);

    const httpOptions = headers ? { headers } : {};

    this.http
      .get<{ success: boolean; message: string; data: any }>(`${API_BASE_URL}/portfolios/mine`, httpOptions)
      .subscribe({
        next: (response) => {
          this.mapPortfolioData(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load portfolio:', error);
          this.error.set('Failed to load portfolio');
          this.isLoading.set(false);
        },
      });
  }

  // Load public portfolio by username/slug
  loadPublicPortfolio(identifier: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<{ success: boolean; message: string; data: any }>(`${API_BASE_URL}/portfolios/public/${identifier}`)
      .subscribe({
        next: (response) => {
          this.mapPortfolioData(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load public portfolio:', error);
          this.error.set('Portfolio not found');
          this.isLoading.set(false);
        },
      });
  }

  private mapPortfolioData(data: any) {
    if (!data) return;

    // Map portfolio info
    this.portfolioData.set({
      id: data.id,
      userId: data.userId,
      title: data.title ?? '',
      subtitle: data.subtitle ?? '',
      slug: data.slug ?? '',
      isPublic: data.isPublic ?? false,
      bio: data.bio ?? '',
      description: data.description ?? '',
      profilePhotoUrl: data.profilePhotoUrl ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      location: data.location ?? '',
      website: data.website ?? '',
    });

    // Map theme
    if (data.theme) {
      this.themeData.set({
        id: data.theme.id,
        portfolioId: data.theme.portfolioId,
        primaryColor: data.theme.primaryColor ?? '#3B82F6',
        secondaryColor: data.theme.secondaryColor ?? '#10B981',
        backgroundColor: data.theme.backgroundColor ?? '#FFFFFF',
        textColor: data.theme.textColor ?? '#1F2937',
        accentColor: data.theme.accentColor ?? '#F59E0B',
        fontFamily: data.theme.fontFamily ?? 'Inter',
        headingFont: data.theme.headingFont ?? 'Inter',
        fontSize: data.theme.fontSize ?? 'medium',
        template: data.theme.template ?? 'modern',
        layout: data.theme.layout ?? 'single',
        showAbout: data.theme.showAbout ?? true,
        showSkills: data.theme.showSkills ?? true,
        showProjects: data.theme.showProjects ?? true,
        showExperience: data.theme.showExperience ?? true,
        showEducation: data.theme.showEducation ?? true,
        showContact: data.theme.showContact ?? true,
      });
    }

    // Map about/bio
    this.about.set({
      bio: data.bio ?? '',
      description: data.description ?? '',
      yearsExperience: Number(data.yearsExperience ?? 0),
    });

    // Map contact
    this.contact.set({
      email: data.email ?? '',
      phone: data.phone ?? '',
      location: data.location ?? '',
      github: data.github ?? '',
      linkedin: data.linkedin ?? '',
      medium: data.medium ?? '',
      tableau: data.tableau ?? '',
      leetcode: data.leetcode ?? '',
      instagram: data.instagram ?? '',
      youtube: data.youtube ?? '',
      portfolio: data.website ?? '',
    });

    // Map skills
    this.skillsData.set(
      Array.isArray(data.skills) ? data.skills.map((s: any) => this.mapSkill(s)) : []
    );

    // Map projects
    this.projectsData.set(
      Array.isArray(data.projects) ? data.projects.map((p: any) => this.mapProject(p)) : []
    );

    // Map experience
    this.experienceData.set(
      Array.isArray(data.experiences)
        ? this.sortExperience(data.experiences.map((e: any) => this.mapExperience(e)))
        : []
    );

    // Map education
    this.educationData.set(
      Array.isArray(data.education)
        ? this.sortEducation(data.education.map((e: any) => this.mapEducation(e)))
        : []
    );

    // Map social links
    this.socialLinksData.set(
      Array.isArray(data.socialLinks) ? data.socialLinks.map((l: any) => this.mapSocialLink(l)) : []
    );
  }

  // Portfolio CRUD
  async updatePortfolio(payload: Partial<Portfolio>, headers: HttpHeaders): Promise<void> {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/portfolios/mine`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.portfolioData.set({
        ...this.portfolioData(),
        ...response.data,
      });
    }
  }

  async updateSlug(slug: string, headers: HttpHeaders): Promise<{ slug: string; url: string }> {
    const response = await this.http
      .patch<{ success: boolean; data: any }>(`${API_BASE_URL}/portfolios/slug`, { slug }, { headers })
      .toPromise();

    return response?.data ?? { slug: '', url: '' };
  }

  async toggleVisibility(headers: HttpHeaders): Promise<boolean> {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/portfolios/toggle-visibility`, {}, { headers })
      .toPromise();

    if (response?.data) {
      this.portfolioData.update(p => p ? { ...p, isPublic: response.data.isPublic } : null);
      return response.data.isPublic;
    }
    return false;
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean; suggestion?: string }> {
    const response = await this.http
      .get<{ success: boolean; data: any }>(`${API_BASE_URL}/portfolios/check-slug/${slug}`)
      .toPromise();

    return response?.data ?? { available: false };
  }

  // Theme CRUD
  async fetchTheme(headers?: HttpHeaders): Promise<Theme | null> {
    const httpOptions = headers ? { headers } : {};
    const response = await this.http
      .get<{ success: boolean; data: any }>(`${API_BASE_URL}/themes/mine`, httpOptions)
      .toPromise();

    if (response?.data) {
      const theme = response.data;
      this.themeData.set(theme);
      return theme;
    }
    return null;
  }

  async updateTheme(payload: Partial<Theme>, headers: HttpHeaders): Promise<void> {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/themes/mine`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.themeData.set(response.data);
    }
  }

  async applyPreset(presetName: string, headers: HttpHeaders): Promise<void> {
    await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/themes/preset`, { preset: presetName }, { headers })
      .toPromise();

    await this.fetchTheme(headers);
  }

  getPresets() {
    return this.http.get<{ success: boolean; data: any[] }>(`${API_BASE_URL}/themes/presets`);
  }

  getFonts() {
    return this.http.get<{ success: boolean; data: string[] }>(`${API_BASE_URL}/themes/fonts`);
  }

  getTemplates() {
    return this.http.get<{ success: boolean; data: string[] }>(`${API_BASE_URL}/themes/templates`);
  }

  // About CRUD
  async updateAbout(payload: AboutData, headers: HttpHeaders): Promise<void> {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/about`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.about.set({
        bio: response.data.bio ?? '',
        description: response.data.description ?? '',
        yearsExperience: Number(response.data.yearsExperience ?? 0),
      });
    }
  }

  // Contact CRUD
  async updateContact(payload: ContactData, headers: HttpHeaders): Promise<void> {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/contact`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.contact.set({
        email: response.data.email ?? '',
        phone: response.data.phone ?? '',
        location: response.data.location ?? '',
        github: response.data.github ?? '',
        linkedin: response.data.linkedin ?? '',
        medium: response.data.medium ?? '',
        tableau: response.data.tableau ?? '',
        leetcode: response.data.leetcode ?? '',
        instagram: response.data.instagram ?? '',
        youtube: response.data.youtube ?? '',
        portfolio: response.data.portfolio ?? '',
      });
    }
  }

  // Skills CRUD
  async createSkill(payload: { name: string; category: string; level: number }, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/skills`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.skillsData.update((skills) => [...skills, this.mapSkill(response.data)]);
    }
  }

  async updateSkill(id: string | number, payload: { name: string; category: string; level: number }, headers: HttpHeaders) {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/skills/${id}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.skillsData.update((skills) =>
        skills.map((skill) => (skill.id === id ? this.mapSkill(response.data) : skill))
      );
    }
  }

  async deleteSkill(id: string | number, headers: HttpHeaders) {
    await this.http.delete(`${API_BASE_URL}/skills/${id}`, { headers }).toPromise();
    this.skillsData.update((skills) => skills.filter((skill) => skill.id !== id));
  }

  // Projects CRUD
  async createProject(payload: any, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/projects`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.projectsData.update((projects) => [...projects, this.mapProject(response.data)]);
    }
  }

  async updateProject(id: string | number, payload: any, headers: HttpHeaders) {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/projects/${id}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.projectsData.update((projects) =>
        projects.map((project) => (project.id === id ? this.mapProject(response.data) : project))
      );
    }
  }

  async deleteProject(id: string | number, headers: HttpHeaders) {
    await this.http.delete(`${API_BASE_URL}/projects/${id}`, { headers }).toPromise();
    this.projectsData.update((projects) => projects.filter((project) => project.id !== id));
  }

  // Experience CRUD
  async createExperience(payload: any, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/experience`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.experienceData.update((items) =>
        this.sortExperience([...items, this.mapExperience(response.data)])
      );
    }
  }

  async updateExperience(id: string | number, payload: any, headers: HttpHeaders) {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/experience/${id}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.experienceData.update((items) =>
        this.sortExperience(
          items.map((item) => (item.id === id ? this.mapExperience(response.data) : item))
        )
      );
    }
  }

  async deleteExperience(id: string | number, headers: HttpHeaders) {
    await this.http.delete(`${API_BASE_URL}/experience/${id}`, { headers }).toPromise();
    this.experienceData.update((items) => items.filter((item) => item.id !== id));
  }

  // Education CRUD
  async createEducation(payload: any, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/education`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.educationData.update((items) =>
        this.sortEducation([...items, this.mapEducation(response.data)])
      );
    }
  }

  async updateEducation(id: string | number, payload: any, headers: HttpHeaders) {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/education/${id}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.educationData.update((items) =>
        this.sortEducation(
          items.map((item) => (item.id === id ? this.mapEducation(response.data) : item))
        )
      );
    }
  }

  async deleteEducation(id: string | number, headers: HttpHeaders) {
    await this.http.delete(`${API_BASE_URL}/education/${id}`, { headers }).toPromise();
    this.educationData.update((items) => items.filter((item) => item.id !== id));
  }

  // Social Links CRUD
  async createSocialLink(payload: { platform: string; url: string; username?: string }, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/social-links`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.socialLinksData.update((links) => [...links, this.mapSocialLink(response.data)]);
    }
  }

  async updateSocialLink(id: string | number, payload: { platform?: string; url?: string; username?: string }, headers: HttpHeaders) {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/social-links/${id}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.socialLinksData.update((links) =>
        links.map((link) => (link.id === id ? this.mapSocialLink(response.data) : link))
      );
    }
  }

  async deleteSocialLink(id: string | number, headers: HttpHeaders) {
    await this.http.delete(`${API_BASE_URL}/social-links/${id}`, { headers }).toPromise();
    this.socialLinksData.update((links) => links.filter((link) => link.id !== id));
  }

  // Resume
  async generateResume(template: string, headers: HttpHeaders): Promise<string> {
    const response = await this.http
      .post<{ success: boolean; data: { downloadUrl: string } }>(
        `${API_BASE_URL}/resume/generate`,
        { template },
        { headers }
      )
      .toPromise();

    return response?.data?.downloadUrl ?? '';
  }

  getResumeDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/resume/download/${filename}`;
  }

  // Mappers
  private mapSkill(skill: any): Skill {
    return {
      id: skill.id,
      name: skill.name ?? '',
      category: this.normalizeCategory(skill.category),
      level: Number(skill.level ?? 0),
    };
  }

  private mapProject(project: any): Project {
    return {
      id: project.id,
      title: project.title ?? '',
      description: project.description ?? '',
      image: project.imageUrl ?? project.image ?? '',
      technologies: Array.isArray(project.technologies)
        ? project.technologies.map((tech: any) =>
            typeof tech === 'string' ? tech : tech.technologyName ?? ''
          )
        : [],
      liveLink: project.liveUrl ?? project.liveLink ?? '',
      githubLink: project.githubUrl ?? project.githubLink ?? '',
      featured: Boolean(project.featured),
    };
  }

  private mapExperience(experience: any): Experience {
    return {
      id: experience.id,
      company: experience.company ?? '',
      position: experience.position ?? '',
      duration: experience.duration ?? '',
      description: experience.description ?? '',
      startDate: experience.startDate ?? '',
      endDate: experience.endDate ?? '',
    };
  }

  private mapEducation(education: any): Education {
    return {
      id: education.id,
      institution: education.institution ?? '',
      degree: education.degree ?? '',
      field: education.field ?? '',
      grade: education.grade ?? '',
      startDate: education.startDate ?? '',
      endDate: education.endDate ?? '',
      isCurrent: Boolean(education.isCurrent),
      description: education.description ?? '',
    };
  }

  private mapSocialLink(link: any): SocialLink {
    return {
      id: link.id,
      platform: link.platform ?? '',
      url: link.url ?? '',
      username: link.username ?? '',
    };
  }

  private sortEducation(items: Education[]): Education[] {
    return [...items].sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      const endDiff = this.toTimestamp(b.endDate) - this.toTimestamp(a.endDate);
      if (endDiff !== 0) return endDiff;
      return this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate);
    });
  }

  private sortExperience(items: Experience[]): Experience[] {
    return [...items].sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      const endDiff = this.toTimestamp(b.endDate) - this.toTimestamp(a.endDate);
      if (endDiff !== 0) return endDiff;
      return this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate);
    });
  }

  private isCurrentExperience(item: Experience): boolean {
    const duration = item.duration.trim().toLowerCase();
    return !item.endDate || duration.includes('present') || duration.includes('current');
  }

  private isCurrentEducation(item: Education): boolean {
    if (item.isCurrent) return true;
    if (!item.endDate) return true;
    return false;
  }

  private toTimestamp(value: string | undefined): number {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private normalizeCategory(category: string): Skill['category'] {
    switch ((category ?? '').toLowerCase()) {
      case 'frontend': case 'front-end': case 'ui': return 'frontend';
      case 'backend': case 'back-end': case 'api': return 'backend';
      case 'database': case 'databases': case 'db': return 'database';
      case 'tools': case 'tooling': case 'platform': case 'platforms': return 'tools';
      default: return 'tools';
    }
  }
}
