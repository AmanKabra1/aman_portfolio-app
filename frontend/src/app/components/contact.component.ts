import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMAILJS_CONFIG, isEmailJsConfigured } from '../config/email.config';
import { PortfolioService } from '../services/portfolio.service';

type ContactField = 'name' | 'email' | 'message';
type ContactFieldErrors = Partial<Record<ContactField, string>>;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="contact" class="section-padding bg-gray-50 dark:bg-dark-800">
      <div class="max-w-4xl mx-auto">
        <h2 class="mb-4 text-center">Get In Touch</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-orange-500 mx-auto mb-12"></div>

        <div class="grid md:grid-cols-2 gap-12">
          <div>
            <h3 class="mb-6 text-xl font-semibold">Let's Connect</h3>

            <div class="space-y-6">
              @if (contact().email) {
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📧</span>
                </div>
                <div>
                  <p class="font-semibold text-dark-900 dark:text-white mb-1">Email</p>
                  <a [href]="'mailto:' + contact().email" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {{ contact().email }}
                  </a>
                </div>
              </div>

              <a
                [href]="directEmailLink()"
                class="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
              >
                <span>Send email directly</span>
                <span>↗</span>
              </a>

              <p class="text-sm text-gray-500 dark:text-gray-400">
                Visitors can email you directly, and the form below can send messages straight to your inbox.
              </p>
              }

              @if (contact().phone) {
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📱</span>
                </div>
                <div>
                  <p class="font-semibold text-dark-900 dark:text-white mb-1">Phone</p>
                  <a [href]="'tel:' + contact().phone" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {{ contact().phone }}
                  </a>
                </div>
              </div>
              }

              @if (contact().location) {
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📍</span>
                </div>
                <div>
                  <p class="font-semibold text-dark-900 dark:text-white mb-1">Location</p>
                  <p class="text-gray-600 dark:text-gray-400">{{ contact().location }}</p>
                </div>
              </div>
              }
            </div>

            @if (
              !contact().email &&
              !contact().phone &&
              !contact().location &&
              !contact().github &&
              !contact().linkedin &&
              !contact().medium &&
              !contact().tableau &&
              !contact().leetcode &&
              !contact().instagram &&
              !contact().youtube &&
              !contact().portfolio
            ) {
            <div class="mt-8 card p-6 text-gray-600 dark:text-gray-400">
              Contact details from your admin panel will appear here automatically.
            </div>
            }
          </div>

          <div class="card p-8">
            <form (ngSubmit)="submitForm()" class="space-y-4" novalidate>
              @if (resolvedRecipientEmail()) {
              <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
                Messages from this form will be sent to {{ resolvedRecipientEmail() }}.
              </div>
              }

              <div>
                <label for="name" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  [(ngModel)]="formData.name"
                  (ngModelChange)="validateField('name')"
                  (blur)="validateField('name')"
                  name="name"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  [class.border-red-400]="fieldErrors().name"
                  [class.dark:border-red-500]="fieldErrors().name"
                  placeholder="Your name"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Required format: at least 2 letters, for example Aman Sharma.</p>
                @if (fieldErrors().name) {
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors().name }}</p>
                }
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="formData.email"
                  (ngModelChange)="validateField('email')"
                  (blur)="validateField('email')"
                  name="email"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  [class.border-red-400]="fieldErrors().email"
                  [class.dark:border-red-500]="fieldErrors().email"
                  placeholder="Your email"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Required format: name&#64;example.com.</p>
                @if (fieldErrors().email) {
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors().email }}</p>
                }
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Message</label>
                <textarea
                  id="message"
                  [(ngModel)]="formData.message"
                  (ngModelChange)="validateField('message')"
                  (blur)="validateField('message')"
                  name="message"
                  required
                  rows="5"
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                  [class.border-red-400]="fieldErrors().message"
                  [class.dark:border-red-500]="fieldErrors().message"
                  placeholder="Your message"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Required format: at least 10 characters with your question or request.</p>
                @if (fieldErrors().message) {
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors().message }}</p>
                }
              </div>

              <button type="submit" class="w-full btn-primary" [disabled]="!canSendMessage() || !isFormValid() || isSending()">
                <span>
                  {{
                    !canSendMessage()
                      ? 'Email Not Available'
                      : isSending()
                        ? 'Sending...'
                        : !isFormValid()
                          ? 'Fill Contact Form'
                        : 'Send Message'
                  }}
                </span>
                <span>✈️</span>
              </button>

              @if (submitted()) {
              <div class="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                Message sent successfully.
              </div>
              }

              @if (errorMessage()) {
              <div class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                {{ errorMessage() }}
              </div>
              }
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private portfolioService = inject(PortfolioService);

  formData = {
    name: '',
    email: '',
    message: '',
  };

  submitted = signal(false);
  isSending = signal(false);
  errorMessage = signal('');
  fieldErrors = signal<ContactFieldErrors>({});
  contact = this.portfolioService.contact;
  portfolio = this.portfolioService.getPortfolio;
  resolvedRecipientEmail = computed(() =>
    this.contact().email?.trim() ||
    this.portfolio()?.email?.trim() ||
    this.portfolio()?.user?.email?.trim() ||
    ''
  );
  canSendMessage = computed(() => Boolean(this.recipientEmail()) && isEmailJsConfigured());
  directEmailLink = computed(() =>
    this.recipientEmail()
      ? `mailto:${this.recipientEmail()}?subject=${encodeURIComponent('Portfolio enquiry')}`
      : '#contact'
  );

  async submitForm() {
    const recipientEmail = this.recipientEmail();
    const name = this.formData.name.trim();
    const fromEmail = this.formData.email.trim();
    const message = this.formData.message.trim();

    this.errorMessage.set('');

    if (!this.validateAllFields()) {
      this.errorMessage.set('Please fill all fields in the correct format.');
      return;
    }

    if (!recipientEmail) {
      this.errorMessage.set('Contact email is not available right now.');
      return;
    }

    if (!isEmailJsConfigured()) {
      this.errorMessage.set('Email sending is not configured yet. Add your EmailJS keys to continue.');
      return;
    }

    this.isSending.set(true);
    this.submitted.set(false);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_CONFIG.serviceId,
          template_id: EMAILJS_CONFIG.templateId,
          user_id: EMAILJS_CONFIG.publicKey,
          template_params: {
            to_email: recipientEmail,
            recipient_email: recipientEmail,
            owner_email: recipientEmail,
            user_email: recipientEmail,
            email_to: recipientEmail,
            toEmail: recipientEmail,
            to: recipientEmail,
            email: recipientEmail,
            recipient: recipientEmail,
            to_name: this.portfolioService.getPortfolio()?.title || 'Portfolio Owner',
            from_name: name,
            from_email: fromEmail,
            reply_to: fromEmail,
            subject: `Portfolio enquiry from ${name}`,
            message,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Unable to send message right now.');
      }

      this.submitted.set(true);
      this.formData = { name: '', email: '', message: '' };
    } catch (error) {
      console.error('Email send failed:', error);
      this.errorMessage.set('Message send nahi hua. Please try again in a moment.');
    } finally {
      this.isSending.set(false);
    }

    setTimeout(() => {
      this.submitted.set(false);
    }, 3000);
  }

  private recipientEmail() {
    return this.resolvedRecipientEmail();
  }

  isFormValid() {
    return (
      !this.getFieldError('name') &&
      !this.getFieldError('email') &&
      !this.getFieldError('message')
    );
  }

  validateField(field: ContactField) {
    const message = this.getFieldError(field);

    this.fieldErrors.update((errors) => {
      const next = { ...errors };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });

    this.errorMessage.set('');
  }

  private validateAllFields() {
    const errors: ContactFieldErrors = {};

    for (const field of ['name', 'email', 'message'] as ContactField[]) {
      const message = this.getFieldError(field);
      if (message) {
        errors[field] = message;
      }
    }

    this.fieldErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private getFieldError(field: ContactField) {
    const value = this.formData[field].trim();

    if (!value) {
      return `${this.fieldLabel(field)} is required.`;
    }

    if (field === 'name' && !/^[A-Za-z][A-Za-z .'-]{1,}$/.test(value)) {
      return 'Enter a valid name, for example Aman Sharma.';
    }

    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email, for example name@example.com.';
    }

    if (field === 'message' && value.length < 10) {
      return 'Message must be at least 10 characters.';
    }

    return '';
  }

  private fieldLabel(field: ContactField) {
    return field === 'email' ? 'Email' : field === 'name' ? 'Name' : 'Message';
  }
}
