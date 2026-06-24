"use client";

import { forwardRef } from "react";
import { Search, Library, X } from "lucide-react";

interface ListsSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchScope: string;
  onSearchScopeChange: (scope: string) => void;
  lists: Array<{ id: string; name: string }>;
}

export const ListsSearchBar = forwardRef<HTMLInputElement, ListsSearchBarProps>(
  ({ searchQuery, onSearchQueryChange, searchScope, onSearchScopeChange, lists }, ref) => {
    return (
      <div className="glass-card rounded-2xl p-3 sm:p-4">
        <div className="flex flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
            <input
              ref={ref}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search your library... (Ctrl+K)"
              className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base bg-stone-800/50 text-white placeholder-stone-500 rounded-xl border border-stone-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Library className="w-4 h-4 text-stone-500 hidden sm:block" />
            <select
              value={searchScope}
              onChange={(e) => onSearchScopeChange(e.target.value)}
              className="px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm bg-stone-800/50 text-stone-300 rounded-xl border border-stone-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
    );
  }
);

ListsSearchBar.displayName = "ListsSearchBar";
