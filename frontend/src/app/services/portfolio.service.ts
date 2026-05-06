import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Education, Skill, Project, Experience, AboutData, ContactData, SocialLink, Portfolio, Theme } from '../models/portfolio.model';
import { API_BASE_URL, API_ORIGIN, HEALTH_URL } from '../config/api.config';

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
  private portfolioLoadInFlight = false;
  private lastPortfolioLoadAt = 0;
  private readonly portfolioLoadCacheMs = 1500;

  constructor() {
    // Listen for logout events to clear cache
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', () => {
        this.clearCache();
      });
      window.addEventListener('auth:login', () => {
        // Reload portfolio data on login
        setTimeout(() => {
          this.loadPortfolio(this.storedAuthHeaders());
        }, 100);
      });
    }
  }

  clearCache(): void {
    this.portfolioLoadInFlight = false;
    this.lastPortfolioLoadAt = 0;
    this.portfolioData.set(null);
    this.themeData.set(null);
    this.about.set({ bio: '', description: '', yearsExperience: 0 });
    this.contact.set({
      email: '', phone: '', location: '',
      github: '', linkedin: '', medium: '',
      tableau: '', leetcode: '', instagram: '',
      youtube: '', portfolio: ''
    });
    this.skillsData.set([]);
    this.projectsData.set([]);
    this.experienceData.set([]);
    this.educationData.set([]);
    this.socialLinksData.set([]);
  }

  // Public readonly signals
  getSkills = this.skillsData.asReadonly();
  getProjects = this.projectsData.asReadonly();
  getExperience = this.experienceData.asReadonly();
  getEducation = this.educationData.asReadonly();
  getSocialLinks = this.socialLinksData.asReadonly();
  getPortfolio = this.portfolioData.asReadonly();
  theme = this.themeData.asReadonly();

  getSkillsByCategory(category: string): Skill[] {
    return this.skillsData().filter((skill) => skill.category === category);
  }

  // Computed values
  isPublicPortfolio = computed(() => this.portfolioData()?.isPublic ?? false);
  portfolioSlug = computed(() => this.portfolioData()?.slug ?? '');
  portfolioUrl = computed(() => this.portfolioData()?.slug ? `/p/${this.portfolioData()?.slug}` : '');

  checkHealth() {
    return this.http.get<{ success?: boolean; message?: string }>(HEALTH_URL);
  }

  // Load authenticated user's portfolio
  loadPortfolio(headers?: HttpHeaders, force = false) {
    const now = Date.now();

    if (!force && this.portfolioLoadInFlight) {
      return;
    }

    if (!force && this.portfolioData() && now - this.lastPortfolioLoadAt < this.portfolioLoadCacheMs) {
      return;
    }

    this.portfolioLoadInFlight = true;
    this.isLoading.set(true);
    this.error.set(null);

    const authHeaders = headers ?? this.storedAuthHeaders();
    const httpOptions = authHeaders ? { headers: authHeaders } : {};

    this.http
      .get<{ success: boolean; message: string; data: any }>(`${API_BASE_URL}/portfolios/mine`, httpOptions)
      .subscribe({
        next: (response) => {
          this.mapPortfolioData(response.data);
          this.lastPortfolioLoadAt = Date.now();
          this.portfolioLoadInFlight = false;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load portfolio:', error);
          this.error.set('Failed to load portfolio');
          this.portfolioLoadInFlight = false;
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
          if (this.shouldLoadAuthenticatedPortfolioFallback(identifier, error)) {
            this.loadPortfolio(this.storedAuthHeaders());
            return;
          }

          this.clearCache();
          this.error.set('Portfolio not found');
          this.isLoading.set(false);
        },
      });
  }

  private storedAuthHeaders(): HttpHeaders | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const token = localStorage.getItem('portfolio_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private isStoredUserPortfolioIdentifier(identifier: string): boolean {
    if (typeof localStorage === 'undefined') return false;

    const normalized = identifier.trim().toLowerCase();
    const rawUser = localStorage.getItem('portfolio_user');

    if (!normalized || !rawUser) return false;

    try {
      const user = JSON.parse(rawUser);
      const username = String(user?.username ?? '').toLowerCase();
      const slug = String(user?.portfolio?.slug ?? '').toLowerCase();
      const loadedSlug = String(this.portfolioData()?.slug ?? '').toLowerCase();

      return normalized === username || normalized === slug || normalized === loadedSlug;
    } catch {
      return false;
    }
  }

  private shouldLoadAuthenticatedPortfolioFallback(identifier: string, error: any): boolean {
    const hasToken = Boolean(this.storedAuthHeaders());
    const message = String(error?.error?.message ?? error?.message ?? '').toLowerCase();

    return (
      this.isStoredUserPortfolioIdentifier(identifier) ||
      (hasToken && message.includes('numeric string'))
    );
  }

  private mapPortfolioData(data: any) {
    if (!data) return;

    // Extract social links from array if present
    const socialMap: Record<string, string> = {};
    if (Array.isArray(data.socialLinks)) {
      for (const link of data.socialLinks) {
        socialMap[link.platform?.toLowerCase()] = link.url ?? '';
      }
    }

    const ownerEmail = data.email ?? data.user?.email ?? '';

    // Map portfolio info
    this.portfolioData.set({
      id: data.id,
      userId: data.userId,
      user: data.user,
      title: data.title ?? '',
      subtitle: data.subtitle ?? '',
      slug: data.slug ?? '',
      isPublic: data.isPublic ?? false,
      bio: data.bio ?? '',
      description: data.description ?? '',
      profilePhotoUrl: data.profilePhotoUrl ?? '',
      email: ownerEmail,
      phone: data.phone ?? '',
      location: data.location ?? '',
      website: data.website ?? '',
    });

    // Map theme
    if (data.theme) {
      this.themeData.set({
        id: data.theme.id,
        portfolioId: data.theme.portfolioId,
        primaryColor: data.theme.primaryColor ?? '#111111',
        secondaryColor: data.theme.secondaryColor ?? '#6B7280',
        backgroundColor: data.theme.backgroundColor ?? '#FFFFFF',
        textColor: data.theme.textColor ?? '#111111',
        accentColor: data.theme.accentColor ?? '#000000',
        fontFamily: data.theme.fontFamily ?? 'Inter',
        headingFont: data.theme.headingFont ?? 'Inter',
        heroBackgroundImage: data.theme.heroBackgroundImage ?? '/assets/image.png',
        colorMode: data.theme.colorMode === 'dark' ? 'dark' : 'light',
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

    // Map contact - use socialMap if available, otherwise fall back to direct fields
    this.contact.set({
      email: ownerEmail,
      phone: data.phone ?? '',
      location: data.location ?? '',
      github: socialMap['github'] ?? data.github ?? '',
      linkedin: socialMap['linkedin'] ?? data.linkedin ?? '',
      medium: socialMap['medium'] ?? data.medium ?? '',
      tableau: socialMap['tableau'] ?? data.tableau ?? '',
      leetcode: socialMap['leetcode'] ?? data.leetcode ?? '',
      instagram: socialMap['instagram'] ?? data.instagram ?? '',
      youtube: socialMap['youtube'] ?? data.youtube ?? '',
      portfolio: data.website ?? data.portfolio ?? '',
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
    const themePayload = this.themePayload(payload);
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/themes/mine`, themePayload, { headers })
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

  private themePayload(payload: Partial<Theme>) {
    return {
      primaryColor: this.normalizeHex(payload.primaryColor, '#111111'),
      secondaryColor: this.normalizeHex(payload.secondaryColor, '#6B7280'),
      backgroundColor: this.normalizeHex(payload.backgroundColor, '#FFFFFF'),
      textColor: this.normalizeHex(payload.textColor, '#111111'),
      accentColor: this.normalizeHex(payload.accentColor, '#000000'),
      fontFamily: payload.fontFamily ?? 'Inter',
      headingFont: payload.headingFont ?? 'Inter',
      heroBackgroundImage: (payload.heroBackgroundImage ?? '').trim() || '/assets/image.png',
      colorMode: payload.colorMode === 'dark' ? 'dark' : 'light',
      fontSize: payload.fontSize ?? 'medium',
      template: payload.template ?? 'modern',
      layout: payload.layout ?? 'single',
      showAbout: payload.showAbout ?? true,
      showSkills: payload.showSkills ?? true,
      showProjects: payload.showProjects ?? true,
      showExperience: payload.showExperience ?? true,
      showEducation: payload.showEducation ?? true,
      showContact: payload.showContact ?? true,
    };
  }

  private normalizeHex(value: string | undefined, fallback: string): string {
    const raw = (value ?? '').trim();
    const hex = raw.startsWith('#') ? raw : `#${raw}`;

    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex) ? hex : fallback;
  }

  // Admin: Get all users
  async fetchAllUsers(headers: HttpHeaders): Promise<any[]> {
    const response = await this.http
      .get<{ success: boolean; data: { users: any[]; pagination: any } }>(`${API_BASE_URL}/admin/users`, { headers })
      .toPromise();
    return response?.data?.users ?? [];
  }

  // Admin: Get user portfolio by user ID
  async fetchUserPortfolio(userId: number | string, headers: HttpHeaders): Promise<any> {
    const response = await this.http
      .get<{ success: boolean; data: any }>(`${API_BASE_URL}/portfolios/user/${userId}`, { headers })
      .toPromise();
    return response?.data ?? null;
  }

  loadAdminUserPortfolio(userId: number | string, headers: HttpHeaders) {
    this.clearCache();
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<{ success: boolean; message: string; data: any }>(
        `${API_BASE_URL}/portfolios/user/${userId}`,
        { headers }
      )
      .subscribe({
        next: (response) => {
          this.mapPortfolioData(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load user portfolio:', error);
          this.clearCache();
          this.error.set('Portfolio not found');
          this.isLoading.set(false);
        },
      });
  }

  // Admin: Get user by ID (with portfolio)
  async fetchUserById(userId: number | string, headers: HttpHeaders): Promise<any> {
    const response = await this.http
      .get<{ success: boolean; data: any }>(`${API_BASE_URL}/admin/users/${userId}`, { headers })
      .toPromise();
    return response?.data ?? null;
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
      this.portfolioData.update((portfolio) =>
        portfolio
          ? {
              ...portfolio,
              email: response.data.email ?? portfolio.email,
              phone: response.data.phone ?? portfolio.phone,
              location: response.data.location ?? portfolio.location,
              website: response.data.portfolio ?? portfolio.website,
            }
          : portfolio
      );
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
    const routeId = this.requireNumericId(id, 'skill');
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/skills/${routeId}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.skillsData.update((skills) =>
        skills.map((skill) => (skill.id === id ? this.mapSkill(response.data) : skill))
      );
    }
  }

  async deleteSkill(id: string | number, headers: HttpHeaders) {
    const routeId = this.requireNumericId(id, 'skill');
    await this.http.delete(`${API_BASE_URL}/skills/${routeId}`, { headers }).toPromise();
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
    const routeId = this.requireNumericId(id, 'project');
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/projects/${routeId}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.projectsData.update((projects) =>
        projects.map((project) => (project.id === id ? this.mapProject(response.data) : project))
      );
    }
  }

  async deleteProject(id: string | number, headers: HttpHeaders) {
    const routeId = this.requireNumericId(id, 'project');
    await this.http.delete(`${API_BASE_URL}/projects/${routeId}`, { headers }).toPromise();
    this.projectsData.update((projects) => projects.filter((project) => project.id !== id));
  }

  // Experience CRUD
  async createExperience(payload: any, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(
        `${API_BASE_URL}/experience`,
        this.withoutEmptyDateFields(payload),
        { headers }
      )
      .toPromise();

    if (response?.data) {
      this.experienceData.update((items) =>
        this.sortExperience([...items, this.mapExperience(response.data)])
      );
    }
  }

  async updateExperience(id: string | number, payload: any, headers: HttpHeaders) {
    const routeId = this.requireNumericId(id, 'experience');
    const response = await this.http
      .put<{ success: boolean; data: any }>(
        `${API_BASE_URL}/experience/${routeId}`,
        this.withoutEmptyDateFields(payload),
        { headers }
      )
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
    const routeId = this.requireNumericId(id, 'experience');
    await this.http.delete(`${API_BASE_URL}/experience/${routeId}`, { headers }).toPromise();
    this.experienceData.update((items) => items.filter((item) => item.id !== id));
  }

  // Education CRUD
  async createEducation(payload: any, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(
        `${API_BASE_URL}/education`,
        this.withoutEmptyDateFields(payload),
        { headers }
      )
      .toPromise();

    if (response?.data) {
      this.educationData.update((items) =>
        this.sortEducation([...items, this.mapEducation(response.data)])
      );
    }
  }

  async updateEducation(id: string | number, payload: any, headers: HttpHeaders) {
    const routeId = this.requireNumericId(id, 'education');
    const response = await this.http
      .put<{ success: boolean; data: any }>(
        `${API_BASE_URL}/education/${routeId}`,
        this.withoutEmptyDateFields(payload),
        { headers }
      )
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
    const routeId = this.requireNumericId(id, 'education');
    await this.http.delete(`${API_BASE_URL}/education/${routeId}`, { headers }).toPromise();
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
    const routeId = this.requireNumericId(id, 'social link');
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/social-links/${routeId}`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.socialLinksData.update((links) =>
        links.map((link) => (link.id === id ? this.mapSocialLink(response.data) : link))
      );
    }
  }

  async deleteSocialLink(id: string | number, headers: HttpHeaders) {
    const routeId = this.requireNumericId(id, 'social link');
    await this.http.delete(`${API_BASE_URL}/social-links/${routeId}`, { headers }).toPromise();
    this.socialLinksData.update((links) => links.filter((link) => link.id !== id));
  }

  // Resume
  async generateResume(template: string, headers: HttpHeaders): Promise<{ url: string; filename: string }> {
    const response = await this.http
      .post<{ success: boolean; data: { downloadUrl: string; fileData?: string; filename?: string } }>(
        `${API_BASE_URL}/resume/generate`,
        { template },
        { headers }
      )
      .toPromise();

    const fileData = response?.data?.fileData ?? '';
    const filename = response?.data?.filename ?? `resume-${Date.now()}.pdf`;
    if (fileData) {
      return {
        url: URL.createObjectURL(this.base64PdfToBlob(fileData)),
        filename,
      };
    }

    // Convert relative URL to absolute using the configured API origin.
    const downloadUrl = response?.data?.downloadUrl ?? '';
    if (downloadUrl.startsWith('/')) {
      return { url: `${API_ORIGIN}${downloadUrl}`, filename };
    }
    return { url: downloadUrl, filename };
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

  private requireNumericId(id: string | number | null | undefined, label: string): string | number {
    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      return id;
    }

    if (typeof id === 'string' && /^\d+$/.test(id)) {
      return id;
    }

    throw new Error(`Cannot update this ${label} because its saved ID is missing. Please refresh and try again.`);
  }

  private withoutEmptyDateFields<T extends Record<string, any>>(payload: T): T {
    const cleaned = { ...payload };

    for (const key of ['startDate', 'endDate']) {
      if (cleaned[key] === '') {
        delete cleaned[key];
      }
    }

    return cleaned;
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

  private normalizeCategory(category: string): string {
    const value = (category ?? '').trim();

    switch (value.toLowerCase()) {
      case 'frontend': case 'front-end': case 'ui': return 'frontend';
      case 'backend': case 'back-end': case 'api': return 'backend';
      case 'database': case 'databases': case 'db': return 'database';
      case 'tools': case 'tooling': case 'platform': case 'platforms': return 'tools';
      default: return value || 'tools';
    }
  }

  private base64PdfToBlob(fileData: string): Blob {
    const binary = atob(fileData);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: 'application/pdf' });
  }
}
