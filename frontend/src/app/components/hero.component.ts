import { Component, ChangeDetectionStrategy, computed, inject, OnDestroy, signal } from '@angular/core';
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
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="hero-section relative mt-8 md:mt-12 min-h-screen flex items-center section-padding pt-24 md:pt-28 overflow-hidden bg-neutral-950"
      >
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-overlay" aria-hidden="true"></div>

      <div class="relative max-w-7xl mx-auto w-full flex justify-end">
        <div class="w-full max-w-3xl text-right">
          <div class="inline-block mb-6 animate-fade-in">
            <span class="skill-badge !bg-white/10 !text-white !border-white/20 backdrop-blur-sm">{{ badgeText() }}</span>
          </div>

          <h1 class="mb-6 animate-slide-up text-white">
            {{ heading() }}
          </h1>

          <p class="text-lg md:text-xl text-gray-100 mb-6 max-w-2xl ml-auto leading-relaxed animate-slide-up">
            {{ summary() }}
          </p>

          <div class="mb-8 animate-slide-up">
            <p class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm md:text-base font-medium text-white/95 backdrop-blur-sm">
              <span class="text-primary-300">&lt;dev-mode/&gt;</span>
              <span>{{ typedText() }}</span>
              <span class="typing-caret" aria-hidden="true"></span>
            </p>
          </div>

          @if (socialItems().length) {
          <div class="mb-10 flex flex-wrap justify-end gap-3 animate-slide-up">
            @for (item of socialItems(); track item.key) {
            <a
              [href]="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="hero-social-chip"
            >
              <span class="hero-social-icon" [style.color]="item.accent">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
            }
          </div>
          }

          <div class="flex flex-col sm:flex-row gap-4 justify-end mb-16 animate-slide-up">
            <button type="button" (click)="scrollToSection('projects')" class="btn-primary">
              <span>{{ projectsCta() }}</span>
              <span>→</span>
            </button>
            <button type="button" (click)="scrollToSection('contact')" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/30 bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors duration-200 backdrop-blur-sm">
              <span>{{ contactCta() }}</span>
              <span>💬</span>
            </button>
          </div>

          <div class="mt-16 flex justify-end">
            <button
              (click)="scrollToSection('about')"
              class="p-3 rounded-full border-2 border-white/40 hover:border-primary-400 transition-colors animate-bounce"
              aria-label="Scroll down"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero-section {
        isolation: isolate;
        min-height: min(820px, 100vh);
      }

      .hero-bg {
        position: absolute;
        inset: 0;
        z-index: -2;
        background-image: var(--theme-hero-background, url('/assets/image.png'));
        background-position: center;
        background-size: cover;
        opacity: 0.58;
        transform: scale(1.02);
      }

      .hero-overlay {
        position: absolute;
        inset: 0;
        z-index: -1;
        background:
          linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.48) 45%, rgba(0, 0, 0, 0.76) 100%),
          radial-gradient(circle at 80% 22%, color-mix(in srgb, var(--theme-primary, #111111) 32%, transparent), transparent 34%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.55));
      }

      .typing-caret {
        width: 0.7ch;
        height: 1.1em;
        border-right: 2px solid rgba(255, 255, 255, 0.95);
        animation: blink-caret 0.9s step-end infinite;
      }

      .hero-social-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(15, 23, 42, 0.3);
        color: rgba(255, 255, 255, 0.92);
        font-size: 0.85rem;
        font-weight: 600;
        backdrop-filter: blur(8px);
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
      }

      .hero-social-chip:hover {
        transform: translateY(-1px);
        background: rgba(15, 23, 42, 0.42);
        border-color: rgba(255, 255, 255, 0.32);
      }

      .hero-social-icon {
        font-size: 1rem;
        line-height: 1;
      }

      @media (max-width: 767px) {
        .hero-bg {
          opacity: 0.48;
          background-position: 32% center;
        }

        .hero-overlay {
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.76)),
            radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--theme-primary, #111111) 24%, transparent), transparent 40%);
        }
      }

      @keyframes blink-caret {
        0%,
        49% {
          opacity: 1;
        }

        50%,
        100% {
          opacity: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnDestroy {
  private portfolioService = inject(PortfolioService);

  private phrases = [
    'Exploring LLMs & RAG pipelines 🤖',
    'Designing scalable frontend systems ✨',
    'Turning product ideas into polished UI 🚀',
    'Building APIs, dashboards, and smooth UX ⚡',
  ];

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  typedText = signal('');

  private topSkills = computed(() =>
    [...this.portfolioService.getSkills()].sort((a, b) => b.level - a.level).slice(0, 3)
  );

  socialItems = computed<SocialItem[]>(() => {
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

  badgeText = computed(() => {
    const [primarySkill] = this.topSkills();
    return primarySkill ? `${primarySkill.name} Specialist` : 'Portfolio';
  });

  heading = computed(() => {
    const skillNames = this.topSkills().map((skill) => skill.name);

    if (skillNames.length >= 2) {
      return `Building with ${skillNames.slice(0, 2).join(' and ')}`;
    }

    return this.portfolioService.about().bio || 'Building modern web experiences';
  });

  summary = computed(() => {
    const about = this.portfolioService.about();
    return about.description || about.bio || 'Portfolio content is loading from the API.';
  });

  projectsCta = computed(() =>
    this.portfolioService.getProjects().length ? 'View My Projects' : 'See Portfolio'
  );

  contactCta = computed(() =>
    this.portfolioService.contact().email ? 'Get in Touch' : 'View Contact'
  );

  constructor() {
    this.tick();
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private tick() {
    const currentPhrase = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      this.charIndex -= 1;
    } else {
      this.charIndex += 1;
    }

    this.typedText.set(currentPhrase.slice(0, this.charIndex));

    let nextDelay = this.isDeleting ? 45 : 85;

    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      nextDelay = 1400;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      nextDelay = 300;
    }

    this.timeoutId = setTimeout(() => this.tick(), nextDelay);
  }
}
