"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Check, X } from "lucide-react";

interface ReadingProgressProps {
  currentPage: number | null;
  totalPages: number | null;
  onUpdate?: (currentPage: number, totalPages: number) => void;
  editable?: boolean;
  compact?: boolean;
}

export function ReadingProgress({
  currentPage,
  totalPages,
  onUpdate,
  editable = false,
  compact = false,
}: ReadingProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrentPage, setEditCurrentPage] = useState(currentPage ?? 0);
  const [editTotalPages, setEditTotalPages] = useState(totalPages ?? 0);
  const currentPageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && currentPageRef.current) {
      currentPageRef.current.focus();
      currentPageRef.current.select();
    }
  }, [isEditing]);

  const percentage =
    currentPage && totalPages && totalPages > 0
      ? Math.min(Math.round((currentPage / totalPages) * 100), 100)
      : 0;

  const handleSave = () => {
    if (onUpdate && editTotalPages > 0) {
      const validCurrentPage = Math.max(0, Math.min(editCurrentPage, editTotalPages));
      onUpdate(validCurrentPage, editTotalPages);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditCurrentPage(currentPage ?? 0);
    setEditTotalPages(totalPages ?? 0);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2">
        <BookOpen className="w-4 h-4 text-primary-400 flex-shrink-0" />
        <input
          ref={currentPageRef}
          type="number"
          min={0}
          max={editTotalPages || 9999}
          value={editCurrentPage}
          onChange={(e) => setEditCurrentPage(Math.max(0, parseInt(e.target.value) || 0))}
          onKeyDown={handleKeyDown}
          className="w-14 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Page"
        />
        <span className="text-gray-400">/</span>
        <input
          type="number"
          min={1}
          value={editTotalPages}
          onChange={(e) => setEditTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
          onKeyDown={handleKeyDown}
          className="w-14 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Total"
        />
        <button
          onClick={handleSave}
          className="p-1 text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          aria-label="Save progress"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!totalPages && !editable) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={() => editable && setIsEditing(true)}
        disabled={!editable}
        className={`inline-flex items-center gap-1.5 text-sm ${
          editable ? "cursor-pointer hover:text-primary-400" : "cursor-default"
        } transition-colors`}
      >
        <BookOpen className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-gray-300">
          {currentPage ?? 0}/{totalPages ?? "?"}
        </span>
        {percentage > 0 && (
          <span className="text-primary-400 font-medium">({percentage}%)</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => editable && setIsEditing(true)}
      disabled={!editable}
      className={`w-full ${editable ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between text-sm mb-1.5">
        <div className="flex items-center gap-1.5 text-gray-300">
          <BookOpen className="w-4 h-4 text-primary-400" />
          <span>
            {currentPage ?? 0} of {totalPages ?? "?"} pages
          </span>
        </div>
        <span className="text-primary-400 font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {editable && (
        <p className="text-xs text-gray-500 mt-1">Click to update progress</p>
      )}
    </button>
  );
}
