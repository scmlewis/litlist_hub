import { getUserFromRequest, type SessionPayload } from './auth';
import type { Env } from './db';

export interface AuthenticatedRequest extends Request {
  user?: SessionPayload;
}

// Middleware to require authentication
export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ authorized: true; user: SessionPayload } | { authorized: false; response: Response }> {
  const user = await getUserFromRequest(request, env.JWT_SECRET);

  if (!user) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { authorized: true, user };
}

// CORS headers helper
export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS preflight requests
export function handleOptions(request: Request): Response {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin || undefined),
  });
}

// JSON response helper
export function jsonResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Error response helper
export function errorResponse(
  message: string,
  status: number = 400,
  headers: Record<string, string> = {}
): Response {
  return jsonResponse({ error: message }, status, headers);
}
