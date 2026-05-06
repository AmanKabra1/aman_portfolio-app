import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast(); as toast) {
      <div
        class="toast-alert"
        [class.toast-alert--success]="toast.type === 'success'"
        [class.toast-alert--error]="toast.type === 'error'"
        [class.toast-alert--info]="toast.type === 'info'"
        role="status"
        aria-live="polite"
      >
        {{ toast.message }}
      </div>
    }
  `,
  styles: [`
    .toast-alert {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      max-width: min(24rem, calc(100vw - 2rem));
      border-radius: 0.75rem;
      padding: 0.85rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
      animation: toast-in 160ms ease-out;
    }

    .toast-alert--success {
      border: 1px solid rgb(187 247 208);
      background: rgb(240 253 244);
      color: rgb(21 128 61);
    }

    .toast-alert--error {
      border: 1px solid rgb(254 202 202);
      background: rgb(254 242 242);
      color: rgb(185 28 28);
    }

    .toast-alert--info {
      border: 1px solid rgb(191 219 254);
      background: rgb(239 246 255);
      color: rgb(29 78 216);
    }

    :host-context(.dark) .toast-alert--success {
      border-color: rgb(22 101 52);
      background: rgb(20 83 45);
      color: rgb(220 252 231);
    }

    :host-context(.dark) .toast-alert--error {
      border-color: rgb(153 27 27);
      background: rgb(127 29 29);
      color: rgb(254 226 226);
    }

    :host-context(.dark) .toast-alert--info {
      border-color: rgb(30 64 175);
      background: rgb(30 58 138);
      color: rgb(219 234 254);
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(-0.35rem);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
