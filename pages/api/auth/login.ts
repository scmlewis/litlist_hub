import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Use process.env - Cloudflare Pages injects secrets here
    const clientId = process.env.GITHUB_CLIENT_ID;
    
    if (!clientId) {
      return new Response('GitHub Client ID not configured. Please set GITHUB_CLIENT_ID in Cloudflare Pages environment variables.', { status: 500 });
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
