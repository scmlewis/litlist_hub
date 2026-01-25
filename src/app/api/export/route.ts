import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/export - Export user's book data
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  try {
    const lists = await prisma.list.findMany({
      where: { userId: session.user.id },
      include: {
        books: {
          include: { book: true },
          orderBy: { addedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const goals = await prisma.readingGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { year: "desc" },
    });

    if (format === "csv" || format === "goodreads") {
      // Flatten all books into a single CSV
      const rows: string[] = [];
      
      // Goodreads-compatible headers
      const headers = [
        "Title",
        "Author",
        "ISBN",
        "My Rating",
        "Average Rating",
        "Publisher",
        "Binding",
        "Number of Pages",
        "Year Published",
        "Original Publication Year",
        "Date Read",
        "Date Added",
        "Bookshelves",
        "Bookshelves with positions",
        "Exclusive Shelf",
        "My Review",
        "Spoiler",
        "Private Notes",
        "Read Count",
        "Owned Copies",
      ];
      rows.push(headers.join(","));

      lists.forEach((list) => {
        list.books.forEach((lb) => {
          const authors = JSON.parse(lb.book.authors) as string[];
          const shelf = lb.status === "DONE" 
            ? "read" 
            : lb.status === "READING" 
              ? "currently-reading" 
              : "to-read";

          const row = [
            `"${lb.book.title.replace(/"/g, '""')}"`,
            `"${authors.join(", ").replace(/"/g, '""')}"`,
            lb.book.isbn || "",
            lb.rating || "",
            "",
            "",
            "",
            lb.totalPages || lb.book.pageCount || "",
            lb.book.publishYear || "",
            lb.book.publishYear || "",
            lb.finishDate ? lb.finishDate.toISOString().split("T")[0] : "",
            lb.addedAt.toISOString().split("T")[0],
            list.name,
            list.name,
            shelf,
            `"${(lb.notes || "").replace(/"/g, '""')}"`,
            "",
            "",
            lb.status === "DONE" ? "1" : "0",
            "",
          ];
          rows.push(row.join(","));
        });
      });

      const csv = rows.join("\n");
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="litlist-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        name: session.user.name,
        email: session.user.email,
      },
      lists: lists.map((list) => ({
        id: list.id,
        name: list.name,
        isPublic: list.isPublic,
        createdAt: list.createdAt,
        books: list.books.map((lb) => ({
          title: lb.book.title,
          authors: JSON.parse(lb.book.authors),
          isbn: lb.book.isbn,
          coverUrl: lb.book.coverUrl,
          publishYear: lb.book.publishYear,
          pageCount: lb.totalPages || lb.book.pageCount,
          status: lb.status,
          rating: lb.rating,
          notes: lb.notes,
          currentPage: lb.currentPage,
          startDate: lb.startDate,
          finishDate: lb.finishDate,
          addedAt: lb.addedAt,
        })),
      })),
      readingGoals: goals,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="litlist-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
