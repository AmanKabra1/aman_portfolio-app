import { Component, signal, ChangeDetectionStrategy, effect, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-r from-primary-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">{{ displayInitial() }}</span>
          </div>
          <span class="font-bold text-lg text-dark-900 dark:text-white">{{ displayName() }}</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#about" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 transition-colors">About</a>
          <a href="#skills" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 transition-colors">Skills</a>
          <a href="#projects" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 transition-colors">Projects</a>
          <a href="#experience" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 transition-colors">Experience</a>
          <a href="#contact" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 transition-colors">Contact</a>
        </div>

        <!-- Theme Toggle & Mobile Menu -->
        <div class="flex items-center gap-4">
          <!-- Theme Toggle -->
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-dark-900 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
            [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            {{ isDark() ? '☀️' : '🌙' }}
          </button>

          <!-- Mobile Menu Toggle -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          >
            <span class="text-2xl">{{ isMobileMenuOpen() ? '✕' : '☰' }}</span>
          </button>
        </div>
      </nav>

      <!-- Mobile Navigation -->
      <div *ngIf="isMobileMenuOpen()" class="md:hidden border-t border-gray-200 dark:border-dark-700 py-4">
        <div class="flex flex-col gap-3 px-4">
          <a href="#about" (click)="toggleMobileMenu()" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 py-2">About</a>
          <a href="#skills" (click)="toggleMobileMenu()" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 py-2">Skills</a>
          <a href="#projects" (click)="toggleMobileMenu()" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 py-2">Projects</a>
          <a href="#experience" (click)="toggleMobileMenu()" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 py-2">Experience</a>
          <a href="#contact" (click)="toggleMobileMenu()" class="text-dark-700 dark:text-gray-300 hover:text-primary-500 py-2">Contact</a>
        </div>
      </div>
    </header>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);

  isMobileMenuOpen = signal(false);
  isDark = signal(this.initializeDarkMode());
  displayName = computed(() => this.authService.admin()?.name?.trim() || 'Portfolio');
  displayInitial = computed(() => this.displayName().charAt(0).toUpperCase() || 'P');

  constructor() {
    // Watch for theme changes and update global state
    effect(() => {
      const isDarkMode = this.isDark();
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  }

  private initializeDarkMode(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((v) => !v);
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
  }
}
