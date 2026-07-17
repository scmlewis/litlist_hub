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
    <div className="group flex gap-4 p-4 bg-card border-border rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200">
      <div className="flex-shrink-0 w-20 h-28 relative rounded-lg overflow-hidden shadow-sm">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-semibold text-foreground text-base line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1" title={book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}>
          {book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}
        </p>
        {book.publishYear && (
          <p className="text-xs text-muted-foreground mt-1">
            Published {book.publishYear}
          </p>
        )}

        {showActions && (
          <div className="mt-auto pt-2 flex items-center gap-2">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
            
            {!isInList && onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full shadow-elevation-1 hover:shadow-elevation-2 hover:brightness-110 active:scale-[0.98] active:shadow-elevation-1 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add to List
              </button>
            )}

            {isInList && !status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-tertiary">
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
