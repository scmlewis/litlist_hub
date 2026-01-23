// This file is kept for future GitHub OAuth integration
// Currently not used - simple email login is handled in /api/auth/login

export const runtime = 'edge';

export default async function handler() {
  return new Response('OAuth callback not configured', { status: 404 });
}
