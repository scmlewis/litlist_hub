import { deleteSessionCookie } from '../../../lib/auth';

export const runtime = 'edge';

export default async function handler() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': deleteSessionCookie(),
    },
  });
}
