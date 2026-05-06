import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export type ToastMessage = { type: ToastType; message: string };

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<ToastMessage | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  info(message: string) {
    this.show('info', message);
  }

  show(type: ToastType, message: string) {
    this.toast.set({ type, message });

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => this.toast.set(null), 4500);
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.toast.set(null);
  }
}
