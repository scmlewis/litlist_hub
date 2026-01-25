import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadingHeatmap } from "@/components/ReadingHeatmap";

describe("ReadingHeatmap", () => {
  // Use a past year for consistent testing
  const mockDailyActivity = {
    "2025-06-15": { 
      count: 1, 
      books: [{ id: "1", title: "Test Book", coverUrl: null, rating: 4 }] 
    },
    "2025-06-20": { 
      count: 2, 
      books: [
        { id: "2", title: "Book 2", coverUrl: null, rating: 5 },
        { id: "3", title: "Book 3", coverUrl: null, rating: 3 }
      ] 
    },
  };

  const defaultProps = {
    year: 2025,
    dailyActivity: mockDailyActivity,
    onDayClick: vi.fn(),
  };

  it("renders the heatmap title", () => {
    render(<ReadingHeatmap {...defaultProps} />);
    
    expect(screen.getByText("Reading Activity")).toBeInTheDocument();
  });

  it("renders day of week labels", () => {
    render(<ReadingHeatmap {...defaultProps} />);
    
    // Only odd days are shown (Mon, Wed, Fri)
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });

  it("renders month labels", () => {
    render(<ReadingHeatmap {...defaultProps} />);
    
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeInTheDocument();
  });

  it("renders legend", () => {
    render(<ReadingHeatmap {...defaultProps} />);
    
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders day cells with activity having colored backgrounds", () => {
    const { container } = render(<ReadingHeatmap {...defaultProps} />);
    
    // Check for amber-colored cells (indicating activity)
    const activeCells = container.querySelectorAll('button[class*="bg-amber"]');
    expect(activeCells.length).toBeGreaterThan(0);
  });

  it("calls onDayClick when a day with activity is clicked", async () => {
    const onDayClick = vi.fn();
    const user = userEvent.setup();
    
    const { container } = render(<ReadingHeatmap {...defaultProps} onDayClick={onDayClick} />);
    
    // Find a button with activity (amber background)
    const activeButtons = container.querySelectorAll('button[class*="bg-amber"]');
    expect(activeButtons.length).toBeGreaterThan(0);
    
    // Click the first active button
    if (activeButtons[0]) {
      await user.click(activeButtons[0]);
      expect(onDayClick).toHaveBeenCalled();
    }
  });

  it("does not call onDayClick for days without activity", async () => {
    const onDayClick = vi.fn();
    const user = userEvent.setup();
    
    const { container } = render(<ReadingHeatmap {...defaultProps} onDayClick={onDayClick} />);
    
    // Find a button without activity (gray background, not amber)
    const inactiveButtons = container.querySelectorAll('button[class*="bg-stone-800"]:not([class*="bg-amber"])');
    
    if (inactiveButtons[0]) {
      await user.click(inactiveButtons[0]);
      expect(onDayClick).not.toHaveBeenCalled();
    }
  });

  it("handles empty dailyActivity", () => {
    render(<ReadingHeatmap {...defaultProps} dailyActivity={{}} />);
    
    expect(screen.getByText("Reading Activity")).toBeInTheDocument();
  });

  it("renders correct number of week columns", () => {
    const { container } = render(<ReadingHeatmap {...defaultProps} />);
    
    // A year has 52-53 weeks
    const weekColumns = container.querySelectorAll('.flex.flex-col[style*="gap: 3px"]');
    expect(weekColumns.length).toBeGreaterThanOrEqual(52);
  });
});
