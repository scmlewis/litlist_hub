"use client";

import { useState, useEffect, useRef } from "react";
import { BookSearch } from "@/components/BookSearch";
import { BookData } from "@/services/openLibrary";
import { useToast } from "@/components/Toast";
import { Plus, Loader2, Check, X } from "lucide-react";

interface List {
  id: string;
  name: string;
}

export function SearchPageClient() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [existingBookKeys, setExistingBookKeys] = useState<string[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState("");
  const newListInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists);
        if (data.lists.length > 0 && !selectedListId) {
          setSelectedListId(data.lists[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    }
  };

  const fetchListBooks = async (listId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        const keys = data.list.books.map((lb: { book: { openLibraryKey: string } }) => lb.book.openLibraryKey);
        setExistingBookKeys(keys);
      }
    } catch (error) {
      console.error("Failed to fetch list books:", error);
    }
  };

  const createNewList = async () => {
    const name = newListName.trim();
    if (!name) return;

    setIsCreatingList(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setLists((prev) => [data.list, ...prev]);
        setSelectedListId(data.list.id);
        showToast("success", `Created list "${name}"`);
        setShowNewListInput(false);
        setNewListName("");
      }
    } catch (error) {
      console.error("Failed to create list:", error);
      showToast("error", "Failed to create list");
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleAddBook = async (book: BookData) => {
    if (!selectedListId) {
      showToast("error", "Please select or create a list first");
      return;
    }

    // Optimistic update
    setExistingBookKeys((prev) => [...prev, book.openLibraryKey]);
    showToast("success", `Added "${book.title}" to list`);

    try {
      const response = await fetch(`/api/lists/${selectedListId}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        // Revert optimistic update
        setExistingBookKeys((prev) => prev.filter((k) => k !== book.openLibraryKey));
        if (response.status === 409) {
          showToast("error", "Book already in list");
        } else {
          showToast("error", "Failed to add book to list");
        }
      }
    } catch (error) {
      console.error("Failed to add book:", error);
      setExistingBookKeys((prev) => prev.filter((k) => k !== book.openLibraryKey));
      showToast("error", "Failed to add book to list");
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedListId) {
      fetchListBooks(selectedListId);
    }
  }, [selectedListId]);

  useEffect(() => {
    if (showNewListInput && newListInputRef.current) {
      newListInputRef.current.focus();
    }
  }, [showNewListInput]);

  return (
    <div className="space-y-6">
      {/* List selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-card border border-border rounded-xl shadow-elevation-1">
        <label className="text-sm font-semibold text-muted-foreground">
          Add to list:
        </label>
        <select
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:ring-2 focus:ring-ring focus:outline-none shadow-sm transition-all duration-200"
        >
          {lists.length === 0 && <option value="">No lists - create one!</option>}
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        {showNewListInput ? (
          <div className="flex items-center gap-2">
            <input
              ref={newListInputRef}
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createNewList();
                if (e.key === "Escape") {
                  setShowNewListInput(false);
                  setNewListName("");
                }
              }}
              placeholder="List name..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:ring-2 focus:ring-ring focus:outline-none shadow-sm transition-all duration-200"
            />
            <button
              onClick={createNewList}
              disabled={isCreatingList || !newListName.trim()}
              className="p-2.5 text-tertiary hover:bg-accent rounded-xl transition-colors disabled:opacity-50"
            >
              {isCreatingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setShowNewListInput(false); setNewListName(""); }}
              className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewListInput(true)}
            disabled={isCreatingList}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New List
          </button>
        )}
      </div>

      {/* Book search */}
      <BookSearch onAddBook={handleAddBook} existingBookKeys={existingBookKeys} />
    </div>
  );
}
