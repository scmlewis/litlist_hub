import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function deduplicateBooks<T extends { book: { openLibraryKey: string } }>(books: T[]): T[] {
  const seen = new Set<string>();
  return books.filter((lb) => {
    if (seen.has(lb.book.openLibraryKey)) return false;
    seen.add(lb.book.openLibraryKey);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : new Date().getFullYear();

  try {
    // Single query: fetch all listBooks with status in [DONE, READING, WANT_TO_READ]
    const allBooks = await prisma.listBook.findMany({
      where: {
        list: { userId: session.user.id },
        status: { in: ["DONE", "READING", "WANT_TO_READ"] },
      },
      include: { book: true },
      orderBy: { finishDate: "desc" },
    });

    // Partition by status
    const allFinishedBooks = allBooks.filter((lb) => lb.status === "DONE");
    const finishedBooks = deduplicateBooks(allFinishedBooks);

    const allCurrentlyReading = allBooks.filter((lb) => lb.status === "READING");
    const currentlyReadingBooks = deduplicateBooks(allCurrentlyReading);

    const allWantToRead = allBooks.filter((lb) => lb.status === "WANT_TO_READ");
    const wantToRead = deduplicateBooks(allWantToRead).length;

    // Filter by year for yearly stats
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year + 1}-01-01`);
    const booksThisYear = finishedBooks.filter((lb) => {
      if (!lb.finishDate) return false;
      return lb.finishDate >= yearStart && lb.finishDate < yearEnd;
    });

    const totalBooksRead = finishedBooks.length;
    const booksReadThisYear = booksThisYear.length;

    const totalPagesRead = finishedBooks.reduce((sum, lb) => {
      const pages = lb.totalPages || lb.book.pageCount || 0;
      return sum + pages;
    }, 0);

    const pagesThisYear = booksThisYear.reduce((sum, lb) => {
      const pages = lb.totalPages || lb.book.pageCount || 0;
      return sum + pages;
    }, 0);

    const ratedBooks = finishedBooks.filter((lb) => lb.rating !== null);
    const averageRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, lb) => sum + (lb.rating || 0), 0) / ratedBooks.length
        : null;

    const booksPerMonth: number[] = Array(12).fill(0);
    booksThisYear.forEach((lb) => {
      if (lb.finishDate) {
        const month = lb.finishDate.getMonth();
        booksPerMonth[month]++;
      }
    });

    const currentlyReading = currentlyReadingBooks.length;

    const pagesInProgress = currentlyReadingBooks.reduce((sum, lb) => {
      return sum + (lb.currentPage || 0);
    }, 0);

    const booksWithDates = finishedBooks.filter(
      (lb) => lb.startDate && lb.finishDate
    );
    const averageReadingDays =
      booksWithDates.length > 0
        ? booksWithDates.reduce((sum, lb) => {
            const days = Math.ceil(
              (lb.finishDate!.getTime() - lb.startDate!.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + Math.max(1, days);
          }, 0) / booksWithDates.length
        : null;

    const yearsWithData = [...new Set(
      allFinishedBooks
        .filter(lb => lb.finishDate)
        .map(lb => lb.finishDate!.getFullYear())
    )].sort((a, b) => b - a);

    const currentYear = new Date().getFullYear();
    if (!yearsWithData.includes(currentYear)) {
      yearsWithData.unshift(currentYear);
    }

    const recentBooks = booksThisYear.slice(0, 5).map((lb) => ({
      id: lb.id,
      title: lb.book.title,
      authors: JSON.parse(lb.book.authors),
      coverUrl: lb.book.coverUrl,
      rating: lb.rating,
      finishDate: lb.finishDate,
      pageCount: lb.totalPages || lb.book.pageCount,
    }));

    const dailyActivity: Record<string, { count: number; books: { id: string; title: string; coverUrl: string | null; rating: number | null }[] }> = {};
    booksThisYear.forEach((lb) => {
      if (lb.finishDate) {
        const dateKey = lb.finishDate.toISOString().split("T")[0];
        if (!dailyActivity[dateKey]) {
          dailyActivity[dateKey] = { count: 0, books: [] };
        }
        dailyActivity[dateKey].count++;
        dailyActivity[dateKey].books.push({
          id: lb.id,
          title: lb.book.title,
          coverUrl: lb.book.coverUrl,
          rating: lb.rating,
        });
      }
    });

    return NextResponse.json({
      year,
      totalBooksRead,
      booksReadThisYear,
      totalPagesRead,
      pagesThisYear,
      pagesInProgress,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      booksPerMonth,
      currentlyReading,
      wantToRead,
      averageReadingDays: averageReadingDays
        ? Math.round(averageReadingDays)
        : null,
      recentBooks,
      yearsWithData,
      dailyActivity,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
