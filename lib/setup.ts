import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Setup Cloudflare bindings in development
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}
