import type { NextRequest } from 'next/server';
import { getDB } from '../../../lib/env';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  // Get user_id from URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const userId = pathParts[pathParts.length - 1];

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB();

    // Check if user exists
    const user = await db.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's books
    const result = await db.prepare(
      'SELECT id, title, author, status, notes, cover_url, created_at FROM books WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return new Response(JSON.stringify({ books: result.results }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Public list API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch public list' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
