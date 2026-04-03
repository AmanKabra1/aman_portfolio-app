import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="projects" class="section-padding bg-gray-50 dark:bg-dark-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="mb-4 text-center">Featured Projects</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-8"></div>
        <p class="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          {{ description() }}
        </p>

        @if (featuredProjects().length) {
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          @for (project of featuredProjects(); track project.id) {
          <div class="card overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div class="w-full h-48 bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
              @if (project.image) {
              <img [src]="project.image" [alt]="project.title" class="w-full h-full object-cover" />
              } @else {
              <div class="text-4xl">{{ projectEmoji(project.title) }}</div>
              }
            </div>

            <div class="p-6">
              <h3 class="mb-2 text-lg font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ project.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {{ project.description }}
              </p>

              <div class="flex flex-wrap gap-2 mb-4">
                @for (tech of project.technologies.slice(0, 3); track tech) {
                <span class="skill-badge text-xs">{{ tech }}</span>
                }
                @if (project.technologies.length > 3) {
                <span class="skill-badge text-xs">+{{ project.technologies.length - 3 }}</span>
                }
              </div>

              <div class="flex gap-3">
                @if (project.liveLink) {
                <a
                  [href]="project.liveLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-center btn-small bg-primary-500 text-white hover:bg-primary-600"
                >
                  <span>Live Demo</span>
                  <span>↗</span>
                </a>
                }
                @if (project.githubLink) {
                <a
                  [href]="project.githubLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-center btn-small border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700"
                >
                  <span>Code</span>
                  <span>⚡</span>
                </a>
                }
              </div>
            </div>
          </div>
          }
        </div>
        } @else {
        <div class="card p-8 text-center text-gray-600 dark:text-gray-400 mb-12">
          No featured projects have been added yet.
        </div>
        }

        @if (otherProjects().length) {
        <div class="text-center">
          <button
            (click)="toggleAllProjects()"
            class="btn-secondary"
          >
            {{ showAllProjects() ? 'Show Less' : 'View All Projects' }}
            <span>{{ showAllProjects() ? '△' : '▽' }}</span>
          </button>
        </div>
        }

        @if (showAllProjects()) {
        <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of otherProjects(); track project.id) {
          <div class="card overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div class="w-full h-48 bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
              @if (project.image) {
              <img [src]="project.image" [alt]="project.title" class="w-full h-full object-cover" />
              } @else {
              <div class="text-4xl">{{ projectEmoji(project.title) }}</div>
              }
            </div>

            <div class="p-6">
              <h3 class="mb-2 text-lg font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ project.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {{ project.description }}
              </p>

              <div class="flex flex-wrap gap-2 mb-4">
                @for (tech of project.technologies.slice(0, 3); track tech) {
                <span class="skill-badge text-xs">{{ tech }}</span>
                }
              </div>

              <div class="flex gap-3">
                @if (project.liveLink) {
                <a
                  [href]="project.liveLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-center btn-small bg-primary-500 text-white hover:bg-primary-600"
                >
                  <span>Live Demo</span>
                  <span>↗</span>
                </a>
                }
                @if (project.githubLink) {
                <a
                  [href]="project.githubLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-center btn-small border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700"
                >
                  <span>Code</span>
                </a>
                }
              </div>
            </div>
          </div>
          }
        </div>
        }
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  private portfolioService = inject(PortfolioService);

  projects = this.portfolioService.getProjects;
  featuredProjects = computed(() => this.projects().filter((project) => project.featured));
  otherProjects = computed(() => this.projects().filter((project) => !project.featured));
  showAllProjects = signal(false);
  description = computed(() => {
    const total = this.projects().length;
    return total
      ? `${total} project${total === 1 ? '' : 's'} loaded from your portfolio API.`
      : 'Projects added from the admin panel will appear here automatically.';
  });

  toggleAllProjects() {
    this.showAllProjects.update((v) => !v);
  }

  projectEmoji(title: string) {
    const normalized = title.toLowerCase();
    if (normalized.includes('chat')) {
      return '💬';
    }
    if (normalized.includes('shop') || normalized.includes('commerce')) {
      return '🛍️';
    }
    if (normalized.includes('portfolio')) {
      return '✨';
    }
    return '📦';
  }
}
