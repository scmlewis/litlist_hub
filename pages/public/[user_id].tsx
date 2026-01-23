import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Book } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

interface PublicListState {
  books: Book[];
  loading: boolean;
  error?: string;
}

const statusConfig = {
  want: { label: 'Want to Read', color: 'bg-blue-100 text-blue-800' },
  reading: { label: 'Reading', color: 'bg-yellow-100 text-yellow-800' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800' },
};

export default function PublicList() {
  const router = useRouter();
  const { user_id } = router.query;
  const [state, setState] = useState<PublicListState>({
    books: [],
    loading: true,
  });

  useEffect(() => {
    if (!user_id) return;

    const fetchBooks = async () => {
      try {
        const response = await fetch(`/api/public/${user_id}`);
        if (!response.ok) {
          setState({ books: [], loading: false, error: 'User not found' });
          return;
        }
        const data = await response.json() as { books: Book[] };
        setState({ books: data.books, loading: false });
      } catch {
        setState({ books: [], loading: false, error: 'Failed to load books' });
      }
    };

    fetchBooks();
  }, [user_id]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600">{state.error}</p>
        </div>
      </div>
    );
  }

  const { books } = state;

  return (
    <>
      <Head>
        <title>Book Collection - BookShelf Vibe</title>
        <meta name="description" content="Check out this book collection on BookShelf Vibe" />
        <meta property="og:title" content="Book Collection - BookShelf Vibe" />
        <meta property="og:description" content="Check out this book collection" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              BookShelf <span className="text-primary-600">Vibe</span>
            </h1>
            <p className="text-gray-600">
              {books.length} {books.length === 1 ? 'book' : 'books'} in this collection
            </p>
            <a
              href="/"
              className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your own collection →
            </a>
          </div>

          {/* Books Grid */}
          {books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600">This collection is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {books.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex">
                      {book.cover_url && (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="h-40 w-28 object-cover rounded mr-4 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className="text-sm text-gray-600 mb-3">
                            {book.author}
                          </p>
                        )}
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            statusConfig[book.status].color
                          }`}
                        >
                          {statusConfig[book.status].label}
                        </span>
                      </div>
                    </div>
                    {book.notes && (
                      <p className="text-sm text-gray-500 mt-4 line-clamp-3">
                        {book.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
