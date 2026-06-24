"use client";

import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
  Lock,
  Link2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { ListFilters } from "@/components/ListFilters";
import { BookList } from "@/components/lists/BookList";
import type { ReadingStatus, SortField, SortOrder } from "@/types";

interface Book {
  id: string;
  openLibraryKey: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishYear: number | null;
  pageCount: number | null;
}

interface ListBook {
  id: string;
  status: ReadingStatus;
  bookId: string;
  book: Book;
  rating: number | null;
  currentPage: number | null;
  totalPages: number | null;
  notes: string | null;
  review: string | null;
  order: number;
}

interface List {
  id: string;
  name: string;
  shareId: string;
  isPublic: boolean;
  books: ListBook[];
  _count: { books: number };
}

interface ListAccordionProps {
  list: List;
  isExpanded: boolean;
  onToggle: () => void;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  filterStatus: ReadingStatus | null;
  filterMinRating: number | null;
  sortBy: SortField;
  sortOrder: SortOrder;
  onFilterStatusChange: (status: ReadingStatus | null) => void;
  onFilterMinRatingChange: (rating: number | null) => void;
  onSortByChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onTogglePublic: (listId: string, isPublic: boolean) => void;
  onCopyShareLink: (shareId: string) => void;
  onDeleteList: (listId: string, name: string) => void;
  onUpdateStatus: (bookId: string, status: string) => Promise<void>;
  onUpdateRating: (bookId: string, rating: number | null) => Promise<void>;
  onUpdateProgress: (bookId: string, current: number, total: number) => Promise<void>;
  onUpdateNotes: (bookId: string, notes: string, review: string) => Promise<void>;
  onRemoveBook: (bookId: string, bookTitle: string) => Promise<void>;
  onReorder: (bookOrders: Array<{ id: string; order: number }>) => Promise<void>;
  onOpenDetails: (bookKey: string) => void;
}

export function ListAccordion({
  list,
  isExpanded,
  onToggle,
  isEditing,
  editValue,
  onEditValueChange,
  onStartRename,
  onSaveRename,
  onCancelRename,
  filterStatus,
  filterMinRating,
  sortBy,
  sortOrder,
  onFilterStatusChange,
  onFilterMinRatingChange,
  onSortByChange,
  onSortOrderChange,
  onTogglePublic,
  onCopyShareLink,
  onDeleteList,
  onUpdateStatus,
  onUpdateRating,
  onUpdateProgress,
  onUpdateNotes,
  onRemoveBook,
  onReorder,
  onOpenDetails,
}: ListAccordionProps) {

  const filteredBooks = list.books.filter((lb) => {
    if (filterStatus && lb.status !== filterStatus) return false;
    if (filterMinRating !== null && (lb.rating ?? 0) < filterMinRating) return false;
    return true;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "title":
        comparison = a.book.title.localeCompare(b.book.title);
        break;
      case "author":
        comparison = (a.book.authors[0] ?? "").localeCompare(b.book.authors[0] ?? "");
        break;
      case "rating":
        comparison = (a.rating ?? 0) - (b.rating ?? 0);
        break;
      case "progress": {
        const progressA = a.totalPages ? (a.currentPage ?? 0) / a.totalPages : 0;
        const progressB = b.totalPages ? (b.currentPage ?? 0) / b.totalPages : 0;
        comparison = progressA - progressB;
        break;
      }
      case "addedAt":
      default:
        comparison = 0;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSaveName = () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    onSaveRename();
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-elevation-1 overflow-hidden">
      <div
        className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 bg-primary rounded-xl">
            {isExpanded ? (
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            ) : (
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") onCancelRename();
                  }}
                  className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={onCancelRename}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  {list.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartRename();
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
                  title="Rename list"
                >
                  <Edit2 className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {list._count.books} book{list._count.books !== 1 && "s"}
              {list.isPublic && " • Public"}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground ml-1 sm:ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground ml-1 sm:ml-2" />
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onTogglePublic(list.id, list.isPublic)}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 ${
              list.isPublic
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {list.isPublic ? <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{list.isPublic ? "Public" : "Private"}</span>
          </button>
          {list.isPublic && (
            <button
              onClick={() => onCopyShareLink(list.shareId)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-accent text-accent-foreground rounded-full hover:bg-accent/80 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          )}
          <button
            onClick={() => onDeleteList(list.id, list.name)}
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border">
          {list.books.length > 0 && (
            <ListFilters
              filterStatus={filterStatus}
              filterMinRating={filterMinRating}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onFilterStatusChange={onFilterStatusChange}
              onFilterMinRatingChange={onFilterMinRatingChange}
              onSortByChange={onSortByChange}
              onSortOrderChange={onSortOrderChange}
              totalBooks={list.books.length}
              filteredCount={sortedBooks.length}
            />
          )}
          {list.books.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground mb-2">No books yet</p>
              <Link href="/search" className="text-primary hover:underline font-medium">
                Search for books to add →
              </Link>
            </div>
          ) : sortedBooks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground mb-2">No books match your filters</p>
              <button
                onClick={() => {
                  onFilterStatusChange(null);
                  onFilterMinRatingChange(null);
                }}
                className="text-primary hover:underline font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="p-4">
              <BookList
                listId={list.id}
                books={sortedBooks}
                onUpdateStatus={onUpdateStatus}
                onUpdateRating={onUpdateRating}
                onUpdateProgress={onUpdateProgress}
                onUpdateNotes={onUpdateNotes}
                onRemoveBook={onRemoveBook}
                onReorder={onReorder}
                onOpenDetails={onOpenDetails}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
