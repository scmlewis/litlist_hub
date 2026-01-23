import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import BookList from '../components/BookList';
import BookModal from '../components/BookModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Book {
  id: number;
  user_id: string;
  title: string;
  author: string | null;
  status: 'want' | 'reading' | 'done';
  notes: string | null;
  goodreads_id: string | null;
  cover_url: string | null;
  created_at: string;
}

interface User {
  userId: string;
  email: string;
  githubId: number;
}

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json() as Book[];
      setBooks(data);
      
      // Extract user info from first book or make a separate call
      // For now, we'll get it from the session
      if (data.length > 0) {
        setUser({
          userId: data[0].user_id,
          email: 'user@example.com', // This should come from session
          githubId: 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'user_id' | 'created_at' | 'goodreads_id'>) => {
    try {
      if (editingBook) {
        // Update existing book
        const response = await fetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error('Failed to update book');
        const updatedBook = await response.json();
        setBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
      } else {
        // Create new book
        const response = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error('Failed to create book');
        const newBook = await response.json();
        setBooks([newBook, ...books]);
      }
      setIsModalOpen(false);
      setEditingBook(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete book');
      setBooks(books.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleShare = () => {
    if (!user) return;
    const shareUrl = `${window.location.origin}/public/${user.userId}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      userEmail={user?.email || 'user@example.com'}
      userId={user?.userId || ''}
      onShare={handleShare}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Books</h2>
            <p className="text-gray-600 mt-1">
              {books.length} {books.length === 1 ? 'book' : 'books'} in your library
            </p>
          </div>
          <button
            onClick={handleAddBook}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Book
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Book List */}
        <BookList
          books={books}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
        />

        {/* Book Modal */}
        <BookModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
          book={editingBook}
        />

        {/* Share Toast */}
        {showShareToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            ✓ Share link copied to clipboard!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
