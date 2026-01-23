import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

export const config = {
  runtime: 'edge',
};

interface BookInput {
  title: string;
  author?: string;
  status?: 'want' | 'reading' | 'done';
  notes?: string;
  goodreads_id?: string;
  cover_url?: string;
}

interface CloudflareEnv {
  JWT_SECRET: string;
  DB: D1Database;
}

export default async function handler(req: NextRequest) {
  // Get env from Cloudflare context
  const { env } = getRequestContext();
  const cfEnv = env as CloudflareEnv;
  
  const jwtSecret = cfEnv.JWT_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify authentication
  const token = getTokenFromRequest(req);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token, jwtSecret);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = cfEnv.DB;

    // GET: Fetch all books for authenticated user
    if (req.method === 'GET') {
      const result = await db.prepare(
        'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(user.userId).all();

      return new Response(JSON.stringify(result.results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: Create new book
    if (req.method === 'POST') {
      const body = await req.json() as BookInput;

      if (!body.title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (body.status && !['want', 'reading', 'done'].includes(body.status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await db.prepare(
        `INSERT INTO books (user_id, title, author, status, notes, goodreads_id, cover_url, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).bind(
        user.userId,
        body.title,
        body.author || null,
        body.status || 'want',
        body.notes || null,
        body.goodreads_id || null,
        body.cover_url || null,
        new Date().toISOString()
      ).first();

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Books API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
