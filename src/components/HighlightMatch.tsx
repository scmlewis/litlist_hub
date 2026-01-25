"use client";

import { useMemo } from "react";

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export function HighlightMatch({
  text,
  query,
  className = "",
  highlightClassName = "bg-primary-500/30 text-primary-300 rounded px-0.5",
}: HighlightMatchProps) {
  const parts = useMemo(() => {
    if (!query.trim()) {
      return [{ text, isMatch: false }];
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const splitParts = text.split(regex);

    return splitParts.map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === query.toLowerCase(),
    }));
  }, [text, query]);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}
