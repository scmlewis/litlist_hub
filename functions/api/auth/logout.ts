import { deleteSessionCookie } from '../../../lib/auth';
import type { Env } from '../../../lib/db';

export const onRequest: PagesFunction<Env> = async (context) => {
  // Clear session cookie and redirect to home
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': deleteSessionCookie(),
    },
  });
};
