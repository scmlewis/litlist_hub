import { getDatabase, type Env } from '../../../lib/db';
import { requireAuth, errorResponse, jsonResponse, handleOptions } from '../../../lib/middleware';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  try {
    // GET: Fetch all books for authenticated user
    if (request.method === 'GET') {
      const authResult = await requireAuth(request, env);
      if (!authResult.authorized) {
        return authResult.response;
      }

      const db = getDatabase(env);
      const books = await db.getBooksByUserId(authResult.user.userId);
      return jsonResponse(books);
    }

    // POST: Create new book
    if (request.method === 'POST') {
      const authResult = await requireAuth(request, env);
      if (!authResult.authorized) {
        return authResult.response;
      }

      const body = await request.json() as {
        title: string;
        author?: string;
        status?: 'want' | 'reading' | 'done';
        notes?: string;
        goodreads_id?: string;
        cover_url?: string;
      };

      // Validate required fields
      if (!body.title) {
        return errorResponse('Title is required', 400);
      }

      // Validate status enum
      if (body.status && !['want', 'reading', 'done'].includes(body.status)) {
        return errorResponse('Invalid status. Must be: want, reading, or done', 400);
      }

      const db = getDatabase(env);
      const book = await db.createBook(
        authResult.user.userId,
        body.title,
        body.author || null,
        body.status || 'want',
        body.notes || null,
        body.goodreads_id || null,
        body.cover_url || null
      );

      return jsonResponse(book, 201);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Books API error:', error);
    return errorResponse('Internal server error', 500);
  }
};
