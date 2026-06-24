"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  editable?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onChange,
  editable = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating ?? rating ?? 0;

  const handleClick = (starIndex: number) => {
    if (!editable || !onChange) return;
    if (rating === starIndex) {
      onChange(0);
    } else {
      onChange(starIndex);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHoverRating(null)}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= displayRating;
        return (
          <button
            key={starIndex}
            type="button"
            disabled={!editable}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => editable && setHoverRating(starIndex)}
            className={`${
              editable
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            } focus:outline-none disabled:cursor-default`}
            aria-label={`Rate ${starIndex} stars`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? "fill-amber-500 text-amber-500"
                  : "fill-transparent text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
      {rating !== null && rating > 0 && (
        <span className="ml-1.5 text-sm text-muted-foreground font-medium">
          {rating}/5
        </span>
      )}
    </div>
  );
}
