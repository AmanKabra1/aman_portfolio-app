import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="education" class="section-padding bg-gray-50 dark:bg-dark-900/50">
      <div class="max-w-4xl mx-auto">
        <h2 class="mb-4 text-center">Education</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-12"></div>

        @if (education().length) {
        <div class="space-y-6">
          @for (item of education(); track item.id) {
          <div class="card p-6">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-lg font-semibold text-dark-900 dark:text-white">
                  {{ item.degree }}
                </h3>
                <p class="text-primary-600 dark:text-primary-400 font-medium">{{ item.institution }}</p>
                @if (item.field) {
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.field }}</p>
                }
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold px-3 py-1 bg-primary-100 dark:bg-dark-700 text-primary-700 dark:text-primary-300 rounded-full">
                  {{ item.startDate | date:'MMM yyyy' }} - {{ item.isCurrent ? 'Present' : (item.endDate | date:'MMM yyyy') }}
                </span>
                @if (item.grade) {
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.grade }}</p>
                }
              </div>
            </div>
            @if (item.description) {
              <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {{ item.description }}
              </p>
            }
          </div>
          }
        </div>
        } @else {
        <div class="card p-8 text-center text-gray-600 dark:text-gray-400">
          Education entries will appear here once added.
        </div>
        }
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  private portfolioService = inject(PortfolioService);

  education = computed(() => this.portfolioService.getEducation());
}
