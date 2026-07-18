"use client";

import { useState, useMemo } from "react";
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  BookOpen,
  Clock,
  CheckCircle,
  Star,
  ChevronDown
} from "lucide-react";

import type { ReadingStatus, SortField, SortOrder } from "@/types";

interface ListFiltersProps {
  filterStatus: ReadingStatus | null;
  filterMinRating: number | null;
  sortBy: SortField;
  sortOrder: SortOrder;
  onFilterStatusChange: (status: ReadingStatus | null) => void;
  onFilterMinRatingChange: (rating: number | null) => void;
  onSortByChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  totalBooks: number;
  filteredCount: number;
}

const STATUS_OPTIONS: { value: ReadingStatus | null; label: string; icon: typeof BookOpen; color: string }[] = [
  { value: null, label: "All", icon: Filter, color: "text-muted-foreground" },
  { value: "WANT_TO_READ", label: "Want to Read", icon: Clock, color: "text-secondary-foreground" },
  { value: "READING", label: "Reading", icon: BookOpen, color: "text-primary" },
  { value: "DONE", label: "Done", icon: CheckCircle, color: "text-tertiary" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "addedAt", label: "Date Added" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "rating", label: "Rating" },
  { value: "progress", label: "Progress" },
];

const RATING_OPTIONS = [
  { value: null, label: "Any" },
  { value: 1, label: "≥ 1★" },
  { value: 2, label: "≥ 2★" },
  { value: 3, label: "≥ 3★" },
  { value: 4, label: "≥ 4★" },
  { value: 5, label: "5★" },
];

export function ListFilters({
  filterStatus,
  filterMinRating,
  sortBy,
  sortOrder,
  onFilterStatusChange,
  onFilterMinRatingChange,
  onSortByChange,
  onSortOrderChange,
  totalBooks,
  filteredCount,
}: ListFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasActiveFilters = useMemo(
    () => filterStatus !== null || filterMinRating !== null,
    [filterStatus, filterMinRating]
  );
  
  const isFiltered = useMemo(
    () => filteredCount !== totalBooks,
    [filteredCount, totalBooks]
  );
  
  const activeFilterCount = useMemo(
    () => (filterStatus ? 1 : 0) + (filterMinRating ? 1 : 0),
    [filterStatus, filterMinRating]
  );

  const clearFilters = () => {
    onFilterStatusChange(null);
    onFilterMinRatingChange(null);
  };

  return (
    <div className="p-3 sm:p-4 bg-muted/50 border-b border-border">
      {/* Mobile: Collapsed summary bar */}
      <div className="flex sm:hidden items-center justify-between">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <span className="text-xs text-muted-foreground">
              {filteredCount}/{totalBooks}
            </span>
          )}
          <button
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Full filters - always on desktop, collapsible on mobile */}
      <div className={`${isExpanded ? "block mt-3" : "hidden"} sm:block`}>
        <div className="flex flex-col gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1 flex-shrink-0">Status:</span>
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = filterStatus === option.value;
            return (
              <button
                key={option.value ?? "all"}
                onClick={() => onFilterStatusChange(option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/20 text-primary ring-1 ring-primary/50"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? option.color : ""}`} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Rating Filter & Sort Controls */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterMinRating ?? ""}
              onChange={(e) => onFilterMinRatingChange(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 text-sm bg-muted text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-h-[44px]"
            >
              {RATING_OPTIONS.map((option) => (
                <option key={option.value ?? "any"} value={option.value ?? ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortField)}
              className="px-3 py-2 text-sm bg-muted text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-h-[44px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Clear Filters & Count */}
          <div className="flex items-center gap-2 ml-auto">
            {isFiltered && (
              <span className="text-xs text-muted-foreground">
                {filteredCount} of {totalBooks} books
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
