import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "@/components/StarRating";

describe("StarRating", () => {
  it("renders 5 star buttons", () => {
    render(<StarRating rating={null} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("displays the correct number of filled stars based on rating", () => {
    const { container } = render(<StarRating rating={3} />);
    const filledStars = container.querySelectorAll(".fill-amber-500");
    expect(filledStars.length).toBe(3);
  });

  it("displays no filled stars when rating is null", () => {
    const { container } = render(<StarRating rating={null} />);
    const filledStars = container.querySelectorAll(".fill-amber-500");
    expect(filledStars.length).toBe(0);
  });

  it("calls onChange when a star is clicked in editable mode", () => {
    const handleChange = vi.fn();
    render(<StarRating rating={2} onChange={handleChange} editable />);
    
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]); // Click 4th star
    
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("does not call onChange when not editable", () => {
    const handleChange = vi.fn();
    render(<StarRating rating={2} onChange={handleChange} editable={false} />);
    
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("clears rating when clicking the same star", () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} onChange={handleChange} editable />);
    
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]); // Click 3rd star (same as current rating)
    
    expect(handleChange).toHaveBeenCalledWith(0);
  });

  it("renders with different sizes", () => {
    const { rerender, container } = render(<StarRating rating={3} size="sm" />);
    expect(container.querySelector("svg.w-5")).toBeTruthy();

    rerender(<StarRating rating={3} size="md" />);
    expect(container.querySelector("svg.w-6")).toBeTruthy();

    rerender(<StarRating rating={3} size="lg" />);
    expect(container.querySelector("svg.w-7")).toBeTruthy();
  });
});
