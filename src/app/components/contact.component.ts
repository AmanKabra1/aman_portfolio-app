import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMAILJS_CONFIG, isEmailJsConfigured } from '../config/email.config';
import { PortfolioService } from '../services/portfolio.service';

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
            <form (ngSubmit)="submitForm()" class="space-y-4">
              @if (contact().email) {
              <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
                Messages from this form will be sent to {{ contact().email }}.
              </div>
              }

              <div>
                <label for="name" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-dark-900 dark:text-white mb-2">Message</label>
                <textarea
                  id="message"
                  [(ngModel)]="formData.message"
                  name="message"
                  required
                  rows="5"
                  class="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                  placeholder="Your message"
                ></textarea>
              </div>

              <button type="submit" class="w-full btn-primary" [disabled]="!canSendMessage() || isSending()">
                <span>
                  {{
                    !canSendMessage()
                      ? 'Email Not Available'
                      : isSending()
                        ? 'Sending...'
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
  contact = this.portfolioService.contact;
  canSendMessage = computed(() => Boolean(this.contact().email) && isEmailJsConfigured());
  directEmailLink = computed(() =>
    this.contact().email
      ? `mailto:${this.contact().email}?subject=${encodeURIComponent('Portfolio enquiry')}`
      : '#contact'
  );

  async submitForm() {
    const email = this.contact().email;

    this.errorMessage.set('');

    if (!email) {
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
            to_email: EMAILJS_CONFIG.recipientEmail,
            to_name: 'Madhav',
            from_name: this.formData.name,
            from_email: this.formData.email,
            reply_to: this.formData.email,
            subject: `Portfolio enquiry from ${this.formData.name || 'Website visitor'}`,
            message: this.formData.message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to send message right now.');
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
}
