import { getDatabase, type Env } from '../../../lib/db';
import { jsonResponse, errorResponse } from '../../../lib/middleware';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const userId = params.user_id as string;

  if (!userId) {
    return errorResponse('User ID is required', 400);
  }

  try {
    const db = getDatabase(env);
    
    // Get user info (without sensitive data)
    const user = await db.getUserById(userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get user's books
    const books = await db.getBooksByUserId(userId);

    // Return public-safe data
    return jsonResponse(
      {
        user: {
          id: user.id,
          // Don't expose email for privacy
        },
        books: books.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          status: book.status,
          notes: book.notes,
          cover_url: book.cover_url,
          created_at: book.created_at,
        })),
      },
      200,
      {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    );
  } catch (error) {
    console.error('Public list API error:', error);
    return errorResponse('Failed to fetch public list', 500);
  }
};
