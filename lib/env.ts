// Helper to get Cloudflare environment bindings
// For D1 database, we need to use the async-local-storage based context

export interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_BASE_URL: string;
  DB: D1Database;
}

// Get D1 database binding using the runtime context
export function getDB(): D1Database {
  // Access the Cloudflare context that next-on-pages provides via process.env
  // @ts-expect-error - __cf_cxt is injected at runtime by next-on-pages
  const cfContext = globalThis.__cf_cxt;
  if (cfContext?.env?.DB) {
    return cfContext.env.DB;
  }
  
  // Fallback: try process.env which might have bindings in some setups
  // @ts-expect-error - DB might be on process.env in some configurations
  if (process.env.DB) {
    // @ts-expect-error
    return process.env.DB;
  }
  
  throw new Error('D1 database not available - make sure DB binding is configured in wrangler.toml');
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
