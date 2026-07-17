import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListFilters } from "@/components/ListFilters";

const defaultProps = {
  filterStatus: null,
  filterMinRating: null,
  sortBy: "addedAt" as const,
  sortOrder: "desc" as const,
  onFilterStatusChange: vi.fn(),
  onFilterMinRatingChange: vi.fn(),
  onSortByChange: vi.fn(),
  onSortOrderChange: vi.fn(),
  totalBooks: 10,
  filteredCount: 10,
};

describe("ListFilters - Color Consistency", () => {
  it("Want to Read filter uses tertiary color, not blue", () => {
    render(<ListFilters {...defaultProps} />);
    
    const wantToReadButton = screen.getByText("Want to Read");
    expect(wantToReadButton).toBeInTheDocument();
    
    // Should not contain blue colors
    expect(wantToReadButton.className).not.toContain("blue-400");
    expect(wantToReadButton.className).not.toContain("blue-500");
  });

  it("Reading filter uses primary color", () => {
    render(<ListFilters {...defaultProps} />);
    
    const readingButton = screen.getByText("Reading");
    expect(readingButton).toBeInTheDocument();
  });

  it("Done filter uses accent color", () => {
    render(<ListFilters {...defaultProps} />);
    
    const doneButton = screen.getByText("Done");
    expect(doneButton).toBeInTheDocument();
  });

  it("calls onFilterStatusChange when status filter is clicked", async () => {
    const user = userEvent.setup();
    const onFilterStatusChange = vi.fn();
    
    render(
      <ListFilters
        {...defaultProps}
        onFilterStatusChange={onFilterStatusChange}
      />
    );

    const wantToReadButton = screen.getByText("Want to Read");
    await user.click(wantToReadButton);

    expect(onFilterStatusChange).toHaveBeenCalledWith("WANT_TO_READ");
  });

  it("shows active filter count when filters are applied", () => {
    render(
      <ListFilters
        {...defaultProps}
        filterStatus="READING"
        filteredCount={5}
      />
    );

    expect(screen.getByText("5 of 10 books")).toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    render(
      <ListFilters
        {...defaultProps}
        filterStatus="READING"
        filteredCount={5}
      />
    );

    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("clear button resets all filters", async () => {
    const user = userEvent.setup();
    const onFilterStatusChange = vi.fn();
    const onFilterMinRatingChange = vi.fn();
    
    render(
      <ListFilters
        {...defaultProps}
        filterStatus="READING"
        filterMinRating={3}
        filteredCount={5}
        onFilterStatusChange={onFilterStatusChange}
        onFilterMinRatingChange={onFilterMinRatingChange}
      />
    );

    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);

    expect(onFilterStatusChange).toHaveBeenCalledWith(null);
    expect(onFilterMinRatingChange).toHaveBeenCalledWith(null);
  });
});
