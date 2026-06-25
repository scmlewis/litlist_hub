import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Mock the Toast context
vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Import after mocking
import { StatsPageClient } from "@/app/(protected)/stats/StatsPageClient";

describe("StatsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  const mockStatsData = {
    year: 2026,
    totalBooksRead: 25,
    booksReadThisYear: 12,
    totalPagesRead: 7500,
    pagesThisYear: 3000,
    pagesInProgress: 150,
    averageRating: 4.2,
    booksPerMonth: [2, 3, 1, 0, 2, 1, 0, 0, 0, 0, 0, 0],
    currentlyReading: 2,
    wantToRead: 5,
    averageReadingDays: 14,
    yearsWithData: [2026, 2025],
    recentBooks: [
      {
        id: "1",
        title: "Test Book 1",
        authors: ["Author 1"],
        coverUrl: null,
        rating: 4,
        finishDate: "2026-01-15",
        pageCount: 300,
      },
      {
        id: "2",
        title: "Test Book 2",
        authors: ["Author 2"],
        coverUrl: null,
        rating: 5,
        finishDate: "2026-01-10",
        pageCount: 250,
      },
    ],
  };

  it("renders stats page with title", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    expect(screen.getByText("Statistics")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );

    const { container } = render(<StatsPageClient />);
    
    // Check that the component renders while loading
    expect(container.querySelector(".max-w-4xl")).toBeTruthy();
  });

  it("displays total books count", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // Check for the total books value
      expect(screen.getByText("25")).toBeInTheDocument();
    });
  });

  it("displays books this year", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // 12 books read this year
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("displays average rating", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      expect(screen.getByText("4.2")).toBeInTheDocument();
    });
  });

  it("displays total pages read", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // Page count formatted with commas
      expect(screen.getByText(/7,?500/)).toBeInTheDocument();
    });
  });

  it("renders monthly chart section", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // Look for month labels (may appear in both chart and heatmap)
      const janElements = screen.getAllByText("Jan");
      expect(janElements.length).toBeGreaterThan(0);
    });
  });

  it("displays recent books", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsData),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument();
      expect(screen.getByText("Test Book 2")).toBeInTheDocument();
    });
  });

  it("handles empty stats gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        year: 2026,
        totalBooksRead: 0,
        booksReadThisYear: 0,
        totalPagesRead: 0,
        pagesThisYear: 0,
        averageRating: null,
        booksPerMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        currentlyReading: 0,
        wantToRead: 0,
        averageReadingDays: null,
        recentBooks: [],
      }),
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // Should still render without crashing
      expect(screen.getByText("Statistics")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    render(<StatsPageClient />);
    
    await waitFor(() => {
      // Component should still render without crashing
      expect(screen.getByText("Statistics")).toBeInTheDocument();
    });
  });
});
