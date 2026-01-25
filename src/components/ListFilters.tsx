"use client";

import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  BookOpen,
  Clock,
  CheckCircle,
  Star
} from "lucide-react";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";
type SortField = "addedAt" | "title" | "author" | "rating" | "progress";
type SortOrder = "asc" | "desc";

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
  { value: null, label: "All", icon: Filter, color: "text-gray-400" },
  { value: "WANT_TO_READ", label: "Want to Read", icon: Clock, color: "text-blue-400" },
  { value: "READING", label: "Reading", icon: BookOpen, color: "text-primary-400" },
  { value: "DONE", label: "Done", icon: CheckCircle, color: "text-accent-400" },
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
  const hasActiveFilters = filterStatus !== null || filterMinRating !== null;
  const isFiltered = filteredCount !== totalBooks;

  const clearFilters = () => {
    onFilterStatusChange(null);
    onFilterMinRatingChange(null);
  };

  return (
    <div className="p-4 bg-gray-800/30 border-b border-[var(--card-border)]">
      <div className="flex flex-col gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Status:</span>
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = filterStatus === option.value;
            return (
              <button
                key={option.value ?? "all"}
                onClick={() => onFilterStatusChange(option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/50"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? option.color : ""}`} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Rating Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <select
              value={filterMinRating ?? ""}
              onChange={(e) => onFilterMinRatingChange(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
            >
              {RATING_OPTIONS.map((option) => (
                <option key={option.value ?? "any"} value={option.value ?? ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-gray-600 mx-1" />

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortField)}
              className="px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
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
              <span className="text-xs text-gray-400">
                {filteredCount} of {totalBooks} books
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
