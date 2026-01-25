import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the Toast context
const mockShowToast = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Import after mocking
import { ExportPageClient } from "@/app/export/ExportPageClient";

describe("ExportPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  it("renders export page with title", () => {
    render(<ExportPageClient />);
    
    expect(screen.getByText("Export Your Data")).toBeInTheDocument();
  });

  it("renders all three export options", () => {
    render(<ExportPageClient />);
    
    expect(screen.getByText("JSON Export")).toBeInTheDocument();
    expect(screen.getByText("CSV Export")).toBeInTheDocument();
    expect(screen.getByText("Goodreads Format")).toBeInTheDocument();
  });

  it("renders what's included section", () => {
    render(<ExportPageClient />);
    
    expect(screen.getByText("📦 What's Included")).toBeInTheDocument();
    expect(screen.getByText(/reading lists and their books/i)).toBeInTheDocument();
    expect(screen.getByText(/ratings, notes, and reviews/i)).toBeInTheDocument();
  });

  it("renders privacy note", () => {
    render(<ExportPageClient />);
    
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
  });

  it("triggers JSON export when clicking JSON button", async () => {
    const mockBlob = new Blob(["test"], { type: "application/json" });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        "Content-Disposition": 'attachment; filename="export.json"',
      }),
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock URL.createObjectURL
    const mockUrl = "blob:test";
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    render(<ExportPageClient />);
    
    const jsonButton = screen.getByText("JSON Export").closest("button");
    if (jsonButton) {
      fireEvent.click(jsonButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/export?format=json");
      });
    }
  });

  it("shows error toast on export failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    render(<ExportPageClient />);
    
    const jsonButton = screen.getByText("JSON Export").closest("button");
    if (jsonButton) {
      fireEvent.click(jsonButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to export data");
      });
    }
  });

  it("disables buttons while exporting", async () => {
    // Create a promise that we can resolve manually
    let resolveExport: () => void;
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      exportPromise.then(() => ({
        ok: true,
        headers: new Headers(),
        blob: () => Promise.resolve(new Blob()),
      }))
    );

    render(<ExportPageClient />);
    
    const jsonButton = screen.getByText("JSON Export").closest("button");
    const csvButton = screen.getByText("CSV Export").closest("button");
    
    if (jsonButton) {
      fireEvent.click(jsonButton);
      
      // All buttons should be disabled while loading
      await waitFor(() => {
        expect(jsonButton).toBeDisabled();
        expect(csvButton).toBeDisabled();
      });

      // Resolve the export
      resolveExport!();
    }
  });
});
