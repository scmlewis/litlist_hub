import type { NextRequest } from 'next/server';
import { getEnv } from '../../../lib/env';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

export const config = {
  runtime: 'edge',
};

interface BookUpdate {
  title?: string;
  author?: string;
  status?: 'want' | 'reading' | 'done';
  notes?: string;
  goodreads_id?: string;
  cover_url?: string;
}

export default async function handler(req: NextRequest) {
  // Get env from Cloudflare context
  const env = getEnv();
  
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get book ID from URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const bookId = parseInt(pathParts[pathParts.length - 1]);
  
  if (isNaN(bookId)) {
    return new Response(JSON.stringify({ error: 'Invalid book ID' }), {
      status: 400,
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
    const db = env.DB;

    // Verify book ownership
    const book = await db.prepare(
      'SELECT * FROM books WHERE id = ? AND user_id = ?'
    ).bind(bookId, user.userId).first();

    if (!book) {
      return new Response(JSON.stringify({ error: 'Book not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT: Update book
    if (req.method === 'PUT') {
      const body = await req.json() as BookUpdate;

      if (body.status && !['want', 'reading', 'done'].includes(body.status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const updates: string[] = [];
      const values: (string | null)[] = [];

      if (body.title !== undefined) {
        updates.push('title = ?');
        values.push(body.title);
      }
      if (body.author !== undefined) {
        updates.push('author = ?');
        values.push(body.author || null);
      }
      if (body.status !== undefined) {
        updates.push('status = ?');
        values.push(body.status);
      }
      if (body.notes !== undefined) {
        updates.push('notes = ?');
        values.push(body.notes || null);
      }
      if (body.cover_url !== undefined) {
        updates.push('cover_url = ?');
        values.push(body.cover_url || null);
      }

      if (updates.length > 0) {
        values.push(bookId.toString());
        await db.prepare(
          `UPDATE books SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...values).run();
      }

      const updated = await db.prepare(
        'SELECT * FROM books WHERE id = ?'
      ).bind(bookId).first();

      return new Response(JSON.stringify(updated), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE: Delete book
    if (req.method === 'DELETE') {
      await db.prepare('DELETE FROM books WHERE id = ?').bind(bookId).run();
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Book API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
