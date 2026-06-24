"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { StickyNote, Edit2, Save, X, Loader2 } from "lucide-react";

interface BookNotesProps {
  bookId: string;
  listId: string;
  initialNotes: string | null;
  initialReview: string | null;
  onSave: (notes: string | null, review: string | null) => Promise<void>;
  compact?: boolean;
}

export function BookNotes({
  bookId,
  listId,
  initialNotes,
  initialReview,
  onSave,
  compact = false,
}: BookNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [review, setReview] = useState(initialReview || "");
  const [isSaving, setIsSaving] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const hasContent = useMemo(
    () => Boolean(initialNotes || initialReview),
    [initialNotes, initialReview]
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNotes(initialNotes || "");
    setReview(initialReview || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(
        notes.trim() || null,
        review.trim() || null
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setNotes(initialNotes || "");
    setReview(initialReview || "");
  }, [initialNotes, initialReview, bookId]);

  useEffect(() => {
    if (isEditing) {
      notesRef.current?.focus();
    }
  }, [isEditing]);

  if (compact) {
    if (!hasContent && !isEditing) {
      return (
        <button
          onClick={handleEdit}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <StickyNote className="w-3 h-3" />
          Add notes
        </button>
      );
    }

    if (isEditing) {
      return (
        <div className="mt-2 p-3 bg-muted rounded-lg">
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes..."
            className="w-full bg-transparent text-sm text-foreground resize-none focus:outline-none placeholder-muted-foreground"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 group relative">
        <p className="text-xs text-muted-foreground italic line-clamp-2">
          {initialNotes}
        </p>
        <button
          onClick={handleEdit}
          className="absolute -right-1 -top-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border rounded"
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white border border-border rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          Notes & Review
        </h4>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Personal Notes
            </label>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your personal notes about this book..."
              className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder-muted-foreground"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review of this book..."
              className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder-muted-foreground"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-full transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {initialNotes ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {initialNotes}
              </p>
            </div>
          ) : null}
          
          {initialReview ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Review</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {initialReview}
              </p>
            </div>
          ) : null}

          {!hasContent && (
            <p className="text-sm text-muted-foreground italic">
              No notes or review yet. Click the edit button to add some!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
