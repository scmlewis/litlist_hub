import { getDatabase, type Env } from '../../../lib/db';
import { signToken, createSessionCookie, generateUserId } from '../../../lib/auth';
import { errorResponse, jsonResponse } from '../../../lib/middleware';

interface GitHubUser {
  id: number;
  email: string;
  login: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // Get authorization code from query params
  const code = url.searchParams.get('code');
  if (!code) {
    return errorResponse('No authorization code provided', 400);
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
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      return errorResponse('Failed to get access token', 400);
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
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
        },
      });
      const emails = await emailResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      return errorResponse('No email found for GitHub account', 400);
    }

    // Create or get user from database
    const db = getDatabase(env);
    const userId = generateUserId(githubUser.id);
    
    let user = await db.getUserById(userId);
    if (!user) {
      user = await db.createUser(userId, email, githubUser.id);
    }

    // Create JWT session token
    const token = await signToken(
      {
        userId: user.id,
        email: user.email,
        githubId: user.github_id,
      },
      env.JWT_SECRET
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
    return errorResponse('Authentication failed', 500);
  }
};
