"use client";

import Image from "next/image";
import { BookData } from "@/services/openLibrary";
import { StatusBadge } from "./StatusBadge";
import { Plus, X, BookOpen, Check } from "lucide-react";

import type { ReadingStatus } from "@/types";

interface BookCardProps {
  book: BookData & { id?: string };
  status?: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
  onAdd?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
  isInList?: boolean;
}

export function BookCard({
  book,
  status,
  onStatusChange,
  onAdd,
  onRemove,
  showActions = true,
  isInList = false,
}: BookCardProps) {
  return (
    <div className="group flex gap-4 p-5 glass-card rounded-2xl hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
      <div className="flex-shrink-0 w-24 h-32 relative rounded-xl overflow-hidden shadow-lg">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/50 to-primary-800/50">
            <BookOpen className="w-10 h-10 text-primary-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-bold text-white text-lg line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm text-stone-400 line-clamp-1" title={book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}>
          {book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}
        </p>
        {book.publishYear && (
          <p className="text-xs text-stone-500 mt-1">
            Published {book.publishYear}
          </p>
        )}

        {showActions && (
          <div className="mt-auto pt-3 flex items-center gap-3">
            {isInList && status && (
              <StatusBadge
                status={status}
                onChange={onStatusChange}
                editable={!!onStatusChange}
              />
            )}
            
            {isInList && onRemove && (
              <button
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 rounded-xl cursor-pointer transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
            
            {!isInList && onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to List
              </button>
            )}

            {isInList && !status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-400">
                <Check className="w-4 h-4" />
                In List
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
