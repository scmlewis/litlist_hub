"use client";

import { useState, useCallback } from "react";
import { BookData } from "@/services/openLibrary";
import { BookCard } from "./BookCard";
import { Search, AlertCircle, Loader2 } from "lucide-react";

interface BookSearchProps {
  onAddBook: (book: BookData) => Promise<void>;
  existingBookKeys?: string[];
}

export function BookSearch({ onAddBook, existingBookKeys = [] }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingBook, setAddingBook] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data.books);
    } catch (err) {
      setError("Failed to search books. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleAdd = async (book: BookData) => {
    setAddingBook(book.openLibraryKey);
    try {
      await onAddBook(book);
    } finally {
      setAddingBook(null);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books by title, author, or ISBN..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary focus:outline-none transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 sm:px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="sm:inline">Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-foreground">
              Search Results
            </h3>
            <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
              {results.length} found
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((book) => {
              const isInList = existingBookKeys.includes(book.openLibraryKey);
              return (
                <BookCard
                  key={book.openLibraryKey}
                  book={book}
                  showActions={!isInList}
                  isInList={isInList}
                  onAdd={
                    addingBook === book.openLibraryKey
                      ? undefined
                      : () => handleAdd(book)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
