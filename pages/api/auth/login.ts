import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  runtime: 'edge',
};

interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_BASE_URL: string;
}

export default async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Get env from Cloudflare context
    const { env } = getRequestContext();
    const cfEnv = env as CloudflareEnv;
    
    const clientId = cfEnv.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response('GitHub Client ID not configured. Please set GITHUB_CLIENT_ID environment variable.', { status: 500 });
    }

    // Build GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
    githubAuthUrl.searchParams.set('scope', 'read:user user:email');
    githubAuthUrl.searchParams.set('state', crypto.randomUUID());

    // Redirect to GitHub OAuth
    return Response.redirect(githubAuthUrl.toString(), 302);
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Login failed: ' + (error as Error).message, { status: 500 });
  }
}
