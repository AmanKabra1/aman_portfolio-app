import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');
const outputPath = path.join(projectRoot, 'src', 'app', 'config', 'email.config.ts');

const defaults = {
  EMAILJS_SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
  EMAILJS_TEMPLATE_ID: 'YOUR_EMAILJS_TEMPLATE_ID',
  EMAILJS_PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
};

function parseEnvFile(contents) {
  const values = { ...defaults };

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key in values) {
      values[key] = value;
    }
  }

  return values;
}

const envValues = fs.existsSync(envPath)
  ? parseEnvFile(fs.readFileSync(envPath, 'utf8'))
  : defaults;

const fileContents = `export const EMAILJS_CONFIG = {
  serviceId: '${envValues.EMAILJS_SERVICE_ID}',
  templateId: '${envValues.EMAILJS_TEMPLATE_ID}',
  publicKey: '${envValues.EMAILJS_PUBLIC_KEY}',
} as const;

// These keys belong to the app's EmailJS account and are shared by the frontend.
// The receiver is still chosen per portfolio from the loaded contact email.
export function isEmailJsConfigured(): boolean {
  return !Object.values(EMAILJS_CONFIG).some((value) => value.startsWith('YOUR_EMAILJS_'));
}
`;

fs.writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Synced EmailJS env to ${path.relative(projectRoot, outputPath)}`);
