import { errorResponse, jsonResponse } from '../../lib/middleware';

interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return errorResponse('Query parameter is required', 400);
  }

  try {
    // Call Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
    const response = await fetch(googleBooksUrl);

    if (!response.ok) {
      throw new Error('Google Books API request failed');
    }

    const data = await response.json() as { items?: GoogleBooksItem[] };

    // Transform results to simplified format
    const results = (data.items || []).map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      cover: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail || null,
    }));

    return jsonResponse(results);
  } catch (error) {
    console.error('Search API error:', error);
    return errorResponse('Failed to search books', 500);
  }
};
