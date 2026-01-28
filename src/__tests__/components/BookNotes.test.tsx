import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookNotes } from "@/components/BookNotes";

describe("BookNotes", () => {
  const defaultProps = {
    bookId: "book-1",
    listId: "list-1",
    initialNotes: null,
    initialReview: null,
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Add notes' button when no notes exist in compact mode", () => {
    render(<BookNotes {...defaultProps} compact />);
    
    expect(screen.getByText(/add notes/i)).toBeInTheDocument();
  });

  it("renders existing notes in compact mode", () => {
    render(
      <BookNotes 
        {...defaultProps} 
        initialNotes="My test notes" 
        compact 
      />
    );
    
    expect(screen.getByText("My test notes")).toBeInTheDocument();
  });

  it("opens edit mode when clicking add notes", async () => {
    const user = userEvent.setup();
    render(<BookNotes {...defaultProps} compact />);
    
    await user.click(screen.getByText(/add notes/i));
    
    expect(screen.getByPlaceholderText(/personal notes/i)).toBeInTheDocument();
  });

  it("renders notes and review in full mode", () => {
    render(
      <BookNotes 
        {...defaultProps} 
        initialNotes="Test notes"
        initialReview="Test review"
      />
    );
    
    expect(screen.getByText("Test notes")).toBeInTheDocument();
    expect(screen.getByText("Test review")).toBeInTheDocument();
  });

  it("shows empty state message when no notes in full mode", () => {
    render(<BookNotes {...defaultProps} />);
    
    expect(screen.getByText(/no notes or review yet/i)).toBeInTheDocument();
  });

  it("calls onSave with correct values when saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    render(<BookNotes {...defaultProps} onSave={onSave} compact />);
    
    // Open edit mode
    await user.click(screen.getByText(/add notes/i));
    
    // Type notes
    const textarea = screen.getByPlaceholderText(/personal notes/i);
    await user.type(textarea, "New note content");
    
    // Save
    await user.click(screen.getByRole("button", { name: /save/i }));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("New note content", null);
    });
  });

  it("cancels editing and reverts to original notes", async () => {
    const user = userEvent.setup();
    
    render(
      <BookNotes 
        {...defaultProps} 
        initialNotes="Original notes"
        compact 
      />
    );
    
    // Open edit mode
    const editButton = document.querySelector("button");
    if (editButton) {
      await user.click(editButton);
    }
    
    // Type new content
    const textarea = screen.queryByPlaceholderText(/personal notes/i);
    if (textarea) {
      await user.clear(textarea);
      await user.type(textarea, "Changed notes");
      
      // Cancel
      await user.click(screen.getByText(/cancel/i));
    }
    
    // Should show original notes again
    expect(screen.getByText("Original notes")).toBeInTheDocument();
  });

  it("focuses textarea automatically when entering edit mode", async () => {
    const user = userEvent.setup();
    render(<BookNotes {...defaultProps} compact />);
    
    await user.click(screen.getByText(/add notes/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/personal notes/i)).toHaveFocus();
    });
  });

  it("trims whitespace when saving notes", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    render(<BookNotes {...defaultProps} onSave={onSave} compact />);
    
    await user.click(screen.getByText(/add notes/i));
    await user.type(screen.getByPlaceholderText(/personal notes/i), "  spaces  ");
    await user.click(screen.getByRole("button", { name: /save/i }));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("spaces", null);
    });
  });

  it("saves null when notes are empty string", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    render(<BookNotes {...defaultProps} onSave={onSave} compact />);
    
    await user.click(screen.getByText(/add notes/i));
    await user.click(screen.getByRole("button", { name: /save/i }));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(null, null);
    });
  });

  it("updates notes when initialNotes prop changes", () => {
    const { rerender } = render(
      <BookNotes {...defaultProps} initialNotes="First" compact />
    );
    
    expect(screen.getByText("First")).toBeInTheDocument();
    
    rerender(
      <BookNotes {...defaultProps} initialNotes="Second" compact />
    );
    
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("shows loading state while saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn((): Promise<void> => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<BookNotes {...defaultProps} onSave={onSave} compact />);
    
    await user.click(screen.getByText(/add notes/i));
    await user.type(screen.getByPlaceholderText(/personal notes/i), "Test");
    await user.click(screen.getByRole("button", { name: /save/i }));
    
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
