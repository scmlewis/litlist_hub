import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListFilters } from "@/components/ListFilters";

describe("ListFilters", () => {
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

  it("renders status filter pills", () => {
    render(<ListFilters {...defaultProps} />);
    
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Want to Read")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders sort dropdown with options", () => {
    render(<ListFilters {...defaultProps} />);
    
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2); // Rating filter and Sort dropdown
  });

  it("calls onFilterStatusChange when status pill is clicked", async () => {
    const onFilterStatusChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ListFilters {...defaultProps} onFilterStatusChange={onFilterStatusChange} />);
    
    await user.click(screen.getByText("Reading"));
    
    expect(onFilterStatusChange).toHaveBeenCalledWith("READING");
  });

  it("calls onFilterStatusChange with null when All is clicked", async () => {
    const onFilterStatusChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ListFilters 
        {...defaultProps} 
        filterStatus="READING"
        onFilterStatusChange={onFilterStatusChange} 
      />
    );
    
    await user.click(screen.getByText("All"));
    
    expect(onFilterStatusChange).toHaveBeenCalledWith(null);
  });

  it("toggles sort order when button is clicked", async () => {
    const onSortOrderChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ListFilters {...defaultProps} onSortOrderChange={onSortOrderChange} />);
    
    // Find the sort order toggle button (has SortDesc or SortAsc icon)
    const sortOrderButton = screen.getByTitle("Descending");
    await user.click(sortOrderButton);
    
    expect(onSortOrderChange).toHaveBeenCalledWith("asc");
  });

  it("shows filtered count when filters are applied", () => {
    render(<ListFilters {...defaultProps} filterStatus="DONE" filteredCount={5} />);
    
    expect(screen.getByText("5 of 10 books")).toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    render(<ListFilters {...defaultProps} filterStatus="READING" />);
    
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("clears filters when clear button is clicked", async () => {
    const onFilterStatusChange = vi.fn();
    const onFilterMinRatingChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ListFilters 
        {...defaultProps} 
        filterStatus="READING"
        filterMinRating={3}
        onFilterStatusChange={onFilterStatusChange}
        onFilterMinRatingChange={onFilterMinRatingChange}
      />
    );
    
    await user.click(screen.getByText("Clear"));
    
    expect(onFilterStatusChange).toHaveBeenCalledWith(null);
    expect(onFilterMinRatingChange).toHaveBeenCalledWith(null);
  });

  it("highlights active status filter", () => {
    render(<ListFilters {...defaultProps} filterStatus="DONE" />);
    
    const doneButton = screen.getByText("Done").closest("button");
    expect(doneButton).toHaveClass("bg-primary-500/20");
  });
});
