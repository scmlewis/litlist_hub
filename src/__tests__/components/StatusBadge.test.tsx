import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the StatusBadge component
import { StatusBadge } from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders WANT_TO_READ status correctly", () => {
    render(<StatusBadge status="WANT_TO_READ" />);
    expect(screen.getByText(/want to read/i)).toBeTruthy();
  });

  it("renders READING status correctly", () => {
    render(<StatusBadge status="READING" />);
    expect(screen.getByText(/reading/i)).toBeTruthy();
  });

  it("renders DONE status correctly", () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText(/done/i)).toBeTruthy();
  });

  it("applies correct styling for WANT_TO_READ", () => {
    const { container } = render(<StatusBadge status="WANT_TO_READ" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("blue");
  });

  it("applies correct styling for READING", () => {
    const { container } = render(<StatusBadge status="READING" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("amber");
  });

  it("applies correct styling for DONE", () => {
    const { container } = render(<StatusBadge status="DONE" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("green");
  });

  it("renders as select when editable with onChange", () => {
    const onChange = vi.fn();
    render(<StatusBadge status="READING" onChange={onChange} editable />);
    const select = screen.getByRole("combobox");
    expect(select).toBeTruthy();
  });

  it("calls onChange when status is changed in editable mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusBadge status="READING" onChange={onChange} editable />);
    
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "DONE");
    
    expect(onChange).toHaveBeenCalledWith("DONE");
  });
});
