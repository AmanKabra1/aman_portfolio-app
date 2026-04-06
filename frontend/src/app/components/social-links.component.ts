import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';

type SocialItem = {
  key: string;
  label: string;
  href: string;
  accent: string;
  icon: string;
};

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (items().length) {
    <section class="bg-[#1f1f1f] border-y border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div class="flex flex-wrap gap-4 justify-center">
          @for (item of items(); track item.key) {
          <a
            [href]="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="social-card"
          >
            <span class="social-icon" [style.color]="item.accent">{{ item.icon }}</span>
            <span class="social-label">{{ item.label }}</span>
          </a>
          }
        </div>
      </div>
    </section>
    }
  `,
  styles: [
    `
      .social-card {
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        min-width: 180px;
        justify-content: center;
        padding: 1rem 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.02);
        color: rgba(255, 255, 255, 0.82);
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      .social-card:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.05);
      }

      .social-icon {
        font-size: 1.4rem;
        line-height: 1;
      }

      .social-label {
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialLinksComponent {
  private portfolioService = inject(PortfolioService);

  items = computed<SocialItem[]>(() => {
    const contact = this.portfolioService.contact();

    return [
      { key: 'github', label: 'GitHub', href: contact.github, accent: '#f8fafc', icon: '◉' },
      { key: 'linkedin', label: 'LinkedIn', href: contact.linkedin, accent: '#0a66c2', icon: '▣' },
      { key: 'medium', label: 'Medium', href: contact.medium, accent: '#f8fafc', icon: '◐' },
      { key: 'tableau', label: 'Tableau', href: contact.tableau, accent: '#f28c28', icon: '⋮' },
      { key: 'leetcode', label: 'LeetCode', href: contact.leetcode, accent: '#f59e0b', icon: '⌁' },
      { key: 'instagram', label: 'Instagram', href: contact.instagram, accent: '#ec4899', icon: '◎' },
      { key: 'email', label: 'Email', href: contact.email ? `mailto:${contact.email}` : '', accent: '#5eead4', icon: '✉' },
      { key: 'youtube', label: 'YouTube', href: contact.youtube, accent: '#ef4444', icon: '▶' },
    ].filter((item) => Boolean(item.href));
  });
}
