import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../config/api.config';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-dark-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-dark-900 dark:text-white mb-2">Create Your Portfolio</h1>
          <p class="text-gray-600 dark:text-gray-400">Join and start building your professional portfolio</p>
        </div>

        <div class="card p-8">
          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">First Name</label>
              <input
                [(ngModel)]="form.firstName"
                name="firstName"
                type="text"
                class="w-full input-base"
                placeholder="John"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Last Name</label>
              <input
                [(ngModel)]="form.lastName"
                name="lastName"
                type="text"
                class="w-full input-base"
                placeholder="Doe"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Username *</label>
              <input
                [(ngModel)]="form.username"
                name="username"
                type="text"
                required
                class="w-full input-base"
                [class.input-error]="usernameError()"
                placeholder="johndoe"
                (blur)="checkUsername()"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Use letters, numbers, and underscores only.</p>
              @if (usernameError()) {
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ usernameError() }}</p>
              }
              @if (usernameAvailable() === true) {
                <p class="mt-1 text-sm text-green-600 dark:text-green-400">Username available!</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Email *</label>
              <input
                [(ngModel)]="form.email"
                name="email"
                type="email"
                required
                class="w-full input-base"
                [class.input-error]="emailError()"
                placeholder="john@example.com"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">This becomes your account login email.</p>
              @if (emailError()) {
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ emailError() }}</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Password *</label>
              <input
                [(ngModel)]="form.password"
                name="password"
                type="password"
                required
                class="w-full input-base"
                [class.input-error]="passwordError()"
                placeholder="Create a strong password"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">At least 6 characters.</p>
              @if (passwordError()) {
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ passwordError() }}</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Confirm Password *</label>
              <input
                [(ngModel)]="form.confirmPassword"
                name="confirmPassword"
                type="password"
                required
                class="w-full input-base"
                [class.input-error]="confirmPasswordError()"
                placeholder="Repeat the same password"
              />
              @if (confirmPasswordError()) {
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ confirmPasswordError() }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="btn-primary w-full py-3"
            >
              @if (isLoading()) {
                Creating account...
              } @else {
                Create Portfolio
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <a routerLink="/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Sign in
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

    .input-error {
      border-color: rgb(248 113 113);
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  usernameError = signal<string | null>(null);
  usernameAvailable = signal<boolean | null>(null);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  confirmPasswordError = signal<string | null>(null);
  error = this.authService.error;
  isLoading = this.authService.isLoading;

  async checkUsername() {
    const username = this.form.username.trim().toLowerCase();

    if (username.length < 3) {
      this.usernameError.set('Username must be at least 3 characters');
      this.usernameAvailable.set(null);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      this.usernameError.set('Only letters, numbers, and underscores allowed');
      this.usernameAvailable.set(null);
      return;
    }

    // Check availability via API
    try {
      const response = await fetch(`${API_BASE_URL}/users/username/${username}/available`);
      const data = await response.json();
      if (data.success) {
        this.usernameAvailable.set(data.data.available);
        this.usernameError.set(data.data.available ? null : 'Username is taken');
      }
    } catch {
      this.usernameError.set(null);
    }
  }

  validate(): boolean {
    let valid = true;

    // Username
    if (!this.form.username.trim()) {
      this.usernameError.set('Username is required');
      valid = false;
    } else if (this.form.username.length < 3) {
      this.usernameError.set('Username must be at least 3 characters');
      valid = false;
    } else {
      this.usernameError.set(null);
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.form.email.trim()) {
      this.emailError.set('Email is required');
      valid = false;
    } else if (!emailRegex.test(this.form.email)) {
      this.emailError.set('Enter a valid email address');
      valid = false;
    } else {
      this.emailError.set(null);
    }

    // Password
    if (!this.form.password) {
      this.passwordError.set('Password is required');
      valid = false;
    } else if (this.form.password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      valid = false;
    } else {
      this.passwordError.set(null);
    }

    // Confirm Password
    if (this.form.password !== this.form.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
      valid = false;
    } else {
      this.confirmPasswordError.set(null);
    }

    return valid;
  }

  async onSubmit() {
    if (!this.validate()) return;

    try {
      await this.authService.register({
        email: this.form.email,
        password: this.form.password,
        username: this.form.username,
        firstName: this.form.firstName || undefined,
        lastName: this.form.lastName || undefined,
      });
      // Navigation happens in authService.login()
    } catch (error: any) {
      // Error is handled by authService
    }
  }
}
