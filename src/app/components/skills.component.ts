import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';
import { Skill } from '../models/portfolio.model';

type SkillGroup = {
  key: Skill['category'];
  label: string;
  icon: string;
  skills: Skill[];
};

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="skills" class="section-padding">
      <div class="max-w-4xl mx-auto">
        <h2 class="mb-4 text-center">Skills & Expertise</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-12"></div>

        @if (skillGroups().length) {
        <div class="grid md:grid-cols-2 gap-12">
          @for (group of skillGroups(); track group.key) {
          <div class="card p-8">
            <h3 class="mb-6 flex items-center gap-3">
              <span class="text-2xl">{{ group.icon }}</span>
              {{ group.label }}
            </h3>

            @if (group.key === 'tools') {
            <div class="flex flex-wrap gap-3">
              @for (skill of group.skills; track skill.id) {
              <span class="skill-badge">{{ skill.name }}</span>
              }
            </div>
            } @else {
            <div class="space-y-4">
              @for (skill of group.skills; track skill.id) {
              <div>
                <div class="flex justify-between mb-2">
                  <span class="font-medium text-dark-900 dark:text-white">{{ skill.name }}</span>
                  <span class="text-sm text-primary-600 dark:text-primary-400">{{ skill.level }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2.5">
                  <div
                    class="bg-gradient-to-r from-primary-500 to-orange-500 h-2.5 rounded-full transition-all duration-1000"
                    [style.width.%]="skill.level"
                  ></div>
                </div>
              </div>
              }
            </div>
            }
          </div>
          }
        </div>
        } @else {
        <div class="card p-8 text-center text-gray-600 dark:text-gray-400">
          Skills added from your admin panel will appear here automatically.
        </div>
        }
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  private portfolioService = inject(PortfolioService);

  skillGroups = computed(() => {
    const metadata: Record<Skill['category'], { label: string; icon: string }> = {
      frontend: { label: 'Frontend Development', icon: '🎨' },
      backend: { label: 'Backend Development', icon: '⚙️' },
      database: { label: 'Databases', icon: '🗄️' },
      tools: { label: 'Tools & Platforms', icon: '🛠️' },
    };

    return (Object.keys(metadata) as Skill['category'][])
      .map((category) => ({
        key: category,
        label: metadata[category].label,
        icon: metadata[category].icon,
        skills: this.portfolioService.getSkillsByCategory(category),
      }))
      .filter((group) => group.skills.length);
  });
}
