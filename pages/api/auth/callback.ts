import type { NextRequest } from 'next/server';
import { signToken, createSessionCookie, generateUserId } from '../../../lib/auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  runtime: 'edge',
};

interface GitHubUser {
  id: number;
  email: string;
  login: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface CloudflareEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  DB: D1Database;
}

export default async function handler(req: NextRequest) {
  const url = new URL(req.url);
  
  // Get authorization code from query params
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('No authorization code provided', { status: 400 });
  }

  // Get env from Cloudflare context
  const { env } = getRequestContext();
  const cfEnv = env as CloudflareEnv;

  const clientId = cfEnv.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const clientSecret = cfEnv.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;
  const jwtSecret = cfEnv.JWT_SECRET || process.env.JWT_SECRET;

  if (!clientId || !clientSecret || !jwtSecret) {
    return new Response('OAuth not configured: missing ' + 
      (!clientId ? 'GITHUB_CLIENT_ID ' : '') + 
      (!clientSecret ? 'GITHUB_CLIENT_SECRET ' : '') + 
      (!jwtSecret ? 'JWT_SECRET' : ''), { status: 500 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      return new Response('Failed to get access token', { status: 400 });
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
        'User-Agent': 'LitList-Hub',
      },
    });

    const githubUser = await userResponse.json() as GitHubUser;
    
    // Get user email if not in main response
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
          'User-Agent': 'LitList-Hub',
        },
      });
      const emails = await emailResponse.json() as GitHubEmail[];
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      return new Response('No email found for GitHub account', { status: 400 });
    }

    // Use the db from the env we already got
    const db = cfEnv.DB;
    
    const userId = generateUserId(githubUser.id);
    
    // Check if user exists
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!existingUser) {
      // Create new user
      await db.prepare(
        'INSERT INTO users (id, email, github_id, created_at) VALUES (?, ?, ?, ?)'
      ).bind(userId, email, githubUser.id, new Date().toISOString()).run();
    }

    // Create JWT session token
    const token = await signToken(
      {
        userId,
        email,
        githubId: githubUser.id,
      },
      jwtSecret
    );

    // Redirect to dashboard with session cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
        'Set-Cookie': createSessionCookie(token),
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Authentication failed: ' + (error as Error).message, { status: 500 });
  }
}
