import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Apply saved theme or detect system preference
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      let isDark = false;

      if (saved) {
        isDark = saved === 'dark';
      } else {
        // Check system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
