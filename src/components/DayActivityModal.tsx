"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, BookOpen, Star, Calendar } from "lucide-react";

interface DayBook {
  id: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
}

interface DayActivityModalProps {
  date: string | null;
  books: DayBook[];
  onClose: () => void;
}

export function DayActivityModal({ date, books, onClose }: DayActivityModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (date) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [date, onClose]);

  if (!date) return null;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md overflow-hidden glass-card rounded-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/40 rounded-xl">
              <Calendar className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Books Finished</h3>
              <p className="text-sm text-gray-400">{formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book list */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {books.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No books finished on this day</p>
          ) : (
            <div className="space-y-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl"
                >
                  <div className="w-12 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <BookOpen className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{book.title}</h4>
                    {book.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < book.rating!
                                ? "text-amber-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--card-border)] bg-gray-800/30">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <span>
              {books.length} book{books.length !== 1 ? "s" : ""} completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
