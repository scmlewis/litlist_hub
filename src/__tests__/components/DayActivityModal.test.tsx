import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayActivityModal } from "@/components/DayActivityModal";

describe("DayActivityModal", () => {
  const mockBooks = [
    { id: "1", title: "Test Book 1", coverUrl: null, rating: 4 },
    { id: "2", title: "Test Book 2", coverUrl: "/cover.jpg", rating: 5 },
  ];

  const defaultProps = {
    date: "2026-01-15",
    books: mockBooks,
    onClose: vi.fn(),
  };

  it("renders nothing when date is null", () => {
    const { container } = render(
      <DayActivityModal date={null} books={[]} onClose={vi.fn()} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it("renders modal when date is provided", () => {
    render(<DayActivityModal {...defaultProps} />);
    
    expect(screen.getByText("Books Finished")).toBeInTheDocument();
  });

  it("displays formatted date", () => {
    render(<DayActivityModal {...defaultProps} />);
    
    // Date should be formatted as full date
    expect(screen.getByText(/January 15, 2026/)).toBeInTheDocument();
  });

  it("displays book titles", () => {
    render(<DayActivityModal {...defaultProps} />);
    
    expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    expect(screen.getByText("Test Book 2")).toBeInTheDocument();
  });

  it("displays book count in footer", () => {
    render(<DayActivityModal {...defaultProps} />);
    
    expect(screen.getByText("2 books completed")).toBeInTheDocument();
  });

  it("displays singular form for one book", () => {
    render(
      <DayActivityModal 
        {...defaultProps} 
        books={[mockBooks[0]]} 
      />
    );
    
    expect(screen.getByText("1 book completed")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    const { container } = render(<DayActivityModal {...defaultProps} onClose={onClose} />);
    
    // Find close button by looking for the X icon
    const closeButton = container.querySelector("button .lucide-x")?.closest("button");
    
    expect(closeButton).not.toBeNull();
    if (closeButton) {
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    const { container } = render(
      <DayActivityModal {...defaultProps} onClose={onClose} />
    );
    
    // Click on the backdrop (the outermost div with fixed position)
    const backdrop = container.querySelector(".fixed.inset-0");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("displays star ratings for books", () => {
    const { container } = render(<DayActivityModal {...defaultProps} />);
    
    // Check for star icons (SVG elements with lucide-star class)
    const starIcons = container.querySelectorAll(".lucide-star");
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it("handles empty books array", () => {
    render(
      <DayActivityModal 
        date="2026-01-15" 
        books={[]} 
        onClose={vi.fn()} 
      />
    );
    
    expect(screen.getByText("No books finished on this day")).toBeInTheDocument();
  });

  it("handles books without ratings", () => {
    render(
      <DayActivityModal 
        {...defaultProps}
        books={[{ id: "1", title: "No Rating Book", coverUrl: null, rating: null }]}
      />
    );
    
    expect(screen.getByText("No Rating Book")).toBeInTheDocument();
  });
});
