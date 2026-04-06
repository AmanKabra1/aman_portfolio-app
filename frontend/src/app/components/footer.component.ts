import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="bg-dark-900 dark:bg-black text-white py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="text-center md:text-left">
            <p class="text-gray-400">
              &copy; {{ currentYear() }} {{ displayName() }}. All rights reserved.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-6 text-center md:text-right text-sm text-gray-400">
            <a routerLink="/resume" class="hover:text-primary-400 transition-colors">Download Resume</a>
            <a routerLink="/admin/login" class="hover:text-primary-400 transition-colors">Admin Login</a>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-dark-700 text-center text-gray-500 text-sm">
          <p>
            Built with
            <span class="text-red-500">❤️</span>
            using Angular & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private authService = inject(AuthService);

  displayName = computed(() => this.authService.admin()?.name?.trim() || 'Portfolio Owner');
  currentYear = computed(() => new Date().getFullYear());
}
