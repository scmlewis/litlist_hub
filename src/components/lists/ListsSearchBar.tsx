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
      <div className="bg-white border border-border rounded-xl p-3 sm:p-4 shadow-elevation-1">
        <div className="flex flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              ref={ref}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search your library... (Ctrl+K)"
              className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base bg-muted text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Library className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select
              value={searchScope}
              onChange={(e) => onSearchScopeChange(e.target.value)}
              className="px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm bg-muted text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
