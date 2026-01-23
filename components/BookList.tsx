interface Book {
  id: number;
  title: string;
  author: string | null;
  status: 'want' | 'reading' | 'done';
  notes: string | null;
  cover_url: string | null;
  created_at: string;
}

interface BookListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
}

const statusConfig = {
  want: { label: 'Want to Read', color: 'bg-blue-100 text-blue-800' },
  reading: { label: 'Reading', color: 'bg-yellow-100 text-yellow-800' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800' },
};

export default function BookList({ books, onEdit, onDelete }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No books yet</h3>
        <p className="text-gray-500">Start building your library by adding your first book!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {book.cover_url && (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-16 w-12 object-cover rounded mr-4"
                      />
                    )}
                    <div className="font-medium text-gray-900">{book.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {book.author || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[book.status].color}`}>
                    {statusConfig[book.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {book.notes || '—'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(book)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(book.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="h-24 w-16 object-cover rounded mr-4"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                {book.author && (
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                )}
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[book.status].color}`}>
                  {statusConfig[book.status].label}
                </span>
              </div>
            </div>
            {book.notes && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">{book.notes}</p>
            )}
            <div className="flex justify-end space-x-4 mt-3 pt-3 border-t">
              <button
                onClick={() => onEdit(book)}
                className="text-sm text-primary-600 hover:text-primary-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(book.id)}
                className="text-sm text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
