"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { BookDetailsModal } from "@/components/BookDetailsModal";
import { HighlightMatch } from "@/components/HighlightMatch";
import { useToast } from "@/components/Toast";
import { ListsSearchBar } from "@/components/lists/ListsSearchBar";
import { ListAccordion } from "@/components/lists/ListAccordion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { BookOpen, BookMarked, Plus, Search, Info, Loader2 } from "lucide-react";
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
  const { showToast } = useToast();

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: "list" | "book"; listId?: string } | null>(null);

  // Edit state (global - only one list can be edited at a time)
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");
  const [originalListName, setOriginalListName] = useState("");

  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | null>(null);
  const [filterMinRating, setFilterMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("addedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"all" | string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

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

  const openCreateDialog = () => {
    setNewListName("");
    setShowCreateDialog(true);
  };

  const createList = async () => {
    const name = newListName.trim();
    if (!name) return;

    setLoading("create", true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setLists((prev) => [{ ...data.list, books: [], _count: { books: 0 } }, ...prev]);
        setExpandedList(data.list.id);
        showToast("success", `Created "${name}"`);
        setShowCreateDialog(false);
        setNewListName("");
      }
    } catch {
      showToast("error", "Failed to create list");
    } finally {
      setLoading("create", false);
    }
  };

  const openDeleteDialog = (listId: string, listName: string) => {
    setDeleteTarget({ id: listId, name: listName, type: "list" });
    setShowDeleteDialog(true);
  };

  const deleteList = async () => {
    if (!deleteTarget) return;
    const { id: listId, name: listName } = deleteTarget;

    const previousLists = lists;
    setLists((prev) => prev.filter((l) => l.id !== listId));
    showToast("success", `Deleted "${listName}"`);

    try {
      const response = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      if (!response.ok) {
        setLists(previousLists);
        showToast("error", "Failed to delete list");
      }
    } catch {
      setLists(previousLists);
      showToast("error", "Failed to delete list");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "list") {
      await deleteList();
    } else if (deleteTarget.type === "book" && deleteTarget.listId) {
      await removeBook(deleteTarget.listId, deleteTarget.id, deleteTarget.name);
    }

    setDeleteTarget(null);
    setShowDeleteDialog(false);
  };

  const togglePublic = async (listId: string, isPublic: boolean) => {
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

  const renameList = async (listId: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      showToast("error", "List name cannot be empty");
      return;
    }

    const previousLists = lists;
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, name: trimmedName } : l))
    );
    setEditingListId(null);
    setEditingListName("");
    setOriginalListName("");
    showToast("success", `Renamed to "${trimmedName}"`);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        setLists(previousLists);
        showToast("error", "Failed to rename list");
      }
    } catch {
      setLists(previousLists);
      showToast("error", "Failed to rename list");
    }
  };

  const startEditingList = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditingListName(currentName);
    setOriginalListName(currentName);
  };

  const cancelEditingList = () => {
    setEditingListId(null);
    setEditingListName("");
    setOriginalListName("");
  };

  const updateBookStatus = useCallback(async (listId: string, bookId: string, status: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, status: status as ReadingStatus } : lb
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

  const updateBookRating = useCallback(async (listId: string, bookId: string, rating: number | null) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              books: l.books.map((lb) =>
                lb.bookId === bookId ? { ...lb, rating } : lb
              ),
            }
          : l
      )
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: rating ?? 0 }),
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
        showToast("error", errorData.error || "Failed to update progress");
      } else {
        showToast("success", "Progress updated");
      }
    } catch {
      showToast("error", "Failed to update progress");
    }
  }, [showToast]);

  const updateBookNotes = useCallback(async (
    listId: string,
    bookId: string,
    notes: string | null,
    review: string | null
  ) => {
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

  const reorderBooks = async (listId: string, bookOrders: Array<{ id: string; order: number }>) => {
    const previousLists = lists;
    setLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          const reorderedBooks = [...l.books].sort((a, b) => {
            const aOrder = bookOrders.find((bo) => bo.id === a.id)?.order ?? 0;
            const bOrder = bookOrders.find((bo) => bo.id === b.id)?.order ?? 0;
            return aOrder - bOrder;
          });
          return { ...l, books: reorderedBooks };
        }
        return l;
      })
    );

    try {
      const response = await fetch(`/api/lists/${listId}/books/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookOrders }),
      });

      if (!response.ok) {
        setLists(previousLists);
        showToast("error", "Failed to reorder books");
      }
    } catch {
      setLists(previousLists);
      showToast("error", "Failed to reorder books");
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "k",
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          searchInputRef.current?.focus();
        },
      },
      {
        key: "Escape",
        handler: () => {
          if (searchQuery) {
            setSearchQuery("");
          }
        },
      },
      {
        key: "?",
        shift: true,
        handler: () => setShowShortcuts(true),
      },
    ],
    true
  );

  if (lists.length === 0) {
    return (
      <EmptyState
        icon={<BookMarked />}
        title="No lists yet"
        description="Create your first reading list to start tracking your books"
        action={
          <Button
            onClick={openCreateDialog}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation-2"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First List
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <ListsSearchBar
        ref={searchInputRef}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchScope={searchScope}
        onSearchScopeChange={setSearchScope}
        lists={lists}
      />

      {searchResults !== null ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-medium text-foreground text-sm sm:text-base">Search Results</span>
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {searchResults.length} book{searchResults.length !== 1 ? "s" : ""} found
                {searchScope !== "all" && ` in "${lists.find(l => l.id === searchScope)?.name}"`}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear search
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground">No books match &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {searchResults.map(({ listId, listName, listBook }) => (
                <div
                  key={`${listId}-${listBook.id}`}
                  className="p-4 hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-20 relative flex-shrink-0 rounded-lg overflow-hidden shadow-md hover:ring-2 hover:ring-primary transition-all"
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
                        <div className="w-full h-full flex items-center justify-center bg-primary/20">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                        onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                      >
                        <HighlightMatch text={listBook.book.title} query={searchQuery} />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <HighlightMatch
                          text={listBook.book.authors.join(", ") || "Unknown Author"}
                          query={searchQuery}
                        />
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                          {listName}
                        </span>
                        <StatusBadge status={listBook.status} />
                        {listBook.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-warning">
                            {"★".repeat(listBook.rating)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBookKey(listBook.book.openLibraryKey)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
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
        <>
          <button
            onClick={openCreateDialog}
            disabled={loadingStates["create"]}
            className="group w-full flex items-center justify-center gap-2 p-3 sm:p-5 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates["create"] ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            )}
            Create New List
          </button>

          {lists.map((list) => (
            <ListAccordion
              key={list.id}
              list={list}
              isExpanded={expandedList === list.id}
              onToggle={() => setExpandedList(expandedList === list.id ? null : list.id)}
              isEditing={editingListId === list.id}
              editValue={editingListId === list.id ? editingListName : list.name}
              onEditValueChange={setEditingListName}
              onStartRename={() => startEditingList(list.id, list.name)}
              onSaveRename={() => renameList(list.id, editingListName)}
              onCancelRename={cancelEditingList}
              filterStatus={filterStatus}
              filterMinRating={filterMinRating}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onFilterStatusChange={setFilterStatus}
              onFilterMinRatingChange={setFilterMinRating}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onTogglePublic={togglePublic}
              onCopyShareLink={copyShareLink}
              onDeleteList={openDeleteDialog}
              onUpdateStatus={(bookId, status) => updateBookStatus(list.id, bookId, status)}
              onUpdateRating={(bookId, rating) => updateBookRating(list.id, bookId, rating)}
              onUpdateProgress={(bookId, current, total) => 
                updateReadingProgress(list.id, bookId, current, total)
              }
              onUpdateNotes={(bookId, notes, review) =>
                updateBookNotes(list.id, bookId, notes, review)
              }
              onRemoveBook={(bookId, title) => removeBook(list.id, bookId, title)}
              onReorder={(bookOrders) => reorderBooks(list.id, bookOrders)}
              onOpenDetails={setSelectedBookKey}
            />
          ))}
        </>
      )}

      <ConfirmDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Create New List"
        description="Enter a name for your new reading list."
        confirmLabel="Create"
        onConfirm={createList}
      >
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="My Reading List"
          className="mt-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newListName.trim()) {
              createList();
            }
          }}
          autoFocus
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Delete ${deleteTarget?.type === "list" ? "List" : "Book"}?`}
        description={
          deleteTarget?.type === "list"
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : `Are you sure you want to remove "${deleteTarget?.name}" from this list?`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <KeyboardShortcutsModal
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />

      <BookDetailsModal
        bookKey={selectedBookKey}
        onClose={() => setSelectedBookKey(null)}
      />
    </div>
  );
}
