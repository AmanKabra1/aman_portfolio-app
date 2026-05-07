export const EMAILJS_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
} as const;

// These keys belong to the app's EmailJS account and are shared by the frontend.
// The receiver is still chosen per portfolio from the loaded contact email.
export function isEmailJsConfigured(): boolean {
  return !Object.values(EMAILJS_CONFIG).some((value) => value.startsWith('YOUR_EMAILJS_'));
}
