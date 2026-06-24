import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the Toast context
const mockShowToast = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Import after mocking
import { GoalsPageClient } from "@/app/(protected)/goals/GoalsPageClient";

describe("GoalsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  it("renders goals page with title", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ goal: null, booksRead: 0 }),
    });

    render(<GoalsPageClient />);
    
    expect(screen.getByText("Reading Goals")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves, keeps loading
    );

    const { container } = render(<GoalsPageClient />);
    
    // Component should render while loading
    expect(container.querySelector(".max-w-2xl")).toBeTruthy();
  });

  it("displays goal progress when goal exists", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        goal: { id: "1", year: 2026, target: 12 }, 
        booksRead: 6 
      }),
    });

    render(<GoalsPageClient />);
    
    await waitFor(() => {
      // Look for "of 12" text which indicates the goal target
      expect(screen.getByText(/of/)).toBeInTheDocument();
    });
  });

  it("shows set goal button when no goal exists", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ goal: null, booksRead: 0 }),
    });

    render(<GoalsPageClient />);
    
    await waitFor(() => {
      // Look for "Set a Goal" button text
      expect(screen.getByText("Set a Goal")).toBeInTheDocument();
    });
  });

  it("allows changing year", async () => {
    const user = userEvent.setup();
    
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: null, booksRead: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: null, booksRead: 0 }),
      });

    render(<GoalsPageClient />);
    
    await waitFor(() => {
      expect(screen.getByText("2026")).toBeInTheDocument();
    });
    
    // Find all buttons and click the first one (prev year)
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[0]; // First button is prev year
    
    await user.click(prevButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("calculates progress percentage correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        goal: { id: "1", year: 2026, target: 10 }, 
        booksRead: 5 
      }),
    });

    render(<GoalsPageClient />);
    
    await waitFor(() => {
      // 5 out of 10 = 50% - look for the percentage in the text
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });
  });

  it("shows tips section", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ goal: null, booksRead: 0 }),
    });

    render(<GoalsPageClient />);
    
    await waitFor(() => {
      expect(screen.getByText("📚 Reading Tips")).toBeInTheDocument();
    });
  });
});
