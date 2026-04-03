import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Skill, Project, Experience, AboutData, ContactData } from '../models/portfolio.model';
import { API_BASE_URL, HEALTH_URL } from '../config/api.config';

const DEFAULT_CONTACT: ContactData = {
  email: 'dev.nest.ms@gmail.com',
  phone: '',
  location: '',
  github: '',
  linkedin: '',
  medium: '',
  tableau: '',
  leetcode: '',
  instagram: '',
  youtube: '',
  portfolio: '',
};

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);

  private skillsData = signal<Skill[]>([]);
  private projectsData = signal<Project[]>([]);
  private experienceData = signal<Experience[]>([]);

  about = signal<AboutData>({
    bio: '',
    description: '',
    yearsExperience: 0,
  });

  contact = signal<ContactData>({ ...DEFAULT_CONTACT });

  isLoading = signal(false);
  error = signal<string | null>(null);

  getSkills = this.skillsData.asReadonly();
  getProjects = this.projectsData.asReadonly();
  getExperience = this.experienceData.asReadonly();

  constructor() {
    this.loadPortfolio();
  }

  checkHealth() {
    return this.http.get<{ success?: boolean; message?: string }>(HEALTH_URL);
  }

  loadPortfolio() {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<{ success: boolean; message: string; data: any }>(`${API_BASE_URL}/portfolio`)
      .subscribe({
        next: (response) => {
          const data = response.data;

          this.about.set({
            bio: data?.about?.bio ?? '',
            description: data?.about?.description ?? '',
            yearsExperience: Number(data?.about?.yearsExperience ?? 0),
          });

          this.contact.set({
            email: data?.contact?.email ?? DEFAULT_CONTACT.email,
            phone: data?.contact?.phone ?? DEFAULT_CONTACT.phone,
            location: data?.contact?.location ?? DEFAULT_CONTACT.location,
            github: data?.contact?.github ?? DEFAULT_CONTACT.github,
            linkedin: data?.contact?.linkedin ?? DEFAULT_CONTACT.linkedin,
            medium: data?.contact?.medium ?? DEFAULT_CONTACT.medium,
            tableau: data?.contact?.tableau ?? DEFAULT_CONTACT.tableau,
            leetcode: data?.contact?.leetcode ?? DEFAULT_CONTACT.leetcode,
            instagram: data?.contact?.instagram ?? DEFAULT_CONTACT.instagram,
            youtube: data?.contact?.youtube ?? DEFAULT_CONTACT.youtube,
            portfolio: data?.contact?.portfolio ?? DEFAULT_CONTACT.portfolio,
          });

          this.skillsData.set(
            Array.isArray(data?.skills) ? data.skills.map((skill: any) => this.mapSkill(skill)) : []
          );

          this.projectsData.set(
            Array.isArray(data?.projects)
              ? data.projects.map((project: any) => this.mapProject(project))
              : []
          );

          this.experienceData.set(
            Array.isArray(data?.experience)
              ? this.sortExperience(
                  data.experience.map((experience: any) => this.mapExperience(experience))
                )
              : []
          );

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load portfolio data:', error);
          this.error.set('Unable to load live portfolio data.');
          this.skillsData.set([]);
          this.projectsData.set([]);
          this.experienceData.set([]);
          this.about.set({ bio: '', description: '', yearsExperience: 0 });
          this.contact.set({ ...DEFAULT_CONTACT });
          this.isLoading.set(false);
        },
      });
  }

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

  async updateContact(payload: ContactData, headers: HttpHeaders): Promise<void> {
    const response = await this.http
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/contact`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.contact.set({
        email: response.data.email ?? DEFAULT_CONTACT.email,
        phone: response.data.phone ?? DEFAULT_CONTACT.phone,
        location: response.data.location ?? DEFAULT_CONTACT.location,
        github: response.data.github ?? DEFAULT_CONTACT.github,
        linkedin: response.data.linkedin ?? DEFAULT_CONTACT.linkedin,
        medium: response.data.medium ?? DEFAULT_CONTACT.medium,
        tableau: response.data.tableau ?? DEFAULT_CONTACT.tableau,
        leetcode: response.data.leetcode ?? DEFAULT_CONTACT.leetcode,
        instagram: response.data.instagram ?? DEFAULT_CONTACT.instagram,
        youtube: response.data.youtube ?? DEFAULT_CONTACT.youtube,
        portfolio: response.data.portfolio ?? DEFAULT_CONTACT.portfolio,
      });
    }
  }

  async createSkill(payload: { name: string; category: string; level: number }, headers: HttpHeaders) {
    const response = await this.http
      .post<{ success: boolean; data: any }>(`${API_BASE_URL}/skills`, payload, { headers })
      .toPromise();

    if (response?.data) {
      this.skillsData.update((skills) => [...skills, this.mapSkill(response.data)]);
    }
  }

  async updateSkill(
    id: string | number,
    payload: { name: string; category: string; level: number },
    headers: HttpHeaders
  ) {
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
      .put<{ success: boolean; data: any }>(`${API_BASE_URL}/experience/${id}`, payload, {
        headers,
      })
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

  getAbout() {
    return this.http.get<{ success: boolean; message?: string; data: any }>(`${API_BASE_URL}/about`);
  }

  getContact() {
    return this.http.get<{ success: boolean; message?: string; data: any }>(`${API_BASE_URL}/contact`);
  }

  getSkillsList() {
    return this.http.get<{ success: boolean; message?: string; data: any[] }>(`${API_BASE_URL}/skills`);
  }

  getSkillById(id: string | number) {
    return this.http.get<{ success: boolean; message?: string; data: any }>(
      `${API_BASE_URL}/skills/${id}`
    );
  }

  getProjectsList() {
    return this.http.get<{ success: boolean; message?: string; data: any[] }>(`${API_BASE_URL}/projects`);
  }

  getProjectById(id: string | number) {
    return this.http.get<{ success: boolean; message?: string; data: any }>(
      `${API_BASE_URL}/projects/${id}`
    );
  }

  getExperienceList() {
    return this.http.get<{ success: boolean; message?: string; data: any[] }>(
      `${API_BASE_URL}/experience`
    );
  }

  getExperienceById(id: string | number) {
    return this.http.get<{ success: boolean; message?: string; data: any }>(
      `${API_BASE_URL}/experience/${id}`
    );
  }

  getSkillsByCategory(category: string) {
    return this.skillsData().filter((skill) => skill.category === category);
  }

  getFeaturedProjects() {
    return this.projectsData().filter((project) => project.featured);
  }

  getProjectsByTech(tech: string) {
    return this.projectsData().filter((project) =>
      project.technologies.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
    );
  }

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
      image: project.image ?? '',
      technologies: Array.isArray(project.technologies)
        ? project.technologies.map((tech: any) =>
            typeof tech === 'string' ? tech : tech.technologyName ?? ''
          )
        : [],
      liveLink: project.liveLink ?? '',
      githubLink: project.githubLink ?? '',
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

  private sortExperience(items: Experience[]): Experience[] {
    return [...items].sort((a, b) => {
      const aIsCurrent = this.isCurrentExperience(a);
      const bIsCurrent = this.isCurrentExperience(b);

      if (aIsCurrent !== bIsCurrent) {
        return aIsCurrent ? -1 : 1;
      }

      const endDateDiff = this.toTimestamp(b.endDate) - this.toTimestamp(a.endDate);
      if (endDateDiff !== 0) {
        return endDateDiff;
      }

      return this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate);
    });
  }

  private isCurrentExperience(item: Experience): boolean {
    const duration = item.duration.trim().toLowerCase();
    return !item.endDate || duration.includes('present') || duration.includes('current');
  }

  private toTimestamp(value: string): number {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private normalizeCategory(category: string): Skill['category'] {
    switch ((category ?? '').toLowerCase()) {
      case 'frontend':
      case 'front-end':
      case 'ui':
        return 'frontend';
      case 'backend':
      case 'back-end':
      case 'api':
        return 'backend';
      case 'database':
      case 'databases':
      case 'db':
        return 'database';
      case 'tools':
      case 'tooling':
      case 'platform':
      case 'platforms':
        return 'tools';
      case 'programming':
        return 'frontend';
      default:
        return 'tools';
    }
  }
}
