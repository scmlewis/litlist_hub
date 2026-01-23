import { useState, useEffect } from 'react';
import BookSearch from './BookSearch';

interface Book {
  id?: number;
  title: string;
  author: string | null;
  status: 'want' | 'reading' | 'done';
  notes: string | null;
  cover_url: string | null;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Omit<Book, 'id'>) => Promise<void>;
  book?: Book | null;
}

export default function BookModal({ isOpen, onClose, onSave, book }: BookModalProps) {
  const [formData, setFormData] = useState<Omit<Book, 'id'>>({
    title: '',
    author: null,
    status: 'want',
    notes: null,
    cover_url: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        status: book.status,
        notes: book.notes,
        cover_url: book.cover_url,
      });
    } else {
      setFormData({
        title: '',
        author: null,
        status: 'want',
        notes: null,
        cover_url: null,
      });
    }
    setError(null);
  }, [book, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError('Failed to save book. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchSelect = (selectedBook: { title: string; author: string; cover_url: string | null }) => {
    setFormData({
      ...formData,
      title: selectedBook.title,
      author: selectedBook.author,
      cover_url: selectedBook.cover_url,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {book ? 'Edit Book' : 'Add Book'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Book Search */}
            {!book && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for a book
                </label>
                <BookSearch onSelect={handleSearchSelect} />
                <p className="mt-2 text-xs text-gray-500">
                  Or fill in the details manually below
                </p>
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Author */}
            <div className="mb-4">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                id="author"
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'want' | 'reading' | 'done' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="want">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Cover URL */}
            <div className="mb-4">
              <label htmlFor="cover_url" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <input
                id="cover_url"
                type="url"
                value={formData.cover_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {formData.cover_url && (
                <img
                  src={formData.cover_url}
                  alt="Cover preview"
                  className="mt-2 h-32 w-24 object-cover rounded"
                />
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
