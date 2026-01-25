import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Get reading statistics for current user
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
    // Get all finished books for the user
    const finishedBooks = await prisma.listBook.findMany({
      where: {
        list: { userId: session.user.id },
        status: "DONE",
      },
      include: {
        book: true,
      },
      orderBy: { finishDate: "desc" },
    });

    // Filter by year for yearly stats
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year + 1}-01-01`);
    const booksThisYear = finishedBooks.filter((lb) => {
      if (!lb.finishDate) return false;
      return lb.finishDate >= yearStart && lb.finishDate < yearEnd;
    });

    // Calculate stats
    const totalBooksRead = finishedBooks.length;
    const booksReadThisYear = booksThisYear.length;

    // Total pages read
    const totalPagesRead = finishedBooks.reduce((sum, lb) => {
      const pages = lb.totalPages || lb.book.pageCount || 0;
      return sum + pages;
    }, 0);

    const pagesThisYear = booksThisYear.reduce((sum, lb) => {
      const pages = lb.totalPages || lb.book.pageCount || 0;
      return sum + pages;
    }, 0);

    // Average rating
    const ratedBooks = finishedBooks.filter((lb) => lb.rating !== null);
    const averageRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, lb) => sum + (lb.rating || 0), 0) / ratedBooks.length
        : null;

    // Books per month this year
    const booksPerMonth: number[] = Array(12).fill(0);
    booksThisYear.forEach((lb) => {
      if (lb.finishDate) {
        const month = lb.finishDate.getMonth();
        booksPerMonth[month]++;
      }
    });

    // Currently reading
    const currentlyReading = await prisma.listBook.count({
      where: {
        list: { userId: session.user.id },
        status: "READING",
      },
    });

    // Want to read
    const wantToRead = await prisma.listBook.count({
      where: {
        list: { userId: session.user.id },
        status: "WANT_TO_READ",
      },
    });

    // Average reading time (days between start and finish)
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

    // Recent books
    const recentBooks = booksThisYear.slice(0, 5).map((lb) => ({
      id: lb.id,
      title: lb.book.title,
      authors: JSON.parse(lb.book.authors),
      coverUrl: lb.book.coverUrl,
      rating: lb.rating,
      finishDate: lb.finishDate,
      pageCount: lb.totalPages || lb.book.pageCount,
    }));

    return NextResponse.json({
      year,
      totalBooksRead,
      booksReadThisYear,
      totalPagesRead,
      pagesThisYear,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      booksPerMonth,
      currentlyReading,
      wantToRead,
      averageReadingDays: averageReadingDays
        ? Math.round(averageReadingDays)
        : null,
      recentBooks,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
