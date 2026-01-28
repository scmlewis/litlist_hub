"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { StarRating } from "@/components/StarRating";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BookNotes } from "@/components/BookNotes";
import { HighlightMatch } from "@/components/HighlightMatch";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Trash2, Info } from "lucide-react";
import { useState } from "react";

interface BookListItemProps {
  listBook: {
    id: string;
    status: string;
    bookId: string;
    book: {
      id: string;
      openLibraryKey: string;
      title: string;
      authors: string[];
      coverUrl: string | null;
      publishYear: number | null;
      pageCount: number | null;
    };
    rating: number | null;
    currentPage: number | null;
    totalPages: number | null;
    notes: string | null;
    review: string | null;
  };
  listId: string;
  selected: boolean;
  focused: boolean;
  onSelect: (shiftKey: boolean) => void;
  onUpdateStatus: (status: string) => Promise<void>;
  onUpdateRating: (rating: number | null) => Promise<void>;
  onUpdateProgress: (bookId: string, current: number, total: number) => Promise<void>;
  onUpdateNotes: (notes: string, review: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onOpenDetails: () => void;
  searchQuery?: string;
}

export function BookListItem({
  listBook,
  listId,
  selected,
  focused,
  onSelect,
  onUpdateStatus,
  onUpdateRating,
  onUpdateProgress,
  onUpdateNotes,
  onRemove,
  onOpenDetails,
  searchQuery = "",
}: BookListItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: listBook.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, textarea")) {
      return;
    }
    setExpanded(!expanded);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`glass-card rounded-xl p-4 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105" : ""
      } ${selected ? "ring-2 ring-accent-500" : ""} ${
        focused ? "ring-2 ring-primary-500" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-2 p-1 text-primary-600 hover:text-primary-400 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Select checkbox */}
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(false)}
          onClick={(e) => onSelect(e.shiftKey)}
          className="mt-2"
          aria-label={`Select ${listBook.book.title}`}
        />

        {/* Book cover */}
        <div
          className="flex-shrink-0 w-16 h-24 bg-primary-950 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleClick}
        >
          {listBook.book.coverUrl ? (
            <Image
              src={listBook.book.coverUrl}
              alt={listBook.book.title}
              width={64}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-700">
              <span className="text-2xl">📚</span>
            </div>
          )}
        </div>

        {/* Book info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
              <h4 className="font-semibold text-primary-100 mb-1 truncate">
                {searchQuery ? (
                  <HighlightMatch text={listBook.book.title} query={searchQuery} />
                ) : (
                  listBook.book.title
                )}
              </h4>
              <p className="text-sm text-primary-400 mb-2">
                {searchQuery ? (
                  <HighlightMatch
                    text={listBook.book.authors.join(", ") || "Unknown Author"}
                    query={searchQuery}
                  />
                ) : (
                  listBook.book.authors.join(", ") || "Unknown Author"
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenDetails}
                className="p-2 text-primary-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                aria-label="View details"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-2 text-primary-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label="Remove book"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status and Rating */}
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge
              status={listBook.status as any}
            />
            <StarRating
              rating={listBook.rating}
              size="sm"
            />
          </div>

          {/* Progress */}
          {listBook.totalPages && (
            <ReadingProgress
              currentPage={listBook.currentPage}
              totalPages={listBook.totalPages}
              onUpdate={(current: number, total: number) => onUpdateProgress(listBook.bookId, current, total)}
              editable
              compact
            />
          )}

          {/* Expandable notes */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <BookNotes
                bookId={listBook.bookId}
                listId={listId}
                initialNotes={listBook.notes || ""}
                initialReview={listBook.review || ""}
                onSave={(notes: string | null, review: string | null) => 
                  onUpdateNotes(notes || "", review || "")
                }
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
