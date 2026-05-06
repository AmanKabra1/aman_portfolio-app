const LOCAL_API_ORIGIN = 'http://localhost:4000';
const PRODUCTION_API_ORIGIN = 'https://aman-portfolio-app.onrender.com';

const isLocalFrontend =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_ORIGIN = isLocalFrontend ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN;
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const HEALTH_URL = `${API_ORIGIN}/health`;
