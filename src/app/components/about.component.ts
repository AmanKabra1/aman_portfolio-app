import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  template: `
    <section id="about" class="section-padding bg-gray-50 dark:bg-dark-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="mb-4 text-center">About Me</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-12"></div>

        <div class="relative mt-10 overflow-hidden rounded-[2rem] border border-white/60 dark:border-dark-700 bg-white/70 dark:bg-dark-900/60 shadow-2xl shadow-orange-100/60 dark:shadow-black/40">
          <div
            class="absolute inset-0 bg-cover bg-left-top bg-no-repeat"
            style="background-image: url('/assets/image copy.png');"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-white/85 dark:to-dark-900/90"></div>

          <div class="relative grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 p-6 md:p-10 lg:p-12 items-stretch">
            <div class="flex flex-col justify-end min-h-[420px] lg:min-h-[520px]">
              <p class="text-xs uppercase tracking-[0.35em] text-orange-300 mb-4">Workspace Story</p>
              <h3 class="text-3xl md:text-4xl font-bold text-white max-w-md leading-tight">
                Building the portfolio from the same desk where ideas turn into shipped work.
              </h3>
              <p class="text-sm md:text-base text-white/80 mt-5 max-w-md leading-relaxed">
                A quiet setup, a focused screen, and a design language shaped directly in code.
              </p>
            </div>

            <div class="flex flex-col justify-center text-right lg:pl-6">
              @if (about().bio) {
              <p class="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed text-base md:text-lg">
                {{ about().bio }}
              </p>
              }

              @if (about().description) {
              <p class="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {{ about().description }}
              </p>
              }

              @if (!about().bio && !about().description) {
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Add your about data from the admin panel to make this section fully dynamic.
              </p>
              }

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="card p-5 text-right">
                  <div class="text-3xl font-bold gradient-text mb-2">{{ about().yearsExperience }}+</div>
                  <p class="text-gray-600 dark:text-gray-400">Years of Experience</p>
                </div>

                <div class="card p-5 text-right">
                  <div class="text-3xl font-bold gradient-text mb-2">{{ projectsCount() }}</div>
                  <p class="text-gray-600 dark:text-gray-400">Projects Completed</p>
                </div>

                <div class="card p-5 text-right">
                  <div class="text-3xl font-bold gradient-text mb-2">{{ skillsCount() }}</div>
                  <p class="text-gray-600 dark:text-gray-400">Skills Added</p>
                </div>

                <div class="card p-5 text-right">
                  <div class="text-3xl font-bold gradient-text mb-2">{{ experienceCount() }}</div>
                  <p class="text-gray-600 dark:text-gray-400">Experience Entries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private portfolioService = inject(PortfolioService);

  about = this.portfolioService.about;
  projectsCount = computed(() => this.portfolioService.getProjects().length);
  skillsCount = computed(() => this.portfolioService.getSkills().length);
  experienceCount = computed(() => this.portfolioService.getExperience().length);
}
