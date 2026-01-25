"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Book, User, Calendar, Tag, ExternalLink, Loader2, BookOpen, Star } from "lucide-react";
import Image from "next/image";

interface BookDetails {
  key: string;
  title: string;
  authors?: string[];
  description?: string;
  subjects?: string[];
  publishDate?: string;
  publishers?: string[];
  numberOfPages?: number;
  isbn?: string;
  coverUrl?: string;
  openLibraryUrl: string;
}

interface BookDetailsModalProps {
  bookKey: string | null;
  onClose: () => void;
  onAddToList?: (bookKey: string, title: string, author: string) => void;
}

export function BookDetailsModal({ bookKey, onClose, onAddToList }: BookDetailsModalProps) {
  const [details, setDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!bookKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/books/${encodeURIComponent(bookKey)}`);
      if (!response.ok) throw new Error("Failed to fetch book details");
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      console.error("Failed to fetch book details:", err);
      setError("Failed to load book details");
    } finally {
      setLoading(false);
    }
  }, [bookKey]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (bookKey) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [bookKey, onClose]);

  if (!bookKey) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAddToList = () => {
    if (details && onAddToList) {
      onAddToList(
        details.key,
        details.title,
        details.authors?.join(", ") || "Unknown Author"
      );
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden glass-card rounded-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchDetails}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {details && !loading && (
            <>
              {/* Header with cover */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/20 to-transparent" />
                <div className="relative p-6 flex gap-6">
                  {/* Cover */}
                  <div className="flex-shrink-0">
                    {details.coverUrl ? (
                      <Image
                        src={details.coverUrl}
                        alt={details.title}
                        width={150}
                        height={225}
                        className="rounded-lg shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-[150px] h-[225px] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Title & basic info */}
                  <div className="flex-1 min-w-0 pt-2">
                    <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                      {details.title}
                    </h2>
                    
                    {details.authors && details.authors.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-300 mb-3">
                        <User className="w-4 h-4" />
                        <span>{details.authors.join(", ")}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      {details.publishDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{details.publishDate}</span>
                        </div>
                      )}
                      {details.numberOfPages && (
                        <div className="flex items-center gap-1">
                          <Book className="w-4 h-4" />
                          <span>{details.numberOfPages} pages</span>
                        </div>
                      )}
                    </div>

                    {details.publishers && details.publishers.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Published by {details.publishers.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {details.description && (
                <div className="px-6 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {details.description}
                  </p>
                </div>
              )}

              {/* Subjects/Tags */}
              {details.subjects && details.subjects.length > 0 && (
                <div className="px-6 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    Subjects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.subjects.slice(0, 15).map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
                      >
                        {subject}
                      </span>
                    ))}
                    {details.subjects.length > 15 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-800/50 text-gray-500">
                        +{details.subjects.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ISBN */}
              {details.isbn && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-500">
                    ISBN: <span className="text-gray-400 font-mono">{details.isbn}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-wrap gap-3">
                {onAddToList && (
                  <button
                    onClick={handleAddToList}
                    className="flex-1 min-w-[200px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Add to List
                  </button>
                )}
                <a
                  href={details.openLibraryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Library
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
