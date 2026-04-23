import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';
import { AboutData, ContactData, Education, Experience, Project, Skill, SocialLink, Theme } from '../models/portfolio.model';

type ValidationErrors = Record<string, string>;

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-dark-900 dark:to-slate-900">
      <!-- Header -->
      <header class="sticky top-0 z-40 border-b border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.32em] text-primary-600 dark:text-primary-400">Portfolio Dashboard</p>
            <h1 class="text-xl md:text-2xl font-bold text-dark-900 dark:text-white mt-1">{{ portfolio()?.title || 'My Portfolio' }}</h1>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Portfolio URL -->
            @if (portfolio()?.isPublic) {
              <button class="btn-secondary" (click)="copyPortfolioUrl()">
                📋 Copy Portfolio URL
              </button>
            }

            @if (portfolioUrl()) {
              <a [href]="portfolioUrl()" target="_blank" class="btn-secondary">
                👁 View Live
              </a>
            }

            <button class="btn-secondary" (click)="refresh()">↻ Refresh</button>
            <button class="btn-primary" (click)="authService.logout()">Logout</button>
          </div>
        </div>

        <!-- Portfolio Status Bar -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-white/20">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span [class]="portfolio()?.isPublic ? 'badge-success' : 'badge-warning'">
                  {{ portfolio()?.isPublic ? 'Public' : 'Private' }}
                </span>
              </div>
              <span class="text-sm text-gray-400">|</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Portfolio URL: <code class="text-primary-600">{{ portfolio()?.slug }}</code>
              </span>
            </div>

            <div class="flex items-center gap-3">
              @if (!portfolio()?.isPublic) {
                <button class="btn-success text-sm" (click)="makePublic()">
                  Make Public
                </button>
              } @else {
                <button class="btn-warning text-sm" (click)="makePrivate()">
                  Make Private
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        @if (status()) {
          <div class="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            {{ status() }}
          </div>
        }

        @if (error()) {
          <div class="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {{ error() }}
          </div>
        }

        <!-- Stats -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card">
            <p class="stat-label">Skills</p>
            <p class="stat-value">{{ skills().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Projects</p>
            <p class="stat-value">{{ projects().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Experience</p>
            <p class="stat-value">{{ experience().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Education</p>
            <p class="stat-value">{{ education().length }}</p>
          </div>
        </section>

        <!-- Theme Customization -->
        <section class="admin-panel p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="admin-eyebrow">Customization</p>
              <h2 class="admin-title">Theme Settings</h2>
            </div>
            <button class="btn-secondary" (click)="showThemeEditor.set(!showThemeEditor())">
              {{ showThemeEditor() ? 'Hide Editor' : 'Edit Theme' }}
            </button>
          </div>

          @if (showThemeEditor()) {
            <div class="grid md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Primary Color</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="themeForm.primaryColor" class="color-input" />
                  <input type="text" [(ngModel)]="themeForm.primaryColor" class="input-base flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Secondary Color</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="themeForm.secondaryColor" class="color-input" />
                  <input type="text" [(ngModel)]="themeForm.secondaryColor" class="input-base flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Accent Color</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="themeForm.accentColor" class="color-input" />
                  <input type="text" [(ngModel)]="themeForm.accentColor" class="input-base flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Background Color</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="themeForm.backgroundColor" class="color-input" />
                  <input type="text" [(ngModel)]="themeForm.backgroundColor" class="input-base flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Text Color</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="themeForm.textColor" class="color-input" />
                  <input type="text" [(ngModel)]="themeForm.textColor" class="input-base flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Template</label>
                <select [(ngModel)]="themeForm.template" class="w-full input-base">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button class="btn-primary" (click)="saveTheme()">Save Theme</button>
              <button class="btn-secondary" (click)="applyPreset('blue')">Blue Preset</button>
              <button class="btn-secondary" (click)="applyPreset('green')">Green Preset</button>
              <button class="btn-secondary" (click)="applyPreset('purple')">Purple Preset</button>
              <button class="btn-secondary" (click)="applyPreset('orange')">Orange Preset</button>
            </div>
          }
        </section>

        <!-- About Section -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Profile Story</p>
              <h2 class="admin-title">About</h2>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Bio</label>
              <textarea [(ngModel)]="aboutForm.bio" rows="3" class="w-full input-base" placeholder="A short bio about yourself..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Description</label>
              <textarea [(ngModel)]="aboutForm.description" rows="4" class="w-full input-base" placeholder="Tell your story..."></textarea>
            </div>
            <button class="btn-primary" (click)="saveAbout()">Save About</button>
            @if (aboutError()) {
              <p class="text-red-500 text-sm mt-1">{{ aboutError() }}</p>
            }
          </div>
        </section>

        <!-- Contact Section -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Get In Touch</p>
              <h2 class="admin-title">Contact & Social Links</h2>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Email</label>
              <input [(ngModel)]="contactForm.email" type="email" class="w-full input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Phone</label>
              <input [(ngModel)]="contactForm.phone" type="text" class="w-full input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Location</label>
              <input [(ngModel)]="contactForm.location" type="text" class="w-full input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Website</label>
              <input [(ngModel)]="contactForm.portfolio" type="text" class="w-full input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">GitHub</label>
              <input [(ngModel)]="contactForm.github" type="text" class="w-full input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">LinkedIn</label>
              <input [(ngModel)]="contactForm.linkedin" type="text" class="w-full input-base" />
            </div>
          </div>
          <button class="btn-primary mt-4" (click)="saveContact()">Save Contact</button>
          @if (contactError()) {
            <p class="text-red-500 text-sm mt-1">{{ contactError() }}</p>
          }
        </section>

        <!-- Skills -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Expertise</p>
              <h2 class="admin-title">Skills</h2>
            </div>
            <button class="btn-secondary" (click)="resetSkillForm()">+ Add Skill</button>
          </div>

          <div class="overflow-x-auto mb-6">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-white/5">
                <tr class="text-left border-b border-gray-200 dark:border-dark-700">
                  <th class="py-3 px-4">Name</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Level</th>
                  <th class="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (skill of skills(); track skill.id) {
                  <tr class="border-b border-gray-100 dark:border-dark-800">
                    <td class="py-3 px-4 font-medium">{{ skill.name }}</td>
                    <td class="py-3 px-4 capitalize">{{ skill.category }}</td>
                    <td class="py-3 px-4">{{ skill.level }}%</td>
                    <td class="py-3 px-4 flex gap-2">
                      <button class="btn-secondary !px-3 !py-1 text-sm" (click)="editSkill(skill)">Edit</button>
                      <button class="btn-secondary !px-3 !py-1 text-sm !text-red-600" (click)="deleteSkill(skill.id)">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <input [(ngModel)]="skillForm.name" type="text" class="w-full input-base" placeholder="Skill name" />
            </div>
            <div>
              <select [(ngModel)]="skillForm.category" class="w-full input-base">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="tools">Tools</option>
              </select>
            </div>
            <div>
              <input [(ngModel)]="skillForm.level" type="number" class="w-full input-base" placeholder="Level 0-100" />
            </div>
          </div>
          <button class="btn-primary mt-4" (click)="saveSkill()">
            {{ editingSkillId() ? 'Update Skill' : 'Add Skill' }}
          </button>
        </section>

        <!-- Projects -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Showcase</p>
              <h2 class="admin-title">Projects</h2>
            </div>
            <button class="btn-secondary" (click)="resetProjectForm()">+ Add Project</button>
          </div>

          <div class="space-y-4 mb-6">
            @for (project of projects(); track project.id) {
              <div class="rounded-xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-semibold text-dark-900 dark:text-white">{{ project.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ project.description }}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      @for (tech of project.technologies; track tech) {
                        <span class="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">{{ tech }}</span>
                      }
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-secondary !px-3 !py-1 text-sm" (click)="editProject(project)">Edit</button>
                    <button class="btn-secondary !px-3 !py-1 text-sm !text-red-600" (click)="deleteProject(project.id)">Delete</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input [(ngModel)]="projectForm.title" type="text" class="w-full input-base" placeholder="Project title" />
            </div>
            <div>
              <input [(ngModel)]="projectForm.liveLink" type="text" class="w-full input-base" placeholder="Live URL" />
            </div>
            <div class="md:col-span-2">
              <textarea [(ngModel)]="projectForm.description" rows="2" class="w-full input-base" placeholder="Description"></textarea>
            </div>
            <div>
              <input [(ngModel)]="projectForm.githubLink" type="text" class="w-full input-base" placeholder="GitHub URL" />
            </div>
            <div>
              <input [(ngModel)]="projectForm.technologies" type="text" class="w-full input-base" placeholder="Technologies (comma separated)" />
            </div>
          </div>
          <label class="flex items-center gap-2 mt-4 text-sm text-dark-900 dark:text-white">
            <input [(ngModel)]="projectForm.featured" type="checkbox" />
            Featured project
          </label>
          <button class="btn-primary mt-4 block" (click)="saveProject()">
            {{ editingProjectId() ? 'Update Project' : 'Add Project' }}
          </button>
          @if (projectError()) {
            <p class="text-red-500 text-sm mt-1">{{ projectError() }}</p>
          }
        </section>

        <!-- Experience -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Career</p>
              <h2 class="admin-title">Experience</h2>
            </div>
            <button class="btn-secondary" (click)="resetExperienceForm()">+ Add Experience</button>
          </div>

          <div class="space-y-4 mb-6">
            @for (item of experience(); track item.id) {
              <div class="rounded-xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-semibold text-dark-900 dark:text-white">{{ item.position }}</h3>
                    <p class="text-primary-600 dark:text-primary-400 text-sm">{{ item.company }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ item.duration }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-secondary !px-3 !py-1 text-sm" (click)="editExperience(item)">Edit</button>
                    <button class="btn-secondary !px-3 !py-1 text-sm !text-red-600" (click)="deleteExperience(item.id)">Delete</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input [(ngModel)]="experienceForm.company" type="text" class="w-full input-base" placeholder="Company" />
            </div>
            <div>
              <input [(ngModel)]="experienceForm.position" type="text" class="w-full input-base" placeholder="Position" />
            </div>
            <div>
              <input [(ngModel)]="experienceForm.duration" type="text" class="w-full input-base" placeholder="Duration (e.g. Jan 2020 - Present)" />
            </div>
            <div>
              <input [(ngModel)]="experienceForm.startDate" type="date" class="w-full input-base" />
            </div>
            <div class="md:col-span-2">
              <textarea [(ngModel)]="experienceForm.description" rows="2" class="w-full input-base" placeholder="Description"></textarea>
            </div>
          </div>
          <button class="btn-primary mt-4" (click)="saveExperience()">
            {{ editingExperienceId() ? 'Update Experience' : 'Add Experience' }}
          </button>
          @if (experienceError()) {
            <p class="text-red-500 text-sm mt-1">{{ experienceError() }}</p>
          }
        </section>

        <!-- Education -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-4">
            <div>
              <p class="admin-eyebrow">Academic</p>
              <h2 class="admin-title">Education</h2>
            </div>
            <button class="btn-secondary" (click)="resetEducationForm()">+ Add Education</button>
          </div>

          <div class="space-y-4 mb-6">
            @for (item of education(); track item.id) {
              <div class="rounded-xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-semibold text-dark-900 dark:text-white">{{ item.degree }}</h3>
                    <p class="text-primary-600 dark:text-primary-400 text-sm">{{ item.institution }}</p>
                    @if (item.field) {
                      <p class="text-xs text-gray-500 mt-1">{{ item.field }}</p>
                    }
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-secondary !px-3 !py-1 text-sm" (click)="editEducation(item)">Edit</button>
                    <button class="btn-secondary !px-3 !py-1 text-sm !text-red-600" (click)="deleteEducation(item.id)">Delete</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <input [(ngModel)]="educationForm.institution" type="text" class="w-full input-base" placeholder="Institution" />
            </div>
            <div>
              <input [(ngModel)]="educationForm.degree" type="text" class="w-full input-base" placeholder="Degree" />
            </div>
            <div>
              <input [(ngModel)]="educationForm.field" type="text" class="w-full input-base" placeholder="Field of study" />
            </div>
            <div>
              <input [(ngModel)]="educationForm.grade" type="text" class="w-full input-base" placeholder="Grade/GPA" />
            </div>
            <div>
              <input [(ngModel)]="educationForm.startDate" type="date" class="w-full input-base" />
            </div>
            <div>
              <input [(ngModel)]="educationForm.endDate" type="date" class="w-full input-base" />
            </div>
            <div class="md:col-span-2">
              <textarea [(ngModel)]="educationForm.description" rows="2" class="w-full input-base" placeholder="Description"></textarea>
            </div>
          </div>
          <label class="flex items-center gap-2 mt-4 text-sm text-dark-900 dark:text-white">
            <input [(ngModel)]="educationForm.isCurrent" type="checkbox" />
            Currently studying
          </label>
          <button class="btn-primary mt-4 block" (click)="saveEducation()">
            {{ editingEducationId() ? 'Update Education' : 'Add Education' }}
          </button>
          @if (educationError()) {
            <p class="text-red-500 text-sm mt-1">{{ educationError() }}</p>
          }
        </section>

        <!-- Resume Generation -->
        <section class="admin-panel p-6 md:p-7">
          <div class="admin-header mb-6">
            <div>
              <p class="admin-eyebrow">Download</p>
              <h2 class="admin-title">Generate Resume</h2>
            </div>
          </div>

          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Template</label>
              <select [(ngModel)]="resumeTemplate" class="input-base">
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
              </select>
            </div>
            <div class="flex items-end gap-3">
              <button class="btn-primary" (click)="generateResume()" [disabled]="isGeneratingResume()">
                @if (isGeneratingResume()) {
                  Generating...
                } @else {
                  Generate PDF
                }
              </button>
              @if (resumeUrl()) {
                <a [href]="resumeUrl()" target="_blank" class="btn-success">Download Resume</a>
              }
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .admin-panel {
      border: 1px solid rgba(255, 255, 255, 0.72);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.74));
      border-radius: 1.5rem;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
    }

    :host-context(.dark) .admin-panel {
      border-color: rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(15, 23, 42, 0.74));
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
    }

    .admin-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .admin-eyebrow {
      margin: 0 0 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgb(249 115 22);
    }

    .admin-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: rgb(17 24 39);
    }

    :host-context(.dark) .admin-title {
      color: white;
    }

    .stat-card {
      border: 1px solid rgba(255, 255, 255, 0.72);
      background: rgba(255, 255, 255, 0.86);
      border-radius: 1.25rem;
      padding: 1.1rem 1.15rem;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    }

    :host-context(.dark) .stat-card {
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.7);
    }

    .stat-label {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgb(249 115 22);
    }

    .stat-value {
      margin: 0.5rem 0 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: rgb(17 24 39);
    }

    :host-context(.dark) .stat-value {
      color: white;
    }

    .input-base {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgb(209 213 219);
      background: white;
      color: rgb(17 24 39);
      width: 100%;
    }

    :host-context(.dark) .input-base {
      border-color: rgb(55 65 81);
      background: rgb(31 41 55);
      color: white;
    }

    .input-base:focus {
      outline: 2px solid transparent;
      box-shadow: 0 0 0 2px rgb(249 115 22 / 0.35);
    }

    .color-input {
      width: 50px;
      height: 44px;
      border-radius: 0.75rem;
      border: 1px solid rgb(209 213 219);
      cursor: pointer;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, rgb(249 115 22), rgb(234 88 12));
      color: white;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 200ms;
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgb(209 213 219);
      color: rgb(17 24 39);
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 200ms;
      cursor: pointer;
    }

    :host-context(.dark) .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.9);
    }

    :host-context(.dark) .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-success {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
      color: white;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 200ms;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-warning {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, rgb(249 115 22), rgb(234 88 12));
      color: white;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 200ms;
      border: none;
      cursor: pointer;
    }

    .badge-success {
      padding: 0.25rem 0.75rem;
      background: rgb(34 197 94);
      color: white;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-warning {
      padding: 0.25rem 0.75rem;
      background: rgb(249 115 22);
      color: white;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  portfolioService = inject(PortfolioService);
  authService = inject(AuthService);
  private router = inject(Router);

  status = signal<string | null>(null);
  error = signal<string | null>(null);
  inlineError = signal<string | null>(null);
  showThemeEditor = signal(false);
  isGeneratingResume = signal(false);
  resumeTemplate = 'modern';
  resumeUrl = signal<string | null>(null);

  portfolio = this.portfolioService.getPortfolio;
  portfolioUrl = this.portfolioService.portfolioUrl;
  skills = this.portfolioService.getSkills;
  projects = this.portfolioService.getProjects;
  experience = this.portfolioService.getExperience;
  education = this.portfolioService.getEducation;

  aboutError = signal<string | null>(null);
  contactError = signal<string | null>(null);
  skillError = signal<string | null>(null);
  projectError = signal<string | null>(null);
  experienceError = signal<string | null>(null);
  educationError = signal<string | null>(null);
  themeError = signal<string | null>(null);

  aboutForm: AboutData = { bio: '', description: '', yearsExperience: 0 };
  contactForm: ContactData = {
    email: '', phone: '', location: '',
    github: '', linkedin: '', medium: '',
    tableau: '', leetcode: '', instagram: '',
    youtube: '', portfolio: ''
  };

  themeForm: Partial<Theme> = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    template: 'modern',
  };

  editingSkillId = signal<string | number | null>(null);
  skillForm = { name: '', category: 'frontend' as Skill['category'], level: 80 };

  editingProjectId = signal<string | number | null>(null);
  projectForm = { title: '', description: '', image: '', liveLink: '', githubLink: '', technologies: '', featured: false };

  editingExperienceId = signal<string | number | null>(null);
  experienceForm = { company: '', position: '', duration: '', description: '', startDate: '', endDate: '' };

  editingEducationId = signal<string | number | null>(null);
  educationForm = { institution: '', degree: '', field: '', grade: '', startDate: '', endDate: '', isCurrent: false, description: '' };

  constructor() {
    // Load user's portfolio on init
    this.portfolioService.loadPortfolio(this.authService.authHeaders());

    effect(() => {
      const portfolio = this.portfolioService.getPortfolio();
      if (portfolio) {
        this.aboutForm = {
          bio: portfolio.bio ?? '',
          description: portfolio.description ?? '',
          yearsExperience: (portfolio as any).yearsExperience ?? this.portfolioService.about().yearsExperience,
        };
        this.contactForm = {
          email: portfolio.email ?? '',
          phone: portfolio.phone ?? '',
          location: portfolio.location ?? '',
          github: '',
          linkedin: '',
          medium: '',
          tableau: '',
          leetcode: '',
          instagram: '',
          youtube: '',
          portfolio: portfolio.website ?? '',
        };
      }
    });

    effect(() => {
      const theme = this.portfolioService.theme();
      if (theme) {
        this.themeForm = { ...theme };
      }
    });

    effect(() => {
      const aboutData = this.portfolioService.about();
      this.aboutForm = {
        ...this.aboutForm,
        bio: aboutData.bio,
        description: aboutData.description,
        yearsExperience: aboutData.yearsExperience,
      };
      const contactData = this.portfolioService.contact();
      this.contactForm = { ...contactData };
    });
  }

  refresh() {
    this.setStatus('Refreshing portfolio data...');
    this.portfolioService.loadPortfolio(this.authService.authHeaders());
  }

  copyPortfolioUrl() {
    const url = `${window.location.origin}/p/${this.portfolio()?.slug}`;
    navigator.clipboard.writeText(url);
    this.setStatus('Portfolio URL copied to clipboard!');
  }

  async makePublic() {
    await this.runAction(async () => {
      await this.portfolioService.toggleVisibility(this.authService.authHeaders());
    }, 'Portfolio is now public!');
  }

  async makePrivate() {
    await this.runAction(async () => {
      await this.portfolioService.toggleVisibility(this.authService.authHeaders());
    }, 'Portfolio is now private');
  }

  async saveTheme() {
    await this.runAction(async () => {
      await this.portfolioService.updateTheme(this.themeForm, this.authService.authHeaders());
    }, 'Theme saved!');
  }

  async applyPreset(preset: string) {
    await this.runAction(async () => {
      await this.portfolioService.applyPreset(preset, this.authService.authHeaders());
    }, 'Preset applied!');
  }

  async saveAbout() {
    await this.runSectionAction(this.aboutError, async () => {
      await this.portfolioService.updateAbout(this.aboutForm, this.authService.authHeaders());
    }, 'About section updated!');
  }

  async saveContact() {
    await this.runSectionAction(this.contactError, async () => {
      await this.portfolioService.updateContact(this.contactForm, this.authService.authHeaders());
    }, 'Contact section updated!');
  }

  editSkill(skill: Skill) {
    this.editingSkillId.set(skill.id);
    this.skillForm = { name: skill.name, category: skill.category, level: skill.level };
  }

  resetSkillForm() {
    this.editingSkillId.set(null);
    this.skillForm = { name: '', category: 'frontend', level: 80 };
  }

  async saveSkill() {
    await this.runSectionAction(this.skillError, async () => {
      if (this.editingSkillId()) {
        await this.portfolioService.updateSkill(this.editingSkillId()!, this.skillForm, this.authService.authHeaders());
      } else {
        await this.portfolioService.createSkill(this.skillForm, this.authService.authHeaders());
      }
      this.resetSkillForm();
    }, this.editingSkillId() ? 'Skill updated!' : 'Skill added!');
  }

  async deleteSkill(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteSkill(id, this.authService.authHeaders());
    }, 'Skill deleted!');
  }

  editProject(project: Project) {
    this.editingProjectId.set(project.id);
    this.projectForm = {
      title: project.title,
      description: project.description,
      image: project.image,
      liveLink: project.liveLink,
      githubLink: project.githubLink,
      technologies: project.technologies.join(', '),
      featured: project.featured,
    };
  }

  resetProjectForm() {
    this.editingProjectId.set(null);
    this.projectForm = { title: '', description: '', image: '', liveLink: '', githubLink: '', technologies: '', featured: false };
  }

  async saveProject() {
    const payload = {
      ...this.projectForm,
      technologies: this.projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
    };

    await this.runSectionAction(this.projectError, async () => {
      if (this.editingProjectId()) {
        await this.portfolioService.updateProject(this.editingProjectId()!, payload, this.authService.authHeaders());
      } else {
        await this.portfolioService.createProject(payload, this.authService.authHeaders());
      }
      this.resetProjectForm();
    }, this.editingProjectId() ? 'Project updated!' : 'Project added!');
  }

  async deleteProject(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteProject(id, this.authService.authHeaders());
    }, 'Project deleted!');
  }

  editExperience(item: Experience) {
    this.editingExperienceId.set(item.id);
    this.experienceForm = {
      company: item.company,
      position: item.position,
      duration: item.duration,
      description: item.description,
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
    };
  }

  resetExperienceForm() {
    this.editingExperienceId.set(null);
    this.experienceForm = { company: '', position: '', duration: '', description: '', startDate: '', endDate: '' };
  }

  async saveExperience() {
    await this.runSectionAction(this.experienceError, async () => {
      if (this.editingExperienceId()) {
        await this.portfolioService.updateExperience(this.editingExperienceId()!, this.experienceForm, this.authService.authHeaders());
      } else {
        await this.portfolioService.createExperience(this.experienceForm, this.authService.authHeaders());
      }
      this.resetExperienceForm();
    }, this.editingExperienceId() ? 'Experience updated!' : 'Experience added!');
  }

  async deleteExperience(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteExperience(id, this.authService.authHeaders());
    }, 'Experience deleted!');
  }

  editEducation(item: Education) {
    this.editingEducationId.set(item.id);
    this.educationForm = {
      institution: item.institution,
      degree: item.degree,
      field: item.field ?? '',
      grade: item.grade ?? '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      isCurrent: item.isCurrent ?? false,
      description: item.description ?? '',
    };
  }

  resetEducationForm() {
    this.editingEducationId.set(null);
    this.educationForm = { institution: '', degree: '', field: '', grade: '', startDate: '', endDate: '', isCurrent: false, description: '' };
  }

  async saveEducation() {
    await this.runSectionAction(this.educationError, async () => {
      if (this.editingEducationId()) {
        await this.portfolioService.updateEducation(this.editingEducationId()!, this.educationForm, this.authService.authHeaders());
      } else {
        await this.portfolioService.createEducation(this.educationForm, this.authService.authHeaders());
      }
      this.resetEducationForm();
    }, this.editingEducationId() ? 'Education updated!' : 'Education added!');
  }

  async deleteEducation(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteEducation(id, this.authService.authHeaders());
      this.setStatus('Education deleted!');
    });
  }

  async generateResume() {
    this.isGeneratingResume.set(true);
    try {
      const url = await this.portfolioService.generateResume(this.resumeTemplate, this.authService.authHeaders());
      this.resumeUrl.set(url);
      this.setStatus('Resume generated! Click Download to save.');
    } catch (error: any) {
      this.error.set(error.message ?? 'Failed to generate resume');
    } finally {
      this.isGeneratingResume.set(false);
    }
  }

  private setStatus(message: string) {
    this.status.set(message);
    this.error.set(null);
    setTimeout(() => this.status.set(null), 5000);
  }

  private async runAction(action: () => Promise<void>, successMessage?: string): Promise<boolean> {
    try {
      this.error.set(null);
      await action();
      if (successMessage) {
        this.setStatus(successMessage);
      }
      return true;
    } catch (error: any) {
      this.error.set(error.message ?? 'Something went wrong');
      return false;
    }
  }

  private async runSectionAction<T>(
    sectionError: { set: (msg: string | null) => void },
    action: () => Promise<T>,
    successMessage?: string
  ): Promise<boolean> {
    try {
      this.error.set(null);
      sectionError.set(null);
      await action();
      if (successMessage) {
        this.setStatus(successMessage);
      }
      return true;
    } catch (error: any) {
      sectionError.set(error.message ?? 'Something went wrong');
      return false;
    }
  }
}
