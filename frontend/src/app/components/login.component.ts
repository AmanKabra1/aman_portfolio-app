import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-dark-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-dark-900 dark:text-white mb-2">Welcome Back</h1>
          <p class="text-gray-600 dark:text-gray-400">Sign in to manage your portfolio</p>
        </div>

        <div class="card p-8">
          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Email</label>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                required
                class="w-full input-base"
                placeholder="you@example.com"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Use the email you registered with.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Password</label>
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                class="w-full input-base"
                placeholder="Enter your password"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters.</p>
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="btn-primary w-full py-3"
            >
              @if (isLoading()) {
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?
              <a routerLink="/register" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid rgba(255, 255, 255, 0.72);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.74));
      border-radius: 1.5rem;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
    }

    :host-context(.dark) .card {
      border-color: rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(15, 23, 42, 0.74));
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
    }

    .input-base {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgb(209 213 219);
      background: white;
      color: rgb(17 24 39);
      width: 100%;
    }

    :host-context(.dark) .input-base {
      border-color: rgb(55 65 81);
      background: rgb(31 41 55);
      color: white;
    }

    .input-base:focus {
      outline: 2px solid transparent;
      box-shadow: 0 0 0 2px rgb(249 115 22 / 0.35);
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, rgb(249 115 22), rgb(234 88 12));
      color: white;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 200ms;
      border: none;
      cursor: pointer;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = this.authService.error;
  isLoading = this.authService.isLoading;

  async onSubmit() {
    if (!this.email || !this.password) return;

    try {
      await this.authService.login(this.email, this.password);
      // Navigation happens in authService
    } catch (error: any) {
      // Error is handled by authService
    }
  }
}
