// Helper to get Cloudflare environment bindings
export interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_BASE_URL: string;
  DB: D1Database;
}

export function getEnv(): CloudflareEnv {
  try {
    // Dynamic import to avoid issues during build
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    return ctx.env as CloudflareEnv;
  } catch (error) {
    // Return process.env fallback for local dev
    return {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
      DB: undefined as unknown as D1Database,
    };
  }
}
