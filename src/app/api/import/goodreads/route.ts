import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface GoodreadsBook {
  title: string;
  authors: string[];
  isbn: string | null;
  isbn13: string | null;
  rating: number | null;
  shelf: string;
  dateRead: string | null;
  dateAdded: string | null;
  numberOfPages: number | null;
}

// Map Goodreads shelf to our status
function mapShelfToStatus(shelf: string): "WANT_TO_READ" | "READING" | "DONE" {
  const normalizedShelf = shelf.toLowerCase().trim();
  if (normalizedShelf === "currently-reading" || normalizedShelf === "reading") {
    return "READING";
  }
  if (normalizedShelf === "read") {
    return "DONE";
  }
  return "WANT_TO_READ";
}

// POST /api/import/goodreads - Import books from Goodreads CSV
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { books, listName }: { books: GoodreadsBook[]; listName: string } = body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return NextResponse.json({ error: "No books provided" }, { status: 400 });
    }

    if (!listName || typeof listName !== "string") {
      return NextResponse.json({ error: "List name is required" }, { status: 400 });
    }

    // Create or get the list
    let list = await prisma.list.findFirst({
      where: {
        userId: session.user.id,
        name: listName.trim(),
      },
    });

    if (!list) {
      list = await prisma.list.create({
        data: {
          name: listName.trim(),
          userId: session.user.id,
        },
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each book
    for (const bookData of books) {
      try {
        // Create a unique key based on ISBN or title+author
        const openLibraryKey = bookData.isbn13 || bookData.isbn 
          ? `/isbn/${bookData.isbn13 || bookData.isbn}`
          : `/import/${encodeURIComponent(bookData.title)}-${encodeURIComponent(bookData.authors.join(","))}`;

        // Find or create the book
        let book = await prisma.book.findFirst({
          where: {
            OR: [
              { openLibraryKey },
              ...(bookData.isbn ? [{ isbn: bookData.isbn }] : []),
              ...(bookData.isbn13 ? [{ isbn: bookData.isbn13 }] : []),
            ],
          },
        });

        if (!book) {
          // Try to find by Open Library ISBN search
          let coverUrl: string | null = null;
          if (bookData.isbn || bookData.isbn13) {
            const isbn = bookData.isbn13 || bookData.isbn;
            coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
          }

          book = await prisma.book.create({
            data: {
              openLibraryKey,
              title: bookData.title,
              authors: JSON.stringify(bookData.authors),
              isbn: bookData.isbn13 || bookData.isbn,
              coverUrl,
              pageCount: bookData.numberOfPages,
            },
          });
        }

        // Check if book is already in list
        const existingListBook = await prisma.listBook.findFirst({
          where: {
            listId: list.id,
            bookId: book.id,
          },
        });

        if (existingListBook) {
          results.skipped++;
          continue;
        }

        // Add book to list
        const status = mapShelfToStatus(bookData.shelf);
        await prisma.listBook.create({
          data: {
            listId: list.id,
            bookId: book.id,
            status,
            rating: bookData.rating && bookData.rating > 0 ? bookData.rating : null,
            totalPages: bookData.numberOfPages,
            finishDate: bookData.dateRead ? new Date(bookData.dateRead) : null,
          },
        });

        results.imported++;
      } catch (err) {
        console.error(`Error importing book "${bookData.title}":`, err);
        results.errors.push(bookData.title);
      }
    }

    return NextResponse.json({
      success: true,
      listId: list.id,
      results,
    });
  } catch (error) {
    console.error("Error importing from Goodreads:", error);
    return NextResponse.json({ error: "Failed to import books" }, { status: 500 });
  }
}
