import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  cover: string | null;
}

interface BookSearchProps {
  onSelect: (book: { title: string; author: string; cover_url: string | null }) => void;
}

export default function BookSearch({ onSelect }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect({
      title: result.title,
      author: result.authors.join(', '),
      cover_url: result.cover,
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
            >
              {result.cover && (
                <img
                  src={result.cover}
                  alt={result.title}
                  className="h-20 w-14 object-cover rounded mr-3 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                <p className="text-sm text-gray-600 truncate">
                  {result.authors.join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query && results.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No books found
        </div>
      )}
    </div>
  );
}
