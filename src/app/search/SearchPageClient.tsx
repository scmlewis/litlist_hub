"use client";

import { useState, useEffect } from "react";
import { BookSearch } from "@/components/BookSearch";
import { BookData } from "@/services/openLibrary";
import { useToast } from "@/components/Toast";
import { Plus, Loader2 } from "lucide-react";

interface List {
  id: string;
  name: string;
}

export function SearchPageClient() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [existingBookKeys, setExistingBookKeys] = useState<string[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
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
    const name = prompt("Enter list name:");
    if (!name?.trim()) return;

    setIsCreatingList(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setLists((prev) => [data.list, ...prev]);
        setSelectedListId(data.list.id);
        showToast("success", `Created list "${name}"`);
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

  return (
    <div className="space-y-6">
      {/* List selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 glass-card rounded-2xl">
        <label className="text-sm font-semibold text-stone-300">
          Add to list:
        </label>
        <select
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm transition-all duration-200"
        >
          {lists.length === 0 && <option value="">No lists - create one!</option>}
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <button
          onClick={createNewList}
          disabled={isCreatingList}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-stone-700 text-stone-200 rounded-xl hover:bg-stone-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingList ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New List
        </button>
      </div>

      {/* Book search */}
      <BookSearch onAddBook={handleAddBook} existingBookKeys={existingBookKeys} />
    </div>
  );
}
