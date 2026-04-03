import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-200 py-6 print:bg-white print:py-0" [style.--resume-accent]="accentColor()">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 pb-6 print:hidden">
        <div class="flex flex-wrap gap-3 justify-between items-center">
          <div class="flex flex-wrap items-center gap-3">
            <a routerLink="/" class="btn-secondary">Back to Portfolio</a>
            <button class="btn-primary" (click)="downloadResume()">Download Resume</button>
          </div>

          <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <label class="text-sm font-medium text-slate-700">Resume Color</label>
            <div class="flex items-center gap-2">
              @for (preset of colorPresets; track preset) {
                <button
                  type="button"
                  class="h-7 w-7 rounded-full border border-white shadow ring-1 ring-black/10"
                  [style.background]="preset"
                  (click)="accentColor.set(preset)"
                  [attr.aria-label]="'Use resume color ' + preset"
                ></button>
              }
            </div>
            <input
              type="color"
              [ngModel]="accentColor()"
              (ngModelChange)="accentColor.set($event)"
              class="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1"
            />
          </div>
        </div>
      </div>

      <main class="resume-paper max-w-5xl mx-auto overflow-hidden bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] print:shadow-none print:max-w-none">
        <section class="resume-banner px-8 md:px-12 py-10 text-center text-white">
          <div class="flex items-center justify-center gap-4 md:gap-6">
            <span class="banner-line"></span>
            <h1 class="text-4xl md:text-6xl font-black tracking-wide uppercase">{{ displayName() }}</h1>
            <span class="banner-line"></span>
          </div>

          <p class="mt-5 text-xl md:text-2xl font-semibold text-white/95">
            {{ roleLine() }}
          </p>
        </section>

        <section class="px-8 md:px-12 py-6 border-b border-slate-200">
          <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-base text-slate-700">
            @if (contact().location) {
              <span>📍 {{ contact().location }}</span>
            }
            @if (contact().email) {
              <span>|</span>
              <span>✉️ {{ contact().email }}</span>
            }
            @if (contact().phone) {
              <span>|</span>
              <span>📞 {{ contact().phone }}</span>
            }
          </div>

          <div class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-base text-slate-700">
            @if (githubLink()) {
              <span>GitHub: {{ githubLink() }}</span>
            }
            @if (linkedinLink()) {
              <span>|</span>
              <span>LinkedIn: {{ linkedinLink() }}</span>
            }
            @if (portfolioLink()) {
              <span>|</span>
              <span>{{ portfolioLink() }}</span>
            }
          </div>
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span class="heading-icon">🚀</span>
            <span>Summary</span>
            <span class="heading-line"></span>
          </div>
          @if (summaryText()) {
            <p class="section-body">
              {{ summaryText() }}
            </p>
          } @else {
            <p class="section-empty">Summary data is not available yet.</p>
          }
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span class="heading-icon">💼</span>
            <span>Experience</span>
            <span class="heading-line"></span>
          </div>

          @if (experience().length) {
            <div class="mt-6 space-y-8">
              @for (item of experience(); track item.id) {
                <article class="entry-block">
                  <h3 class="entry-title">{{ item.position }} <span class="font-bold">- {{ item.company }}</span></h3>
                  <p class="entry-meta">📍 {{ contact().location || 'Remote' }} | {{ item.duration || dateRange(item.startDate, item.endDate) }}</p>
                  <ul class="entry-list">
                    @for (point of bulletPoints(item.description); track point) {
                      <li>{{ point }}</li>
                    }
                  </ul>
                </article>
              }
            </div>
          } @else {
            <p class="section-empty">Experience data is not available yet.</p>
          }
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span class="heading-icon">🔧</span>
            <span>Projects</span>
            <span class="heading-line"></span>
          </div>

          @if (projects().length) {
            <div class="mt-6 space-y-8">
              @for (project of projects(); track project.id) {
                <article class="entry-block">
                  <h3 class="entry-title">{{ project.title }}</h3>
                  <p class="entry-meta">
                    @if (project.liveLink) {
                      <span>Live: {{ project.liveLink }}</span>
                    }
                    @if (project.githubLink) {
                      <span> | GitHub: {{ project.githubLink }}</span>
                    }
                  </p>
                  <ul class="entry-list">
                    @for (point of projectBulletPoints(project); track point) {
                      <li>{{ point }}</li>
                    }
                  </ul>
                </article>
              }
            </div>
          } @else {
            <p class="section-empty">Project data is not available yet.</p>
          }
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span class="heading-icon">🎓</span>
            <span>Education</span>
            <span class="heading-line"></span>
          </div>

          <div class="mt-6 entry-block">
            <h3 class="entry-title">{{ educationTitle() }}</h3>
            <p class="entry-meta">📍 {{ educationSubtitle() }}</p>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        --resume-accent: #1d4ed8;
      }

      .resume-paper {
        color: #102a56;
      }

      .resume-banner {
        background: linear-gradient(90deg, color-mix(in srgb, var(--resume-accent) 65%, #0f172a 35%), color-mix(in srgb, var(--resume-accent) 90%, white 10%));
      }

      .banner-line {
        display: inline-block;
        width: 70px;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
      }

      .resume-section {
        padding: 1.8rem 2rem;
        border-bottom: 1px solid #d9e2ef;
      }

      .section-heading {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: color-mix(in srgb, var(--resume-accent) 80%, #0f172a 20%);
        text-transform: uppercase;
        font-weight: 800;
        font-size: 1rem;
        letter-spacing: 0.02em;
      }

      .heading-icon {
        font-size: 1.5rem;
        line-height: 1;
      }

      .heading-line {
        flex: 1;
        height: 2px;
        background: color-mix(in srgb, var(--resume-accent) 35%, white 65%);
      }

      .section-body {
        margin-top: 1.4rem;
        font-size: 1.15rem;
        line-height: 1.85rem;
        color: #183153;
      }

      .section-empty {
        margin-top: 1.2rem;
        color: #64748b;
      }

      .entry-block {
        color: #17325c;
      }

      .entry-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: #17325c;
      }

      .entry-meta {
        margin-top: 0.45rem;
        color: #475569;
        font-size: 1rem;
      }

      .entry-list {
        margin-top: 1rem;
        padding-left: 1.3rem;
        line-height: 1.9;
        color: #17325c;
      }

      .entry-list li {
        margin-bottom: 0.2rem;
      }

      @media print {
        :host {
          color-scheme: light;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @page {
          margin: 10mm;
          size: A4;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeComponent {
  private portfolioService = inject(PortfolioService);
  private authService = inject(AuthService);

  about = this.portfolioService.about;
  contact = this.portfolioService.contact;
  skills = this.portfolioService.getSkills;
  projects = this.portfolioService.getProjects;
  experience = this.portfolioService.getExperience;

  accentColor = signal('#1d4ed8');
  colorPresets = ['#1d4ed8', '#0f766e', '#b45309', '#9333ea', '#be123c'];

  displayName = computed(() => this.authService.admin()?.name?.trim() || 'Your Name');
  summaryText = computed(() => this.about().bio || this.about().description || '');

  roleLine = computed(() => {
    const topSkills = [...this.skills()]
      .sort((a, b) => b.level - a.level)
      .slice(0, 4)
      .map((skill) => skill.name);

    if (topSkills.length) {
      return `Frontend Developer | ${topSkills.join(' | ')}`;
    }

    return 'Frontend Developer | Angular | Node.js | MySQL';
  });

  githubLink = computed(() => {
    return this.contact().github || this.projects().find((project) => project.githubLink)?.githubLink || '';
  });

  linkedinLink = computed(() => this.contact().linkedin || '');

  portfolioLink = computed(() => {
    if (this.contact().portfolio) {
      return this.contact().portfolio;
    }

    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.origin;
  });

  educationTitle = computed(() => "Bachelor's Degree / Education Details");
  educationSubtitle = computed(() => this.contact().location || 'Add education details from your profile');

  downloadResume() {
    window.print();
  }

  bulletPoints(description: string) {
    return description
      .split(/[\n.]+/)
      .map((point) => point.trim())
      .filter(Boolean);
  }

  projectBulletPoints(project: { description: string; technologies: string[] }) {
    const bullets = this.bulletPoints(project.description);

    if (project.technologies.length) {
      bullets.push(`Built using ${project.technologies.join(', ')}`);
    }

    return bullets.slice(0, 4);
  }

  dateRange(startDate: string, endDate: string) {
    if (!startDate && !endDate) {
      return 'Present';
    }

    return [startDate, endDate].filter(Boolean).join(' - ');
  }
}
