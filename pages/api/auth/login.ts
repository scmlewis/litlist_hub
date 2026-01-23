import type { NextRequest } from 'next/server';
import { signToken, createSessionCookie } from '../../../lib/auth';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a simple user ID from email
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const userId = 'user_' + hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');

    // Create JWT session token
    const token = await signToken(
      {
        userId,
        email,
        githubId: 0, // No GitHub ID for simple login
      },
      jwtSecret
    );

    // Return success with session cookie
    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(token),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
