import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookCard } from "@/components/BookCard";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} data-testid="next-image" />
  ),
}));

const mockBook = {
  key: "/works/OL123W",
  title: "The Great Gatsby",
  authors: ["F. Scott Fitzgerald"],
  coverUrl: "https://example.com/cover.jpg",
  publishYear: 1925,
};

describe("BookCard - Design Improvements", () => {
  it("renders book title and author", () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    expect(screen.getByText("F. Scott Fitzgerald")).toBeInTheDocument();
  });

  it("renders book cover image", () => {
    render(<BookCard book={mockBook} />);
    const image = screen.getByAltText("The Great Gatsby");
    expect(image).toBeInTheDocument();
  });

  it("Add to List button has active:scale-[0.98] for press feedback", () => {
    const onAdd = vi.fn();
    render(<BookCard book={mockBook} onAdd={onAdd} isInList={false} />);

    const addButton = screen.getByText("Add to List");
    expect(addButton.className).toContain("active:scale-[0.98]");
  });

  it("Add to List button has active:shadow-elevation-1 for depth change on press", () => {
    const onAdd = vi.fn();
    render(<BookCard book={mockBook} onAdd={onAdd} isInList={false} />);

    const addButton = screen.getByText("Add to List");
    expect(addButton.className).toContain("active:shadow-elevation-1");
  });

  it("Remove button has text-destructive and hover:bg-destructive/10 styling", () => {
    const onRemove = vi.fn();
    render(
      <BookCard book={mockBook} onRemove={onRemove} isInList={true} status="READING" />
    );

    const removeButton = screen.getByText("Remove");
    expect(removeButton.className).toContain("text-destructive");
    expect(removeButton.className).toContain("hover:bg-destructive/10");
  });

  it("renders with no cover gracefully", () => {
    const bookNoCover = { ...mockBook, coverUrl: null };
    render(<BookCard book={bookNoCover} />);

    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    // Should show BookOpen icon fallback
    const fallback = document.querySelector(".bg-muted");
    expect(fallback).toBeInTheDocument();
  });

  it("shows publish year when available", () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(/Published 1925/)).toBeInTheDocument();
  });

  it("hides publish year when not available", () => {
    const bookNoYear = { ...mockBook, publishYear: undefined };
    render(<BookCard book={bookNoYear} />);
    expect(screen.queryByText(/Published/)).not.toBeInTheDocument();
  });
});
