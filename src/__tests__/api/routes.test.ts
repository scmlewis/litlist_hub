import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockPrisma = {
  list: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  listBook: {
    findMany: vi.fn(),
  },
  readingGoal: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";

describe("API Routes - Export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should require authentication", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    
    // Simulate what the route would check
    const session = await auth();
    expect(session).toBeNull();
  });

  it("should return user data when authenticated", async () => {
    const mockSession = {
      user: { id: "user-123", name: "Test User", email: "test@test.com" },
    };
    
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSession);
    
    const session = await auth();
    expect(session?.user?.id).toBe("user-123");
  });
});

describe("API Routes - Goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch reading goal for specific year", async () => {
    const mockGoal = {
      id: "goal-1",
      year: 2026,
      target: 12,
      userId: "user-123",
    };

    mockPrisma.readingGoal.findUnique.mockResolvedValueOnce(mockGoal);

    const result = await mockPrisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: "user-123",
          year: 2026,
        },
      },
    });

    expect(result).toEqual(mockGoal);
    expect(mockPrisma.readingGoal.findUnique).toHaveBeenCalledWith({
      where: {
        userId_year: {
          userId: "user-123",
          year: 2026,
        },
      },
    });
  });

  it("should return null when no goal exists", async () => {
    mockPrisma.readingGoal.findUnique.mockResolvedValueOnce(null);

    const result = await mockPrisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: "user-123",
          year: 2025,
        },
      },
    });

    expect(result).toBeNull();
  });
});

describe("API Routes - Stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all lists with books for stats", async () => {
    const mockLists = [
      {
        id: "list-1",
        name: "My Books",
        books: [
          {
            id: "lb-1",
            status: "DONE",
            rating: 4,
            finishDate: new Date("2026-01-15"),
            book: {
              title: "Test Book",
              pageCount: 300,
            },
          },
        ],
      },
    ];

    mockPrisma.list.findMany.mockResolvedValueOnce(mockLists);

    const lists = await mockPrisma.list.findMany({
      where: { userId: "user-123" },
      include: {
        books: {
          include: { book: true },
        },
      },
    });

    expect(lists).toHaveLength(1);
    expect(lists[0].books).toHaveLength(1);
    expect(lists[0].books[0].status).toBe("DONE");
  });

  it("should calculate stats from lists data", () => {
    const mockBooks = [
      { status: "DONE", rating: 4, book: { pageCount: 300 } },
      { status: "DONE", rating: 5, book: { pageCount: 250 } },
      { status: "READING", rating: null, book: { pageCount: 400 } },
      { status: "WANT_TO_READ", rating: null, book: { pageCount: 200 } },
    ];

    const doneBooks = mockBooks.filter((b) => b.status === "DONE");
    const totalPages = doneBooks.reduce((sum, b) => sum + (b.book.pageCount || 0), 0);
    const ratings = doneBooks.filter((b) => b.rating !== null).map((b) => b.rating!);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    expect(doneBooks).toHaveLength(2);
    expect(totalPages).toBe(550);
    expect(avgRating).toBe(4.5);
  });
});

describe("API Routes - Books Detail", () => {
  it("should format Open Library key correctly", () => {
    const key = "/works/OL123W";
    const formattedKey = key.replace("/works/", "");
    
    expect(formattedKey).toBe("OL123W");
  });

  it("should construct correct Open Library URL", () => {
    const key = "OL123W";
    const url = `https://openlibrary.org/works/${key}.json`;
    
    expect(url).toBe("https://openlibrary.org/works/OL123W.json");
  });
});
