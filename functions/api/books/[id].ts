import { getDatabase, type Env } from '../../../lib/db';
import { requireAuth, errorResponse, jsonResponse, handleOptions } from '../../../lib/middleware';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const bookId = parseInt(params.id as string);
  if (isNaN(bookId)) {
    return errorResponse('Invalid book ID', 400);
  }

  try {
    const authResult = await requireAuth(request, env);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const db = getDatabase(env);

    // Verify book exists and user owns it
    const hasOwnership = await db.verifyBookOwnership(bookId, authResult.user.userId);
    if (!hasOwnership) {
      return errorResponse('Book not found or unauthorized', 404);
    }

    // PUT: Update book
    if (request.method === 'PUT') {
      const body = await request.json() as {
        title?: string;
        author?: string;
        status?: 'want' | 'reading' | 'done';
        notes?: string;
        goodreads_id?: string;
        cover_url?: string;
      };

      // Validate status enum if provided
      if (body.status && !['want', 'reading', 'done'].includes(body.status)) {
        return errorResponse('Invalid status. Must be: want, reading, or done', 400);
      }

      const updatedBook = await db.updateBook(bookId, body);
      return jsonResponse(updatedBook);
    }

    // DELETE: Delete book
    if (request.method === 'DELETE') {
      await db.deleteBook(bookId);
      return new Response(null, { status: 204 });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Book API error:', error);
    return errorResponse('Internal server error', 500);
  }
};
