import { deleteSessionCookie } from '../../../lib/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': deleteSessionCookie(),
    },
  });
}
