import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="experience" class="section-padding">
      <div class="max-w-4xl mx-auto">
        <h2 class="mb-4 text-center">Experience</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-12"></div>

        <div class="relative">
          @if (experience().length) {
          <div
            class="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-orange-500"
          ></div>

          <div class="space-y-8 md:space-y-0">
            @for (item of experience(); let idx = $index; track item.id) {
            <div [class.md:ml-auto]="idx % 2 === 0" [class.md:mr-auto]="idx % 2 !== 0" class="md:w-1/2">
              <div [class.md:pr-8]="idx % 2 === 0" [class.md:pl-8]="idx % 2 !== 0" class="md:pr-0">
                <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-8 w-6 h-6 bg-white dark:bg-dark-900 border-4 border-primary-500 rounded-full"></div>

                <div class="card p-6 hover:shadow-lg transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="text-lg font-semibold text-dark-900 dark:text-white">
                        {{ item.position }}
                      </h3>
                      <p class="text-primary-600 dark:text-primary-400 font-medium">{{ item.company }}</p>
                    </div>
                    <span class="text-xs font-semibold px-3 py-1 bg-primary-100 dark:bg-dark-700 text-primary-700 dark:text-primary-300 rounded-full"
                      >{{ item.duration }}</span
                    >
                  </div>

                  <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
            }
          </div>
          } @else {
          <div class="card p-8 text-center text-gray-600 dark:text-gray-400">
            Experience entries from your API will show up here once they are added.
          </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  private portfolioService = inject(PortfolioService);

  experience = computed(() => this.portfolioService.getExperience());
}
