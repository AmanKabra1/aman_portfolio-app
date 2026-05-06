import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { ToastService } from './toast.service';

export interface User {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  role: string;
  portfolio?: {
    id: number;
    slug: string;
    isPublic: boolean;
    title?: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private tokenKey = 'portfolio_token';
  private userKey = 'portfolio_user';

  token = signal<string | null>(this.readToken());
  user = signal<User | null>(this.readUser());
  isLoading = signal(false);
  error = signal<string | null>(null);

  isAuthenticated = computed(() => Boolean(this.token()));
  isAdmin = computed(() => this.user()?.role === 'admin');
  isUser = computed(() => this.user()?.role === 'user');
  userPortfolio = computed(() => this.user()?.portfolio);

  constructor() {
    if (this.token()) {
      void this.loadMe();
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http
        .post<LoginResponse>(`${API_BASE_URL}/auth/login`, { email, password })
        .toPromise();

      if (!response?.success || !response.data?.token) {
        throw new Error(response?.message ?? 'Login failed');
      }

      this.token.set(response.data.token);
      this.user.set(response.data.user);

      localStorage.setItem(this.tokenKey, response.data.token);
      localStorage.setItem(this.userKey, JSON.stringify(response.data.user));

      this.dispatchLoginEvent();
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        await this.router.navigate(['/admin/dashboard']);
      } else {
        await this.router.navigate(['/dashboard']);
      }

      this.toastService.success('Signed in successfully.');
    } catch (error: any) {
      const message = error?.error?.message ?? error?.message ?? 'Login failed';
      this.error.set(message);
      this.toastService.error(message);
      throw new Error(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async register(data: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http
        .post<RegisterResponse>(`${API_BASE_URL}/auth/register`, data)
        .toPromise();

      if (!response?.success) {
        throw new Error(response?.message ?? 'Registration failed');
      }

      // Auto-login after registration
      await this.login(data.email, data.password);
    } catch (error: any) {
      const message = error?.error?.message ?? error?.message ?? 'Registration failed';
      this.error.set(message);
      this.toastService.error(message);
      throw new Error(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMe(): Promise<void> {
    const token = this.token();
    if (!token) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http
        .get<{ success: boolean; message?: string; data: User }>(`${API_BASE_URL}/auth/me`, {
          headers: this.authHeaders(),
        })
        .toPromise();

      if (!response?.success || !response.data) {
        throw new Error(response?.message ?? 'Failed to load user');
      }

      this.user.set(response.data);
      localStorage.setItem(this.userKey, JSON.stringify(response.data));
    } catch (error: any) {
      const message = error?.error?.message ?? error?.message ?? 'Failed to load user';
      this.error.set(message);

      if (error?.status === 401 || error?.status === 403) {
        this.logout();
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    this.clearAuthStorage();
    this.clearAccessibleCookies();
    this.clearCache();
    this.toastService.info('Logged out.');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  clearCache(): void {
    // Dispatch event for services to clear their state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  private dispatchLoginEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login'));
    }
  }

  authHeaders(): HttpHeaders {
    const token = this.token();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  private clearAuthStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    }
  }

  private clearAccessibleCookies(): void {
    if (typeof document === 'undefined') return;

    const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const sameSite = 'SameSite=Lax';

    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim();
      if (!name) continue;

      document.cookie = `${name}=; ${expires}; path=/; ${sameSite}`;
      document.cookie = `${name}=; ${expires}; path=/`;
    }
  }
}
