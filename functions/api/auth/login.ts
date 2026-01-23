import type { Env } from '../../../lib/db';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // Build GitHub OAuth URL
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', crypto.randomUUID());

  // Redirect to GitHub OAuth
  return Response.redirect(githubAuthUrl.toString(), 302);
};
