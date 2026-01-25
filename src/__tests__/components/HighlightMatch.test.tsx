import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightMatch } from "@/components/HighlightMatch";

describe("HighlightMatch", () => {
  it("renders text without highlighting when query is empty", () => {
    render(<HighlightMatch text="Hello World" query="" />);
    
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.queryByRole("mark")).not.toBeInTheDocument();
  });

  it("highlights matching text", () => {
    render(<HighlightMatch text="Hello World" query="World" />);
    
    const mark = screen.getByText("World");
    expect(mark.tagName).toBe("MARK");
  });

  it("is case insensitive", () => {
    render(<HighlightMatch text="Hello World" query="world" />);
    
    const mark = screen.getByText("World");
    expect(mark.tagName).toBe("MARK");
  });

  it("renders non-matching parts as regular text", () => {
    const { container } = render(<HighlightMatch text="Hello World" query="World" />);
    
    expect(container.textContent).toBe("Hello World");
  });

  it("handles multiple occurrences", () => {
    render(<HighlightMatch text="foo bar foo" query="foo" />);
    
    const marks = screen.getAllByText("foo");
    expect(marks).toHaveLength(2);
    marks.forEach((mark) => {
      expect(mark.tagName).toBe("MARK");
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <HighlightMatch text="Hello" query="" className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom highlight className", () => {
    render(
      <HighlightMatch 
        text="Hello World" 
        query="World" 
        highlightClassName="custom-highlight" 
      />
    );
    
    const mark = screen.getByText("World");
    expect(mark).toHaveClass("custom-highlight");
  });

  it("escapes regex special characters in query", () => {
    render(<HighlightMatch text="Hello (World)" query="(World)" />);
    
    const mark = screen.getByText("(World)");
    expect(mark.tagName).toBe("MARK");
  });

  it("handles whitespace-only query", () => {
    render(<HighlightMatch text="Hello World" query="   " />);
    
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.queryByRole("mark")).not.toBeInTheDocument();
  });
});
