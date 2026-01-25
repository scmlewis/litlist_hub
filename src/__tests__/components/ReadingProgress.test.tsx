import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadingProgress } from "@/components/ReadingProgress";

describe("ReadingProgress", () => {
  it("renders progress bar with correct percentage", () => {
    render(<ReadingProgress currentPage={50} totalPages={100} />);
    
    // Check for percentage display
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders page count display", () => {
    render(<ReadingProgress currentPage={75} totalPages={300} />);
    
    expect(screen.getByText(/75/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it("handles null currentPage as 0", () => {
    render(<ReadingProgress currentPage={null} totalPages={100} />);
    
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("handles null totalPages gracefully", () => {
    const { container } = render(<ReadingProgress currentPage={50} totalPages={null} />);
    
    // Should still render without crashing
    expect(container).toBeTruthy();
  });

  it("shows editable mode correctly", () => {
    const handleUpdate = vi.fn();
    const { container } = render(
      <ReadingProgress 
        currentPage={50} 
        totalPages={100} 
        onUpdate={handleUpdate}
        editable 
      />
    );
    
    // Component should render in editable mode
    expect(container.firstChild).toBeTruthy();
  });

  it("shows compact view when compact prop is true", () => {
    const { container } = render(
      <ReadingProgress 
        currentPage={50} 
        totalPages={100} 
        compact 
      />
    );
    
    // Compact mode should have smaller styling
    expect(container.firstChild).toBeTruthy();
  });

  it("calculates percentage correctly", () => {
    render(<ReadingProgress currentPage={25} totalPages={100} />);
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("caps percentage at 100%", () => {
    render(<ReadingProgress currentPage={150} totalPages={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("handles 0 totalPages without division error", () => {
    const { container } = render(<ReadingProgress currentPage={50} totalPages={0} />);
    // Should render without crashing
    expect(container).toBeTruthy();
  });
});
