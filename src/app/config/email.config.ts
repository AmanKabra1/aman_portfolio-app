export const EMAILJS_CONFIG = {
  serviceId: 'service_dyv18sg',
  templateId: 'template_wxq8h8m',
  publicKey: 'yu-EtY_k2SAC-MIYc',
  recipientEmail: 'dev.nest.ms@gmail.com',
};

export function isEmailJsConfigured(): boolean {
  return !Object.values(EMAILJS_CONFIG).some((value) => value.startsWith('YOUR_EMAILJS_'));
}
