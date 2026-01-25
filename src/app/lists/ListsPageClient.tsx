"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { StarRating } from "@/components/StarRating";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BookNotes } from "@/components/BookNotes";
import { BookDetailsModal } from "@/components/BookDetailsModal";
import { ListFilters } from "@/components/ListFilters";
import { HighlightMatch } from "@/components/HighlightMatch";
import { useToast } from "@/components/Toast";
import { 
  BookOpen, 
  BookMarked, 
  Plus, 
  Trash2, 
  Globe, 
  Lock, 
  Link2, 
  ChevronDown, 
  ChevronUp,
  X,
  Loader2,
  StickyNote,
  Info,
  Search,
  Library
} from "lucide-react";

type SortField = "addedAt" | "title" | "author" | "rating" | "progress";
type SortOrder = "asc" | "desc";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";

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
}

interface List {
  id: string;
  name: string;
  shareId: string;
  isPublic: boolean;
  books: ListBook[];
  _count: { books: number };
}

interface ListsPageClientProps {
  initialLists: List[];
}

export function ListsPageClient({ initialLists }: ListsPageClientProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [expandedList, setExpandedList] = useState<string | null>(
    initialLists.length > 0 ? initialLists[0].id : null
  );
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const { showToast } = useToast();

  // Filter & Sort State (resets on page load - Option A)
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | null>(null);
  const [filterMinRating, setFilterMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("addedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"all" | string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // Filter and sort books within a list
  const getFilteredBooks = useCallback((books: ListBook[]) => {
    let filtered = [...books];

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((lb) => lb.status === filterStatus);
    }

    // Apply rating filter
    if (filterMinRating !== null) {
      filtered = filtered.filter((lb) => (lb.rating ?? 0) >= filterMinRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
        case "progress":
          const progressA = a.totalPages ? (a.currentPage ?? 0) / a.totalPages : 0;
          const progressB = b.totalPages ? (b.currentPage ?? 0) / b.totalPages : 0;
          comparison = progressA - progressB;
          break;
        case "addedAt":
        default:
          comparison = 0; // Keep original order (most recent first)
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [filterStatus, filterMinRating, sortBy, sortOrder]);

  // Search results (flattened across lists)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { listId: string; listName: string; listBook: ListBook }[] = [];

    const listsToSearch = searchScope === "all" 
      ? lists 
      : lists.filter((l) => l.id === searchScope);

    listsToSearch.forEach((list) => {
      list.books.forEach((listBook) => {
        const titleMatch = listBook.book.title.toLowerCase().includes(query);
        const authorMatch = listBook.book.authors.some((a) => 
          a.toLowerCase().includes(query)
        );
        if (titleMatch || authorMatch) {
          results.push({ listId: list.id, listName: list.name, listBook });
        }
      });
    });

    return results;
  }, [searchQuery, searchScope, lists]);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  const createList = async () => {
    const name = prompt("Enter list name:");
    if (!name?.trim()) return;

    setLoading("create", true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setLists((prev) => [{ ...data.list, books: [], _count: { books: 0 } }, ...prev]);
        setExpandedList(data.list.id);
        showToast("success", `Created "${name}"`);
      }
    } catch {
      showToast("error", "Failed to create list");
    } finally {
      setLoading("create", false);
    }
  };

  const deleteList = async (listId: string, listName: string) => {
    if (!confirm(`Delete "${listName}"? This cannot be undone.`)) return;

    // Optimistic update
    const previousLists = lists;
    setLists((prev) => prev.filter((l) => l.id !== listId));
    showToast("success", `Deleted "${listName}"`);

    try {
      const response = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      if (!response.ok) {
        // Revert on error
        setLists(previousLists);
        showToast("error", "Failed to delete list");
      }
    } catch {
      setLists(previousLists);
      showToast("error", "Failed to delete list");
    }
  };

  const togglePublic = async (listId: string, isPublic: boolean) => {
    // Optimistic update
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, isPublic: !isPublic } : l))
    );
    showToast("success", !isPublic ? "List is now public" : "List is now private");

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        // Revert on error
        setLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, isPublic } : l))
        );
        showToast("error", "Failed to update list");
      }
    } catch {
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, isPublic } : l))
      );
      showToast("error", "Failed to update list");
    }
  };

  const updateBookStatus = useCallback(async (listId: string, bookId: string, status: ReadingStatus) => {
    // Optimistic update
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, status } : lb
              ),
            }
          : l
      )
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        showToast("error", "Failed to update status");
      }
    } catch {
      showToast("error", "Failed to update status");
    }
  }, [showToast]);

  const updateBookRating = useCallback(async (listId: string, bookId: string, rating: number) => {
    // Optimistic update
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, rating: rating === 0 ? null : rating } : lb
              ),
            }
          : l
      )
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        showToast("error", "Failed to update rating");
      }
    } catch {
      showToast("error", "Failed to update rating");
    }
  }, [showToast]);

  const updateReadingProgress = useCallback(async (
    listId: string,
    bookId: string,
    currentPage: number,
    totalPages: number
  ) => {
    // Optimistic update
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, currentPage, totalPages } : lb
              ),
            }
          : l
      )
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage, totalPages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Progress update failed:", errorData);
        showToast("error", errorData.error || "Failed to update progress");
      } else {
        showToast("success", "Progress updated");
      }
    } catch (error) {
      console.error("Progress update error:", error);
      showToast("error", "Failed to update progress");
    }
  }, [showToast]);

  const updateBookNotes = useCallback(async (
    listId: string,
    bookId: string,
    notes: string | null,
    review: string | null
  ) => {
    // Optimistic update
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, notes, review } : lb
              ),
            }
          : l
      )
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, review }),
      });

      if (!response.ok) {
        showToast("error", "Failed to save notes");
      } else {
        showToast("success", "Notes saved");
      }
    } catch {
      showToast("error", "Failed to save notes");
    }
  }, [showToast]);

  const removeBook = async (listId: string, bookId: string, bookTitle: string) => {
    // Optimistic update
    const previousLists = lists;
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.filter((lb) => lb.bookId !== bookId),
              _count: { books: l._count.books - 1 },
            }
          : l
      )
    );
    showToast("success", `Removed "${bookTitle}"`);

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setLists(previousLists);
        showToast("error", "Failed to remove book");
      }
    } catch {
      setLists(previousLists);
      showToast("error", "Failed to remove book");
    }
  };

  const copyShareLink = (shareId: string) => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    showToast("success", "Share link copied to clipboard!");
  };

  if (lists.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-3xl">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-xl opacity-30" />
          <div className="relative p-5 bg-gradient-to-br from-primary-900/50 to-primary-800/50 rounded-full">
            <BookMarked className="w-10 h-10 text-primary-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          No lists yet
        </h3>
        <p className="text-stone-400 mb-6 max-w-sm mx-auto">
          Create your first reading list to start tracking your books
        </p>
        <button
          onClick={createList}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Your First List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global Search Bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library... (Ctrl+K)"
              className="w-full pl-12 pr-10 py-3 bg-stone-800/50 text-white placeholder-stone-500 rounded-xl border border-stone-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-stone-500" />
            <select
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value)}
              className="px-3 py-3 text-sm bg-stone-800/50 text-stone-300 rounded-xl border border-stone-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
            >
              <option value="all">All Lists</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results View */}
      {searchResults !== null ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">Search Results</span>
              <span className="px-2 py-0.5 text-xs bg-primary-900/40 text-primary-300 rounded-full">
                {searchResults.length} book{searchResults.length !== 1 ? "s" : ""} found
                {searchScope !== "all" && ` in "${lists.find(l => l.id === searchScope)?.name}"`}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-stone-400 hover:text-stone-300 cursor-pointer"
            >
              Clear search
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-stone-400">No books match &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {searchResults.map(({ listId, listName, listBook }) => (
                <div
                  key={`${listId}-${listBook.id}`}
                  className="p-4 hover:bg-stone-800/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-20 relative flex-shrink-0 rounded-lg overflow-hidden shadow-md cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
                      onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                    >
                      {listBook.book.coverUrl ? (
                        <Image
                          src={listBook.book.coverUrl}
                          alt={listBook.book.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/50 to-primary-800/50">
                          <BookOpen className="w-6 h-6 text-primary-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold text-white cursor-pointer hover:text-primary-400 transition-colors"
                        onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                      >
                        <HighlightMatch text={listBook.book.title} query={searchQuery} />
                      </h4>
                      <p className="text-sm text-stone-400">
                        <HighlightMatch 
                          text={listBook.book.authors.join(", ") || "Unknown Author"} 
                          query={searchQuery} 
                        />
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs bg-stone-700 text-stone-300 rounded-full">
                          {listName}
                        </span>
                        <StatusBadge status={listBook.status} />
                        {listBook.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-400">
                            {"★".repeat(listBook.rating)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                      className="p-2 text-stone-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-xl transition-all duration-200 cursor-pointer"
                      title="View details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Normal List View */
        <>
          <button
            onClick={createList}
            disabled={loadingStates["create"]}
            className="group w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-stone-600 rounded-2xl text-stone-400 hover:border-primary-500 hover:text-primary-400 hover:bg-primary-900/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates["create"] ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            )}
            Create New List
          </button>

          {lists.map((list) => {
            const filteredBooks = getFilteredBooks(list.books);
            return (
              <div
                key={list.id}
                className="glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
              >
          {/* List header */}
          <div
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-800/50"
            onClick={() => setExpandedList(expandedList === list.id ? null : list.id)}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl blur-md opacity-30" />
                <div className="relative p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  {expandedList === list.id ? (
                    <BookOpen className="w-5 h-5 text-white" />
                  ) : (
                    <BookMarked className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {list.name}
                </h3>
                <p className="text-sm text-stone-400">
                  {list._count.books} book{list._count.books !== 1 && "s"}
                  {list.isPublic && " • Public"}
                </p>
              </div>
              {expandedList === list.id ? (
                <ChevronUp className="w-5 h-5 text-stone-400 ml-2" />
              ) : (
                <ChevronDown className="w-5 h-5 text-stone-400 ml-2" />
              )}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => togglePublic(list.id, list.isPublic)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  list.isPublic
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-stone-700 text-stone-400 hover:bg-stone-600"
                }`}
              >
                {list.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {list.isPublic ? "Public" : "Private"}
              </button>
              {list.isPublic && (
                <button
                  onClick={() => copyShareLink(list.shareId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-900/40 text-primary-300 rounded-xl hover:bg-primary-900/60 transition-all duration-200 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </button>
              )}
              <button
                onClick={() => deleteList(list.id, list.name)}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List books */}
          {expandedList === list.id && (
            <div className="border-t border-[var(--card-border)]">
              {/* Filters */}
              {list.books.length > 0 && (
                <ListFilters
                  filterStatus={filterStatus}
                  filterMinRating={filterMinRating}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onFilterStatusChange={setFilterStatus}
                  onFilterMinRatingChange={setFilterMinRating}
                  onSortByChange={setSortBy}
                  onSortOrderChange={setSortOrder}
                  totalBooks={list.books.length}
                  filteredCount={filteredBooks.length}
                />
              )}
              {list.books.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-stone-400 mb-2">No books yet</p>
                  <Link href="/search" className="text-primary-400 hover:underline font-medium">
                    Search for books to add →
                  </Link>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-stone-400 mb-2">No books match your filters</p>
                  <button
                    onClick={() => {
                      setFilterStatus(null);
                      setFilterMinRating(null);
                    }}
                    className="text-primary-400 hover:underline font-medium cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {filteredBooks.map((listBook) => (
                    <div
                      key={listBook.id}
                      className="p-4 hover:bg-stone-800/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-20 relative flex-shrink-0 rounded-lg overflow-hidden shadow-md cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
                          onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                        >
                          {listBook.book.coverUrl ? (
                            <Image
                              src={listBook.book.coverUrl}
                              alt={listBook.book.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/50 to-primary-800/50">
                              <BookOpen className="w-6 h-6 text-primary-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-semibold text-white truncate cursor-pointer hover:text-primary-400 transition-colors"
                            onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                          >
                            {listBook.book.title}
                          </h4>
                          <p className="text-sm text-stone-400 truncate">
                            {listBook.book.authors.join(", ") || "Unknown Author"}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <StarRating
                              rating={listBook.rating}
                              onChange={(rating) => updateBookRating(list.id, listBook.bookId, rating)}
                              editable
                              size="sm"
                            />
                            {listBook.status === "READING" && (
                              <ReadingProgress
                                currentPage={listBook.currentPage}
                                totalPages={listBook.totalPages}
                                onUpdate={(current, total) => 
                                  updateReadingProgress(list.id, listBook.bookId, current, total)
                                }
                                editable
                                compact
                              />
                            )}
                            <button
                              onClick={() => setExpandedNotes(
                                expandedNotes === listBook.id ? null : listBook.id
                              )}
                              className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                                listBook.notes || listBook.review
                                  ? "text-amber-400 hover:text-amber-300"
                                  : "text-stone-500 hover:text-stone-400"
                              }`}
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                              {listBook.notes || listBook.review ? "View notes" : "Add notes"}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                            className="p-2 text-stone-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-xl transition-all duration-200 cursor-pointer"
                            title="View details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <StatusBadge
                            status={listBook.status}
                            onChange={(status) => updateBookStatus(list.id, listBook.bookId, status)}
                            editable
                          />
                          <button
                            onClick={() => removeBook(list.id, listBook.bookId, listBook.book.title)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-900/30 rounded-xl transition-all duration-200 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Expandable notes section */}
                      {expandedNotes === listBook.id && (
                        <BookNotes
                          bookId={listBook.bookId}
                          listId={list.id}
                          initialNotes={listBook.notes}
                          initialReview={listBook.review}
                          onSave={(notes, review) => 
                            updateBookNotes(list.id, listBook.bookId, notes, review)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
            );
          })}
        </>
      )}

      {/* Book Details Modal */}
      <BookDetailsModal
        bookKey={selectedBookKey}
        onClose={() => setSelectedBookKey(null)}
      />
    </div>
  );
}
