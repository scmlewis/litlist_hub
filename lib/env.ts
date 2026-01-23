// Helper to get Cloudflare environment bindings

export interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_BASE_URL: string;
  DB: D1Database;
}

// Helper to get a single env var
export function getEnvVar(name: string): string | undefined {
  // Try process.env first (works on Cloudflare Pages with secrets)
  if (process.env[name]) {
    return process.env[name];
  }
  
  // Try Cloudflare context
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    return ctx?.env?.[name];
  } catch {
    return undefined;
  }
}

// Get D1 database binding
export function getDB(): D1Database | undefined {
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    return ctx?.env?.DB;
  } catch {
    return undefined;
  }
}

export function getEnv(): CloudflareEnv {
  return {
    GITHUB_CLIENT_ID: getEnvVar('GITHUB_CLIENT_ID') || '',
    GITHUB_CLIENT_SECRET: getEnvVar('GITHUB_CLIENT_SECRET') || '',
    JWT_SECRET: getEnvVar('JWT_SECRET') || '',
    NEXT_PUBLIC_BASE_URL: getEnvVar('NEXT_PUBLIC_BASE_URL') || '',
    DB: getDB() as D1Database,
  };
}
