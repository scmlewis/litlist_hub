"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { BookListItem } from "./BookListItem";
import { BulkActionsBar } from "./BulkActionsBar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Library, Search } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface ListBook {
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
  order: number;
}

interface BookListProps {
  listId: string;
  books: ListBook[];
  onUpdateStatus: (bookId: string, status: string) => Promise<void>;
  onUpdateRating: (bookId: string, rating: number | null) => Promise<void>;
  onUpdateProgress: (bookId: string, current: number, total: number) => Promise<void>;
  onUpdateNotes: (bookId: string, notes: string, review: string) => Promise<void>;
  onRemoveBook: (bookId: string, bookTitle: string) => Promise<void>;
  onReorder: (bookOrders: Array<{ id: string; order: number }>) => Promise<void>;
  onOpenDetails: (bookKey: string) => void;
  searchQuery?: string;
  error?: string;
  onRetry?: () => void;
}

export function BookList({
  listId,
  books,
  onUpdateStatus,
  onUpdateRating,
  onUpdateProgress,
  onUpdateNotes,
  onRemoveBook,
  onReorder,
  onOpenDetails,
  searchQuery = "",
  error,
  onRetry,
}: BookListProps) {
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = books.findIndex((b) => b.id === active.id);
    const newIndex = books.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally (parent will handle state)
    const reorderedBooks = [...books];
    const [movedBook] = reorderedBooks.splice(oldIndex, 1);
    reorderedBooks.splice(newIndex, 0, movedBook);

    // Generate new order values
    const bookOrders = reorderedBooks.map((book, index) => ({
      id: book.id,
      order: index,
    }));

    onReorder(bookOrders);
  };

  const handleSelect = (bookId: string, index: number, shiftKey: boolean) => {
    if (shiftKey && lastSelectedIndex !== -1) {
      // Range select
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelected = new Set(selectedBooks);
      for (let i = start; i <= end; i++) {
        newSelected.add(books[i].id);
      }
      setSelectedBooks(newSelected);
    } else {
      // Single toggle
      const newSelected = new Set(selectedBooks);
      if (newSelected.has(bookId)) {
        newSelected.delete(bookId);
      } else {
        newSelected.add(bookId);
      }
      setSelectedBooks(newSelected);
      setLastSelectedIndex(index);
    }
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map((b) => b.id)));
    }
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedBooks).map((bookId) => {
      const book = books.find((b) => b.id === bookId);
      return book ? onRemoveBook(book.bookId, book.book.title) : Promise.resolve();
    });
    await Promise.all(promises);
    setSelectedBooks(new Set());
  };

  const handleBulkStatus = async (status: string) => {
    const promises = Array.from(selectedBooks).map((bookId) => {
      const book = books.find((b) => b.id === bookId);
      return book ? onUpdateStatus(book.bookId, status) : Promise.resolve();
    });
    await Promise.all(promises);
    setSelectedBooks(new Set());
  };

  const handleBulkRating = async (rating: number) => {
    const promises = Array.from(selectedBooks).map((bookId) => {
      const book = books.find((b) => b.id === bookId);
      return book ? onUpdateRating(book.bookId, rating) : Promise.resolve();
    });
    await Promise.all(promises);
    setSelectedBooks(new Set());
  };

  // Keyboard navigation
  useKeyboardShortcuts(
    [
      {
        key: "j",
        handler: () => setFocusedIndex((prev) => Math.min(prev + 1, books.length - 1)),
      },
      {
        key: "k",
        handler: () => setFocusedIndex((prev) => Math.max(prev - 1, 0)),
      },
      {
        key: "a",
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          handleSelectAll();
        },
      },
      {
        key: "Escape",
        handler: () => {
          setSelectedBooks(new Set());
          setFocusedIndex(-1);
        },
      },
    ],
    books.length > 0
  );

  if (error) {
    return <ErrorState title="Failed to load books" description={error} onRetry={onRetry} />;
  }

  if (books.length === 0 && searchQuery) {
    return (
      <EmptyState
        icon={<Search />}
        title="No books found"
        description={`No books match "${searchQuery}"`}
        action={undefined}
      />
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={<Library />}
        title="No books in this list"
        description="Add your first book to start tracking your reading journey"
        action={undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selectedBooks.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedBooks.size}
            onDelete={handleBulkDelete}
            onSetStatus={handleBulkStatus}
            onSetRating={handleBulkRating}
            onCancel={() => setSelectedBooks(new Set())}
          />
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={books.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {books.map((book, index) => (
              <BookListItem
                key={book.id}
                listBook={book}
                listId={listId}
                selected={selectedBooks.has(book.id)}
                focused={focusedIndex === index}
                onSelect={(shiftKey: boolean) => handleSelect(book.id, index, shiftKey)}
                onUpdateStatus={(status: string) => onUpdateStatus(book.bookId, status)}
                onUpdateRating={(rating: number | null) => onUpdateRating(book.bookId, rating)}
                onUpdateProgress={onUpdateProgress}
                onUpdateNotes={(notes: string, review: string) => onUpdateNotes(book.bookId, notes, review)}
                onRemove={() => onRemoveBook(book.bookId, book.book.title)}
                onOpenDetails={() => onOpenDetails(book.book.openLibraryKey)}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        </SortableContext>

        <DragOverlay dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}>
          {activeId && (() => {
            const activeBook = books.find((b) => b.id === activeId);
            if (!activeBook) return null;
            
            return (
              <div className="glass-card rounded-xl p-4 shadow-2xl border-2 border-accent-500 cursor-grabbing transform scale-110 bg-[var(--card-bg)] animate-pulse">
                <div className="flex items-start gap-4">
                  {/* Book cover */}
                  <div className="flex-shrink-0 w-16 h-24 bg-primary-950 rounded-lg overflow-hidden">
                    {activeBook.book.coverUrl ? (
                      <Image
                        src={activeBook.book.coverUrl}
                        alt={activeBook.book.title}
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
                    <h4 className="font-semibold text-primary-100 mb-1 truncate">
                      {activeBook.book.title}
                    </h4>
                    <p className="text-sm text-primary-400 mb-2 truncate">
                      {activeBook.book.authors.join(", ") || "Unknown Author"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeBook.status === "DONE" 
                          ? "bg-emerald-500/20 text-emerald-400"
                          : activeBook.status === "READING"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {activeBook.status === "DONE" ? "Done" : activeBook.status === "READING" ? "Reading" : "Want to Read"}
                      </span>
                      {activeBook.rating && (
                        <span className="text-amber-400 text-xs">
                          {"★".repeat(activeBook.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
