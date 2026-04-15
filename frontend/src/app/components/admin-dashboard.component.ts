import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';
import { AboutData, ContactData, Education, Experience, Project, Skill, SocialLink } from '../models/portfolio.model';

type ValidationErrors = Record<string, string>;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.10),_transparent_26%),linear-gradient(180deg,#fff7ed_0%,#ffffff_38%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_24%),linear-gradient(180deg,#171717_0%,#111827_42%,#0f172a_100%)]">
      <header class="sticky top-0 z-40 border-b border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.32em] text-primary-600 dark:text-primary-400">Control Center</p>
            <h1 class="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mt-2">Portfolio Admin Dashboard</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Manage your portfolio content, resume-facing sections, and public profile links from one place.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-3">
              <p class="text-[11px] uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Signed In As</p>
              <p class="text-sm font-semibold text-dark-900 dark:text-white mt-1">{{ authService.user()?.email }}</p>
            </div>
            <button class="btn-secondary" (click)="refresh()">Refresh</button>
            <button class="btn-primary" (click)="authService.logout()">Logout</button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="flex gap-1">
            <button
              (click)="currentTab.set('my-portfolio')"
              [class]="currentTab() === 'my-portfolio' ? 'tab-button active' : 'tab-button'"
            >
              📊 My Portfolio
            </button>
            <button
              (click)="currentTab.set('all-users')"
              [class]="currentTab() === 'all-users' ? 'tab-button active' : 'tab-button'"
            >
              👥 All Users
            </button>
            <button
              (click)="currentTab.set('live-updates')"
              [class]="currentTab() === 'live-updates' ? 'tab-button active' : 'tab-button'"
            >
              🔔 Live Updates
            </button>
          </nav>
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

        <!-- My Portfolio Tab -->
        @if (currentTab() === 'my-portfolio') {
          <section class="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <div class="dashboard-stat">
              <p class="dashboard-stat__label">Skills</p>
              <p class="dashboard-stat__value">{{ skills().length }}</p>
              <p class="dashboard-stat__hint">Live technologies shown on the public portfolio</p>
            </div>
            <div class="dashboard-stat">
              <p class="dashboard-stat__label">Projects</p>
              <p class="dashboard-stat__value">{{ projects().length }}</p>
              <p class="dashboard-stat__hint">Showcase entries powering portfolio and resume</p>
            </div>
            <div class="dashboard-stat">
              <p class="dashboard-stat__label">Experience</p>
              <p class="dashboard-stat__value">{{ experience().length }}</p>
              <p class="dashboard-stat__hint">Career items currently visible to visitors</p>
            </div>
            <div class="dashboard-stat">
              <p class="dashboard-stat__label">Education</p>
              <p class="dashboard-stat__value">{{ education().length }}</p>
              <p class="dashboard-stat__hint">Educational background entries</p>
            </div>
            <div class="dashboard-stat">
              <p class="dashboard-stat__label">Identity</p>
              <p class="dashboard-stat__value truncate">{{ authService.user()?.firstName || 'Admin' }}</p>
              <p class="dashboard-stat__hint">Active profile currently controlling this dashboard</p>
            </div>
          </section>

          <section class="grid lg:grid-cols-2 gap-6">
            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header">
                <div>
                  <p class="admin-panel__eyebrow">Profile Story</p>
                  <h2 class="admin-panel__title">About</h2>
                </div>
                <span class="admin-panel__icon">✍️</span>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Bio</label>
                  <textarea [(ngModel)]="aboutForm.bio" (ngModelChange)="clearValidationError('about.bio')" rows="4" class="w-full input-base" [class.input-error]="hasValidationError('about.bio')"></textarea>
                  @if (hasValidationError('about.bio')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['about.bio'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Description</label>
                  <textarea [(ngModel)]="aboutForm.description" (ngModelChange)="clearValidationError('about.description')" rows="4" class="w-full input-base" [class.input-error]="hasValidationError('about.description')"></textarea>
                  @if (hasValidationError('about.description')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['about.description'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Years of Experience</label>
                  <input [(ngModel)]="aboutForm.yearsExperience" (ngModelChange)="clearValidationError('about.yearsExperience')" type="number" class="w-full input-base" [class.input-error]="hasValidationError('about.yearsExperience')" />
                  @if (hasValidationError('about.yearsExperience')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['about.yearsExperience'] }}</p>
                  }
                </div>
                <button class="btn-primary" (click)="saveAbout()">Save About</button>
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header">
                <div>
                  <p class="admin-panel__eyebrow">Public Reach</p>
                  <h2 class="admin-panel__title">Contact & Social Links</h2>
                </div>
                <span class="admin-panel__icon">🔗</span>
              </div>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Email</label>
                  <input [(ngModel)]="contactForm.email" (ngModelChange)="clearValidationError('contact.email')" type="email" class="w-full input-base" [class.input-error]="hasValidationError('contact.email')" />
                  @if (hasValidationError('contact.email')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.email'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Phone</label>
                  <input [(ngModel)]="contactForm.phone" (ngModelChange)="clearValidationError('contact.phone')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.phone')" />
                  @if (hasValidationError('contact.phone')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.phone'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Location</label>
                  <input [(ngModel)]="contactForm.location" (ngModelChange)="clearValidationError('contact.location')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.location')" />
                  @if (hasValidationError('contact.location')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.location'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">GitHub</label>
                  <input [(ngModel)]="contactForm.github" (ngModelChange)="clearValidationError('contact.github')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.github')" />
                  @if (hasValidationError('contact.github')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.github'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">LinkedIn</label>
                  <input [(ngModel)]="contactForm.linkedin" (ngModelChange)="clearValidationError('contact.linkedin')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.linkedin')" />
                  @if (hasValidationError('contact.linkedin')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.linkedin'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Medium</label>
                  <input [(ngModel)]="contactForm.medium" (ngModelChange)="clearValidationError('contact.medium')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.medium')" />
                  @if (hasValidationError('contact.medium')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.medium'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Tableau</label>
                  <input [(ngModel)]="contactForm.tableau" (ngModelChange)="clearValidationError('contact.tableau')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.tableau')" />
                  @if (hasValidationError('contact.tableau')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.tableau'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">LeetCode</label>
                  <input [(ngModel)]="contactForm.leetcode" (ngModelChange)="clearValidationError('contact.leetcode')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.leetcode')" />
                  @if (hasValidationError('contact.leetcode')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.leetcode'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Instagram</label>
                  <input [(ngModel)]="contactForm.instagram" (ngModelChange)="clearValidationError('contact.instagram')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.instagram')" />
                  @if (hasValidationError('contact.instagram')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.instagram'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">YouTube</label>
                  <input [(ngModel)]="contactForm.youtube" (ngModelChange)="clearValidationError('contact.youtube')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.youtube')" />
                  @if (hasValidationError('contact.youtube')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.youtube'] }}</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-dark-900 dark:text-white">Portfolio Website</label>
                  <input [(ngModel)]="contactForm.portfolio" (ngModelChange)="clearValidationError('contact.portfolio')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('contact.portfolio')" />
                  @if (hasValidationError('contact.portfolio')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['contact.portfolio'] }}</p>
                  }
                </div>
                <div class="md:col-span-2 pt-2">
                  <button class="btn-primary" (click)="saveContact()">Save Contact</button>
                </div>
              </div>
            </div>
          </section>

          <section class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 admin-panel p-6 md:p-7">
              <div class="admin-panel__header mb-4">
                <div>
                  <p class="admin-panel__eyebrow">Capabilities</p>
                  <h2 class="admin-panel__title">Skills</h2>
                </div>
                <button class="btn-secondary" (click)="resetSkillForm()">New Skill</button>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-white/10">
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
                      <tr class="border-b border-gray-100 dark:border-dark-800 bg-white/70 dark:bg-transparent">
                        <td class="py-3 px-4 font-medium">{{ skill.name }}</td>
                        <td class="py-3 px-4 capitalize">{{ skill.category }}</td>
                        <td class="py-3 px-4">{{ skill.level }}%</td>
                        <td class="py-3 px-4 flex gap-2">
                          <button class="btn-secondary !px-3 !py-2" (click)="editSkill(skill)">Edit</button>
                          <button class="btn-secondary !px-3 !py-2 !text-red-600" (click)="deleteSkill(skill.id)">Delete</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header compact">
                <div>
                  <p class="admin-panel__eyebrow">Editor</p>
                  <h3 class="admin-panel__title">{{ editingSkillId() ? 'Edit Skill' : 'Add Skill' }}</h3>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <input [(ngModel)]="skillForm.name" (ngModelChange)="clearValidationError('skill.name')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('skill.name')" placeholder="Skill name" />
                  @if (hasValidationError('skill.name')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['skill.name'] }}</p>
                  }
                </div>
                <div>
                  <select [(ngModel)]="skillForm.category" (ngModelChange)="clearValidationError('skill.category')" class="w-full input-base" [class.input-error]="hasValidationError('skill.category')">
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="database">Database</option>
                    <option value="tools">Tools</option>
                  </select>
                  @if (hasValidationError('skill.category')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['skill.category'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="skillForm.level" (ngModelChange)="clearValidationError('skill.level')" type="number" class="w-full input-base" [class.input-error]="hasValidationError('skill.level')" placeholder="Level" />
                  @if (hasValidationError('skill.level')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['skill.level'] }}</p>
                  }
                </div>
                <button class="btn-primary w-full" (click)="saveSkill()">{{ editingSkillId() ? 'Update Skill' : 'Add Skill' }}</button>
              </div>
            </div>
          </section>

          <section class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 admin-panel p-6 md:p-7">
              <div class="admin-panel__header mb-4">
                <div>
                  <p class="admin-panel__eyebrow">Showcase</p>
                  <h2 class="admin-panel__title">Projects</h2>
                </div>
                <button class="btn-secondary" (click)="resetProjectForm()">New Project</button>
              </div>

              <div class="space-y-4">
                @for (project of projects(); track project.id) {
                  <div class="rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 class="font-semibold text-dark-900 dark:text-white">{{ project.title }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ project.description }}</p>
                      </div>
                      <div class="flex gap-2">
                        <button class="btn-secondary !px-3 !py-2" (click)="editProject(project)">Edit</button>
                        <button class="btn-secondary !px-3 !py-2 !text-red-600" (click)="deleteProject(project.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header compact">
                <div>
                  <p class="admin-panel__eyebrow">Editor</p>
                  <h3 class="admin-panel__title">{{ editingProjectId() ? 'Edit Project' : 'Add Project' }}</h3>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <input [(ngModel)]="projectForm.title" (ngModelChange)="clearValidationError('project.title')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('project.title')" placeholder="Title" />
                  @if (hasValidationError('project.title')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.title'] }}</p>
                  }
                </div>
                <div>
                  <textarea [(ngModel)]="projectForm.description" (ngModelChange)="clearValidationError('project.description')" rows="4" class="w-full input-base" [class.input-error]="hasValidationError('project.description')" placeholder="Description"></textarea>
                  @if (hasValidationError('project.description')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.description'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="projectForm.image" (ngModelChange)="clearValidationError('project.image')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('project.image')" placeholder="Image URL" />
                  @if (hasValidationError('project.image')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.image'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="projectForm.liveLink" (ngModelChange)="clearValidationError('project.liveLink')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('project.liveLink')" placeholder="Live link" />
                  @if (hasValidationError('project.liveLink')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.liveLink'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="projectForm.githubLink" (ngModelChange)="clearValidationError('project.githubLink')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('project.githubLink')" placeholder="GitHub link" />
                  @if (hasValidationError('project.githubLink')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.githubLink'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="projectForm.technologies" (ngModelChange)="clearValidationError('project.technologies')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('project.technologies')" placeholder="Technologies separated by comma" />
                  @if (hasValidationError('project.technologies')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['project.technologies'] }}</p>
                  }
                </div>
                <label class="flex items-center gap-3 text-sm text-dark-900 dark:text-white">
                  <input [(ngModel)]="projectForm.featured" type="checkbox" />
                  Featured project
                </label>
                <button class="btn-primary w-full" (click)="saveProject()">{{ editingProjectId() ? 'Update Project' : 'Add Project' }}</button>
              </div>
            </div>
          </section>

          <section class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 admin-panel p-6 md:p-7">
              <div class="admin-panel__header mb-4">
                <div>
                  <p class="admin-panel__eyebrow">Career Timeline</p>
                  <h2 class="admin-panel__title">Experience</h2>
                </div>
                <button class="btn-secondary" (click)="resetExperienceForm()">New Experience</button>
              </div>

              <div class="space-y-4">
                @for (item of experience(); track item.id) {
                  <div class="rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 class="font-semibold text-dark-900 dark:text-white">{{ item.position }} at {{ item.company }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.duration }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ item.description }}</p>
                      </div>
                      <div class="flex gap-2">
                        <button class="btn-secondary !px-3 !py-2" (click)="editExperience(item)">Edit</button>
                        <button class="btn-secondary !px-3 !py-2 !text-red-600" (click)="deleteExperience(item.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header compact">
                <div>
                  <p class="admin-panel__eyebrow">Editor</p>
                  <h3 class="admin-panel__title">{{ editingExperienceId() ? 'Edit Experience' : 'Add Experience' }}</h3>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <input [(ngModel)]="experienceForm.company" (ngModelChange)="clearValidationError('experience.company')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('experience.company')" placeholder="Company" />
                  @if (hasValidationError('experience.company')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.company'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="experienceForm.position" (ngModelChange)="clearValidationError('experience.position')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('experience.position')" placeholder="Position" />
                  @if (hasValidationError('experience.position')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.position'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="experienceForm.duration" (ngModelChange)="clearValidationError('experience.duration')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('experience.duration')" placeholder="Duration" />
                  @if (hasValidationError('experience.duration')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.duration'] }}</p>
                  }
                </div>
                <div>
                  <textarea [(ngModel)]="experienceForm.description" (ngModelChange)="clearValidationError('experience.description')" rows="4" class="w-full input-base" [class.input-error]="hasValidationError('experience.description')" placeholder="Description"></textarea>
                  @if (hasValidationError('experience.description')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.description'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="experienceForm.startDate" (ngModelChange)="clearValidationError('experience.startDate')" type="date" class="w-full input-base" [class.input-error]="hasValidationError('experience.startDate')" />
                  @if (hasValidationError('experience.startDate')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.startDate'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="experienceForm.endDate" (ngModelChange)="clearValidationError('experience.endDate')" type="date" class="w-full input-base" [class.input-error]="hasValidationError('experience.endDate')" />
                  @if (hasValidationError('experience.endDate')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['experience.endDate'] }}</p>
                  }
                </div>
                <button class="btn-primary w-full" (click)="saveExperience()">{{ editingExperienceId() ? 'Update Experience' : 'Add Experience' }}</button>
              </div>
            </div>
          </section>

          <section class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 admin-panel p-6 md:p-7">
              <div class="admin-panel__header mb-4">
                <div>
                  <p class="admin-panel__eyebrow">Academic Background</p>
                  <h2 class="admin-panel__title">Education</h2>
                </div>
                <button class="btn-secondary" (click)="resetEducationForm()">New Education</button>
              </div>

              <div class="space-y-4">
                @for (item of education(); track item.id) {
                  <div class="rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 class="font-semibold text-dark-900 dark:text-white">{{ item.degree }} at {{ item.institution }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.field }} {{ item.grade ? '• ' + item.grade : '' }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.startDate | date:'MMM yyyy' }} - {{ item.isCurrent ? 'Present' : ((item.endDate ?? '') | date:'MMM yyyy') }}</p>
                        @if (item.description) {
                          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ item.description }}</p>
                        }
                      </div>
                      <div class="flex gap-2">
                        <button class="btn-secondary !px-3 !py-2" (click)="editEducation(item)">Edit</button>
                        <button class="btn-secondary !px-3 !py-2 !text-red-600" (click)="deleteEducation(item.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header compact">
                <div>
                  <p class="admin-panel__eyebrow">Editor</p>
                  <h3 class="admin-panel__title">{{ editingEducationId() ? 'Edit Education' : 'Add Education' }}</h3>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <input [(ngModel)]="educationForm.institution" (ngModelChange)="clearValidationError('education.institution')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('education.institution')" placeholder="Institution" />
                  @if (hasValidationError('education.institution')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['education.institution'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="educationForm.degree" (ngModelChange)="clearValidationError('education.degree')" type="text" class="w-full input-base" [class.input-error]="hasValidationError('education.degree')" placeholder="Degree" />
                  @if (hasValidationError('education.degree')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['education.degree'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="educationForm.field" type="text" class="w-full input-base" placeholder="Field of study" />
                </div>
                <div>
                  <input [(ngModel)]="educationForm.grade" type="text" class="w-full input-base" placeholder="Grade/GPA" />
                </div>
                <div>
                  <input [(ngModel)]="educationForm.startDate" (ngModelChange)="clearValidationError('education.startDate')" type="date" class="w-full input-base" [class.input-error]="hasValidationError('education.startDate')" />
                  @if (hasValidationError('education.startDate')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['education.startDate'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="educationForm.endDate" type="date" class="w-full input-base" />
                </div>
                <label class="flex items-center gap-3 text-sm text-dark-900 dark:text-white">
                  <input [(ngModel)]="educationForm.isCurrent" type="checkbox" />
                  Currently studying
                </label>
                <div>
                  <textarea [(ngModel)]="educationForm.description" rows="4" class="w-full input-base" placeholder="Description"></textarea>
                </div>
                <button class="btn-primary w-full" (click)="saveEducation()">{{ editingEducationId() ? 'Update Education' : 'Add Education' }}</button>
              </div>
            </div>
          </section>

          <section class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 admin-panel p-6 md:p-7">
              <div class="admin-panel__header mb-4">
                <div>
                  <p class="admin-panel__eyebrow">Online Presence</p>
                  <h2 class="admin-panel__title">Social Links</h2>
                </div>
                <button class="btn-secondary" (click)="resetSocialLinkForm()">New Link</button>
              </div>

              <div class="space-y-4">
                @for (link of socialLinks(); track link.id) {
                  <div class="rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 class="font-semibold text-dark-900 dark:text-white capitalize">{{ link.platform }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ link.url }}</p>
                        @if (link.username) {
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ link.username }}</p>
                        }
                      </div>
                      <div class="flex gap-2">
                        <button class="btn-secondary !px-3 !py-2" (click)="editSocialLink(link)">Edit</button>
                        <button class="btn-secondary !px-3 !py-2 !text-red-600" (click)="deleteSocialLink(link.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="admin-panel p-6 md:p-7">
              <div class="admin-panel__header compact">
                <div>
                  <p class="admin-panel__eyebrow">Editor</p>
                  <h3 class="admin-panel__title">{{ editingSocialLinkId() ? 'Edit Link' : 'Add Link' }}</h3>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <select [(ngModel)]="socialLinkForm.platform" (ngModelChange)="clearValidationError('socialLink.platform')" class="w-full input-base" [class.input-error]="hasValidationError('socialLink.platform')">
                    <option value="">Select Platform</option>
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="medium">Medium</option>
                    <option value="dev">Dev.to</option>
                    <option value="stackoverflow">Stack Overflow</option>
                    <option value="behance">Behance</option>
                    <option value="dribbble">Dribbble</option>
                    <option value="website">Website</option>
                  </select>
                  @if (hasValidationError('socialLink.platform')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['socialLink.platform'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="socialLinkForm.url" (ngModelChange)="clearValidationError('socialLink.url')" type="url" class="w-full input-base" [class.input-error]="hasValidationError('socialLink.url')" placeholder="https://..." />
                  @if (hasValidationError('socialLink.url')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ validationErrors()['socialLink.url'] }}</p>
                  }
                </div>
                <div>
                  <input [(ngModel)]="socialLinkForm.username" type="text" class="w-full input-base" placeholder="Username (optional)" />
                </div>
                <button class="btn-primary w-full" (click)="saveSocialLink()">{{ editingSocialLinkId() ? 'Update Link' : 'Add Link' }}</button>
              </div>
            </div>
          </section>
        }

        <!-- All Users Tab -->
        @if (currentTab() === 'all-users') {
          <section class="admin-panel p-6 md:p-7">
            <div class="admin-panel__header mb-4">
              <div>
                <p class="admin-panel__eyebrow">User Management</p>
                <h2 class="admin-panel__title">All Portfolio Users</h2>
              </div>
              <button class="btn-secondary" (click)="loadAllUsers()">↻ Refresh Users</button>
            </div>

            @if (isLoadingUsers()) {
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">Loading users...</div>
            } @else if (allUsers().length === 0) {
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">No users found</div>
            } @else {
              <div class="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-white/10">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-white/5">
                    <tr class="text-left border-b border-gray-200 dark:border-dark-700">
                      <th class="py-3 px-4">Name</th>
                      <th class="py-3 px-4">Email</th>
                      <th class="py-3 px-4">Role</th>
                      <th class="py-3 px-4">Portfolio</th>
                      <th class="py-3 px-4">Status</th>
                      <th class="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of allUsers(); track user.id) {
                      <tr class="border-b border-gray-100 dark:border-dark-800 bg-white/70 dark:bg-transparent">
                        <td class="py-3 px-4 font-medium">{{ user.firstName || '' }} {{ user.lastName || '' }}</td>
                        <td class="py-3 px-4">{{ user.email }}</td>
                        <td class="py-3 px-4 capitalize">{{ user.role }}</td>
                        <td class="py-3 px-4">
                          @if (user.portfolio) {
                            <span class="text-primary-600">{{ user.portfolio.title || user.portfolio.slug }}</span>
                          } @else {
                            <span class="text-gray-400">No portfolio</span>
                          }
                        </td>
                        <td class="py-3 px-4">
                          @if (user.portfolio?.isPublic) {
                            <span class="badge-success">Public</span>
                          } @else {
                            <span class="badge-warning">Private</span>
                          }
                        </td>
                        <td class="py-3 px-4">
                          <button class="btn-secondary !px-3 !py-2" (click)="viewUserPortfolio(user.id)">View</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        }

        <!-- Live Updates Tab -->
        @if (currentTab() === 'live-updates') {
          <section class="admin-panel p-6 md:p-7">
            <div class="admin-panel__header mb-4">
              <div>
                <p class="admin-panel__eyebrow">Real-time</p>
                <h2 class="admin-panel__title">Live Updates</h2>
              </div>
              <button class="btn-secondary" (click)="refresh()">↻ Refresh</button>
            </div>

            <div class="space-y-4">
              <div class="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <h3 class="font-semibold text-dark-900 dark:text-white mb-2">📊 Portfolio Statistics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div class="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p class="text-2xl font-bold text-primary-600">{{ skills().length }}</p>
                    <p class="text-xs text-gray-500">Skills</p>
                  </div>
                  <div class="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p class="text-2xl font-bold text-primary-600">{{ projects().length }}</p>
                    <p class="text-xs text-gray-500">Projects</p>
                  </div>
                  <div class="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p class="text-2xl font-bold text-primary-600">{{ experience().length }}</p>
                    <p class="text-xs text-gray-500">Experience</p>
                  </div>
                  <div class="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p class="text-2xl font-bold text-primary-600">{{ education().length }}</p>
                    <p class="text-xs text-gray-500">Education</p>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <h3 class="font-semibold text-dark-900 dark:text-white mb-2">🔗 Recent Activity</h3>
                <div class="space-y-2 mt-3">
                  <div class="flex items-center gap-3 text-sm">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span class="text-gray-600 dark:text-gray-400">Portfolio data loaded successfully</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span class="text-gray-600 dark:text-gray-400">Theme settings available</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-gray-500 dark:text-gray-400">All systems operational</span>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <h3 class="font-semibold text-dark-900 dark:text-white mb-2">⚡ Quick Actions</h3>
                <div class="flex flex-wrap gap-3 mt-3">
                  <button class="btn-secondary" (click)="refresh()">Refresh Data</button>
                  <button class="btn-secondary" (click)="exportData()">Export Data</button>
                </div>
              </div>
            </div>
          </section>
        }
      </main>
    </div>
  `,
  styles: [
    `
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

      .admin-panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .admin-panel__header.compact {
        margin-bottom: 1rem;
      }

      .admin-panel__eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgb(249 115 22);
      }

      .admin-panel__title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 700;
        color: rgb(17 24 39);
      }

      :host-context(.dark) .admin-panel__title {
        color: white;
      }

      .admin-panel__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 999px;
        background: rgba(249, 115, 22, 0.14);
        font-size: 1.1rem;
      }

      .dashboard-stat {
        border: 1px solid rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.86);
        border-radius: 1.25rem;
        padding: 1.1rem 1.15rem;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
      }

      :host-context(.dark) .dashboard-stat {
        border-color: rgba(255, 255, 255, 0.08);
        background: rgba(15, 23, 42, 0.7);
      }

      .dashboard-stat__label {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgb(249 115 22);
      }

      .dashboard-stat__value {
        margin: 0.5rem 0 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: rgb(17 24 39);
      }

      :host-context(.dark) .dashboard-stat__value {
        color: white;
      }

      .dashboard-stat__hint {
        margin: 0.4rem 0 0;
        font-size: 0.84rem;
        line-height: 1.45;
        color: rgb(107 114 128);
      }

      :host-context(.dark) .dashboard-stat__hint {
        color: rgb(156 163 175);
      }

      .input-base {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid rgb(209 213 219);
        background: white;
        color: rgb(17 24 39);
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

      .input-error {
        border-color: rgb(248 113 113);
      }

      .tab-button {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        color: rgb(107 114 128);
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 200ms;
      }

      .tab-button:hover {
        color: rgb(249 115 22);
        background: rgba(249, 115, 22, 0.05);
      }

      .tab-button.active {
        color: rgb(249 115 22);
        background: rgba(249, 115, 22, 0.1);
        border-color: rgba(249, 115, 22, 0.2);
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  portfolioService = inject(PortfolioService);
  authService = inject(AuthService);

  status = signal<string | null>(null);
  error = signal<string | null>(null);
  validationErrors = signal<ValidationErrors>({});

  // Tab navigation
  currentTab = signal<'my-portfolio' | 'all-users' | 'live-updates'>('my-portfolio');

  // Users management
  allUsers = signal<any[]>([]);
  isLoadingUsers = signal(false);

  aboutForm: AboutData = { bio: '', description: '', yearsExperience: 0 };
  contactForm: ContactData = {
    email: '',
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

  editingSkillId = signal<string | number | null>(null);
  skillForm = { name: '', category: 'frontend' as Skill['category'], level: 80 };

  editingProjectId = signal<string | number | null>(null);
  projectForm = {
    title: '',
    description: '',
    image: '',
    liveLink: '',
    githubLink: '',
    technologies: '',
    featured: false,
  };

  editingExperienceId = signal<string | number | null>(null);
  experienceForm = {
    company: '',
    position: '',
    duration: '',
    description: '',
    startDate: '',
    endDate: '',
  };

  skills = this.portfolioService.getSkills;
  projects = this.portfolioService.getProjects;
  experience = this.portfolioService.getExperience;
  education = this.portfolioService.getEducation;
  socialLinks = this.portfolioService.getSocialLinks;

  editingEducationId = signal<string | number | null>(null);
  educationForm = {
    institution: '',
    degree: '',
    field: '',
    grade: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  };

  editingSocialLinkId = signal<string | number | null>(null);
  socialLinkForm = {
    platform: '',
    url: '',
    username: '',
  };

  constructor() {
    effect(() => {
      this.aboutForm = { ...this.portfolioService.about() };
      this.contactForm = { ...this.portfolioService.contact() };
    });
  }

  refresh() {
    this.setStatus('Refreshing portfolio data...');
    // loadPortfolio() is async - it updates signals via subscription
    // The effect() on signals will auto-hydrate forms when data arrives
    this.portfolioService.loadPortfolio();
  }

  async saveAbout() {
    const errors = this.validateAbout();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      await this.portfolioService.updateAbout(this.aboutForm, this.authService.authHeaders());
    }, 'About section updated successfully!');
  }

  async saveContact() {
    const errors = this.validateContact();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      await this.portfolioService.updateContact(this.contactForm, this.authService.authHeaders());
    }, 'Contact section updated successfully!');
  }

  editSkill(skill: Skill) {
    this.editingSkillId.set(skill.id);
    this.skillForm = { name: skill.name, category: skill.category, level: skill.level };
    this.clearValidationGroup('skill.');
  }

  resetSkillForm() {
    this.editingSkillId.set(null);
    this.skillForm = { name: '', category: 'frontend', level: 80 };
    this.clearValidationGroup('skill.');
  }

  async saveSkill() {
    const errors = this.validateSkill();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      if (this.editingSkillId()) {
        await this.portfolioService.updateSkill(
          this.editingSkillId()!,
          this.skillForm,
          this.authService.authHeaders()
        );
      } else {
        await this.portfolioService.createSkill(this.skillForm, this.authService.authHeaders());
      }
      this.resetSkillForm();
    }, this.editingSkillId() ? 'Skill updated successfully!' : 'Skill added successfully!');
  }

  async deleteSkill(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteSkill(id, this.authService.authHeaders());
      if (this.editingSkillId() === id) {
        this.resetSkillForm();
      }
    }, 'Skill deleted successfully!');
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
    this.clearValidationGroup('project.');
  }

  resetProjectForm() {
    this.editingProjectId.set(null);
    this.projectForm = {
      title: '',
      description: '',
      image: '',
      liveLink: '',
      githubLink: '',
      technologies: '',
      featured: false,
    };
    this.clearValidationGroup('project.');
  }

  async saveProject() {
    const payload = {
      ...this.projectForm,
      technologies: this.projectForm.technologies
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
    };

    const errors = this.validateProject(payload.technologies);
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      if (this.editingProjectId()) {
        await this.portfolioService.updateProject(
          this.editingProjectId()!,
          payload,
          this.authService.authHeaders()
        );
      } else {
        await this.portfolioService.createProject(payload, this.authService.authHeaders());
      }
      this.resetProjectForm();
    }, this.editingProjectId() ? 'Project updated successfully!' : 'Project added successfully!');
  }

  async deleteProject(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteProject(id, this.authService.authHeaders());
      if (this.editingProjectId() === id) {
        this.resetProjectForm();
      }
    }, 'Project deleted successfully!');
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
    this.clearValidationGroup('experience.');
  }

  resetExperienceForm() {
    this.editingExperienceId.set(null);
    this.experienceForm = {
      company: '',
      position: '',
      duration: '',
      description: '',
      startDate: '',
      endDate: '',
    };
    this.clearValidationGroup('experience.');
  }

  async saveExperience() {
    const errors = this.validateExperience();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      if (this.editingExperienceId()) {
        await this.portfolioService.updateExperience(
          this.editingExperienceId()!,
          this.experienceForm,
          this.authService.authHeaders()
        );
      } else {
        await this.portfolioService.createExperience(
          this.experienceForm,
          this.authService.authHeaders()
        );
      }
      this.resetExperienceForm();
    }, this.editingExperienceId() ? 'Experience updated successfully!' : 'Experience added successfully!');
  }

  async deleteExperience(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteExperience(id, this.authService.authHeaders());
      if (this.editingExperienceId() === id) {
        this.resetExperienceForm();
      }
    }, 'Experience deleted successfully!');
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
    this.clearValidationGroup('education.');
  }

  resetEducationForm() {
    this.editingEducationId.set(null);
    this.educationForm = {
      institution: '',
      degree: '',
      field: '',
      grade: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    this.clearValidationGroup('education.');
  }

  async saveEducation() {
    const errors = this.validateEducation();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      if (this.editingEducationId()) {
        await this.portfolioService.updateEducation(
          this.editingEducationId()!,
          this.educationForm,
          this.authService.authHeaders()
        );
      } else {
        await this.portfolioService.createEducation(
          this.educationForm,
          this.authService.authHeaders()
        );
      }
      this.resetEducationForm();
    }, this.editingEducationId() ? 'Education updated successfully!' : 'Education added successfully!');
  }

  async deleteEducation(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteEducation(id, this.authService.authHeaders());
      if (this.editingEducationId() === id) {
        this.resetEducationForm();
      }
    }, 'Education deleted successfully!');
  }

  editSocialLink(link: SocialLink) {
    this.editingSocialLinkId.set(link.id);
    this.socialLinkForm = {
      platform: link.platform,
      url: link.url,
      username: link.username ?? '',
    };
    this.clearValidationGroup('socialLink.');
  }

  resetSocialLinkForm() {
    this.editingSocialLinkId.set(null);
    this.socialLinkForm = {
      platform: '',
      url: '',
      username: '',
    };
    this.clearValidationGroup('socialLink.');
  }

  async saveSocialLink() {
    const errors = this.validateSocialLink();
    if (errors) {
      return;
    }

    await this.runAction(async () => {
      if (this.editingSocialLinkId()) {
        await this.portfolioService.updateSocialLink(
          this.editingSocialLinkId()!,
          this.socialLinkForm,
          this.authService.authHeaders()
        );
      } else {
        await this.portfolioService.createSocialLink(
          this.socialLinkForm,
          this.authService.authHeaders()
        );
      }
      this.resetSocialLinkForm();
    }, this.editingSocialLinkId() ? 'Social link updated successfully!' : 'Social link added successfully!');
  }

  async deleteSocialLink(id: string | number) {
    await this.runAction(async () => {
      await this.portfolioService.deleteSocialLink(id, this.authService.authHeaders());
      if (this.editingSocialLinkId() === id) {
        this.resetSocialLinkForm();
      }
    }, 'Social link deleted successfully!');
  }

  hasValidationError(key: string) {
    return Boolean(this.validationErrors()[key]);
  }

  clearValidationError(key: string) {
    this.validationErrors.update((errors) => {
      if (!errors[key]) {
        return errors;
      }

      const next = { ...errors };
      delete next[key];
      return next;
    });
    this.error.set(null);
  }

  private clearValidationGroup(prefix: string) {
    this.validationErrors.update((errors) => {
      const next = { ...errors };
      for (const key of Object.keys(next)) {
        if (key.startsWith(prefix)) {
          delete next[key];
        }
      }
      return next;
    });
  }

  private hydrateForms() {
    this.aboutForm = { ...this.portfolioService.about() };
    this.contactForm = { ...this.portfolioService.contact() };
  }

  private setStatus(message: string) {
    this.status.set(message);
    this.error.set(null);
  }

  private setValidationErrors(errors: ValidationErrors) {
    this.validationErrors.set(errors);
    this.error.set('Please fix the highlighted fields.');
    return true;
  }

  private validateAbout() {
    const errors: ValidationErrors = {};

    if (!this.aboutForm.bio.trim()) {
      errors['about.bio'] = 'Bio is required.';
    } else if (this.aboutForm.bio.trim().length < 20) {
      errors['about.bio'] = 'Bio must be at least 20 characters.';
    }

    if (!this.aboutForm.description.trim()) {
      errors['about.description'] = 'Description is required.';
    } else if (this.aboutForm.description.trim().length < 30) {
      errors['about.description'] = 'Description must be at least 30 characters.';
    }

    if (this.aboutForm.yearsExperience < 0 || this.aboutForm.yearsExperience > 50) {
      errors['about.yearsExperience'] = 'Years of experience must be between 0 and 50.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateContact() {
    const errors: ValidationErrors = {};
    const email = this.contactForm.email.trim();
    const phone = this.contactForm.phone.trim();
    const location = this.contactForm.location.trim();

    if (!email) {
      errors['contact.email'] = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['contact.email'] = 'Enter a valid email address.';
    }

    if (!phone) {
      errors['contact.phone'] = 'Phone is required.';
    } else if (phone.length < 7) {
      errors['contact.phone'] = 'Phone number looks too short.';
    }

    if (!location) {
      errors['contact.location'] = 'Location is required.';
    }

    const socialUrlFields: Array<keyof ContactData> = [
      'github',
      'linkedin',
      'medium',
      'tableau',
      'leetcode',
      'instagram',
      'youtube',
      'portfolio',
    ];

    for (const field of socialUrlFields) {
      const value = this.contactForm[field]?.trim();
      if (value && !this.isValidUrl(value)) {
        errors[`contact.${field}`] = 'Enter a valid URL.';
      }
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateSkill() {
    const errors: ValidationErrors = {};

    if (!this.skillForm.name.trim()) {
      errors['skill.name'] = 'Skill name is required.';
    }

    if (!this.skillForm.category) {
      errors['skill.category'] = 'Select a category.';
    }

    if (this.skillForm.level < 0 || this.skillForm.level > 100) {
      errors['skill.level'] = 'Level must be between 0 and 100.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateProject(technologies: string[]) {
    const errors: ValidationErrors = {};

    if (!this.projectForm.title.trim()) {
      errors['project.title'] = 'Project title is required.';
    }

    if (!this.projectForm.description.trim()) {
      errors['project.description'] = 'Project description is required.';
    } else if (this.projectForm.description.trim().length < 20) {
      errors['project.description'] = 'Description must be at least 20 characters.';
    }

    if (this.projectForm.image.trim() && !this.isValidUrl(this.projectForm.image)) {
      errors['project.image'] = 'Enter a valid image URL.';
    }

    if (this.projectForm.liveLink.trim() && !this.isValidUrl(this.projectForm.liveLink)) {
      errors['project.liveLink'] = 'Enter a valid live URL.';
    }

    if (this.projectForm.githubLink.trim() && !this.isValidUrl(this.projectForm.githubLink)) {
      errors['project.githubLink'] = 'Enter a valid GitHub URL.';
    }

    if (!technologies.length) {
      errors['project.technologies'] = 'Add at least one technology.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateExperience() {
    const errors: ValidationErrors = {};

    if (!this.experienceForm.company.trim()) {
      errors['experience.company'] = 'Company is required.';
    }

    if (!this.experienceForm.position.trim()) {
      errors['experience.position'] = 'Position is required.';
    }

    if (!this.experienceForm.duration.trim()) {
      errors['experience.duration'] = 'Duration is required.';
    }

    if (!this.experienceForm.description.trim()) {
      errors['experience.description'] = 'Description is required.';
    } else if (this.experienceForm.description.trim().length < 20) {
      errors['experience.description'] = 'Description must be at least 20 characters.';
    }

    if (!this.experienceForm.startDate) {
      errors['experience.startDate'] = 'Start date is required.';
    }

    if (this.experienceForm.endDate && this.experienceForm.startDate && this.experienceForm.endDate < this.experienceForm.startDate) {
      errors['experience.endDate'] = 'End date cannot be before start date.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateEducation() {
    const errors: ValidationErrors = {};

    if (!this.educationForm.institution.trim()) {
      errors['education.institution'] = 'Institution is required.';
    }

    if (!this.educationForm.degree.trim()) {
      errors['education.degree'] = 'Degree is required.';
    }

    if (!this.educationForm.startDate) {
      errors['education.startDate'] = 'Start date is required.';
    }

    if (this.educationForm.endDate && this.educationForm.startDate && this.educationForm.endDate < this.educationForm.startDate) {
      errors['education.endDate'] = 'End date cannot be before start date.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private validateSocialLink() {
    const errors: ValidationErrors = {};

    if (!this.socialLinkForm.platform.trim()) {
      errors['socialLink.platform'] = 'Platform is required.';
    }

    if (!this.socialLinkForm.url.trim()) {
      errors['socialLink.url'] = 'URL is required.';
    } else if (!this.isValidUrl(this.socialLinkForm.url.trim())) {
      errors['socialLink.url'] = 'Enter a valid URL.';
    }

    return Object.keys(errors).length ? this.setValidationErrors(errors) : false;
  }

  private isValidUrl(value: string) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async runAction(action: () => Promise<void>, successMessage?: string) {
    try {
      this.error.set(null);
      await action();
      this.validationErrors.set({});
      this.hydrateForms();
      if (successMessage) {
        this.status.set(successMessage);
        this.error.set(null);
      }
    } catch (error: any) {
      this.error.set(error.message ?? 'Something went wrong.');
    }
  }

  // Users management
  async loadAllUsers() {
    this.isLoadingUsers.set(true);
    try {
      const users = await this.portfolioService.fetchAllUsers(this.authService.authHeaders());
      this.allUsers.set(users);
    } catch (error: any) {
      this.error.set('Failed to load users: ' + (error.message ?? 'Unknown error'));
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  async viewUserPortfolio(userId: number | string) {
    try {
      const portfolio = await this.portfolioService.fetchUserPortfolio(userId, this.authService.authHeaders());
      if (portfolio) {
        this.setStatus(`Loaded portfolio for user ID: ${userId}`);
      } else {
        this.error.set('Portfolio not found for this user');
      }
    } catch (error: any) {
      this.error.set('Failed to load user portfolio: ' + (error.message ?? 'Unknown error'));
    }
  }

  exportData() {
    const data = {
      skills: this.skills(),
      projects: this.projects(),
      experience: this.experience(),
      education: this.education(),
      socialLinks: this.socialLinks(),
      about: this.portfolioService.about(),
      contact: this.portfolioService.contact(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.setStatus('Data exported successfully!');
  }
}
