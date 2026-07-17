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
import type { ReadingStatus } from "@/types";

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
      className={`bg-card border border-border rounded-xl p-4 shadow-elevation-1 transition-all duration-200 ${
        isDragging ? "opacity-30 scale-95 ring-2 ring-border ring-dashed" : ""
      } ${selected ? "ring-2 ring-primary" : ""} ${
        focused ? "ring-2 ring-ring" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="hidden sm:block mt-2 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(false)}
          onClick={(e) => onSelect(e.shiftKey)}
          className="mt-2 hidden sm:block"
          aria-label={`Select ${listBook.book.title}`}
        />

        <div
          className="flex-shrink-0 w-12 h-18 sm:w-16 sm:h-24 bg-muted rounded-lg overflow-hidden cursor-pointer"
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
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xl sm:text-2xl">📚</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
              <h4 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 truncate">
                {searchQuery ? (
                  <HighlightMatch text={listBook.book.title} query={searchQuery} />
                ) : (
                  listBook.book.title
                )}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
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

            <div className="flex items-center gap-0.5">
              <button
                onClick={onOpenDetails}
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="View details"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                aria-label="Remove book"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge
              status={listBook.status as ReadingStatus}
              editable
              onChange={(newStatus) => onUpdateStatus(newStatus)}
            />
            <StarRating
              rating={listBook.rating}
              size="sm"
              editable
              onChange={(rating) => onUpdateRating(rating || null)}
            />
          </div>

          {listBook.totalPages && (
            <div className="mt-2">
              <ReadingProgress
                currentPage={listBook.currentPage}
                totalPages={listBook.totalPages}
                onUpdate={(current: number, total: number) => onUpdateProgress(listBook.bookId, current, total)}
                editable
                compact
              />
            </div>
          )}

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
