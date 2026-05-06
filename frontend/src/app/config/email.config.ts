export const EMAILJS_CONFIG = {
  serviceId: 'service_1rc2cct',
  templateId: 'template_jvof4wr',
  publicKey: 'sg6VqzWC5c2MyT3qu',
} as const;

// These keys belong to the app's EmailJS account and are shared by the frontend.
// The receiver is still chosen per portfolio from the loaded contact email.
export function isEmailJsConfigured(): boolean {
  return !Object.values(EMAILJS_CONFIG).some((value) => value.startsWith('YOUR_EMAILJS_'));
}
