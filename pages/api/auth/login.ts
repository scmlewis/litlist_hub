import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    let clientId: string | undefined;
    let debugInfo = '';
    
    try {
      const ctx = getRequestContext();
      clientId = ctx.env?.GITHUB_CLIENT_ID;
      debugInfo = `Context keys: ${Object.keys(ctx.env || {}).join(', ')}`;
    } catch (e) {
      debugInfo = `getRequestContext failed: ${String(e)}`;
      clientId = process.env.GITHUB_CLIENT_ID;
    }
    
    if (!clientId) {
      return new Response(`GitHub Client ID not configured. Debug: ${debugInfo}`, { status: 500 });
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
    return new Response('Login failed: ' + String(error), { status: 500 });
  }
}
