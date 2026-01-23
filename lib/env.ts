// Helper to get Cloudflare environment bindings

export interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_BASE_URL: string;
  DB: D1Database;
}

// Get D1 database binding - must use getRequestContext for bindings
export function getDB(): D1Database {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getRequestContext } = require('@cloudflare/next-on-pages');
  return getRequestContext().env.DB;
}

export function getEnv(): CloudflareEnv {
  return {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
    DB: undefined as unknown as D1Database, // Use getDB() instead
  };
}
