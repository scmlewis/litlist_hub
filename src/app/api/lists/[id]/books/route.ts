import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { ReadingStatus } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/lists/[id]/books - Add a book to a list
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: listId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { openLibraryKey, title, authors, coverUrl, publishYear, isbn, pageCount, status } = body;

    if (!openLibraryKey || !title) {
      return NextResponse.json({ error: "Book data is required" }, { status: 400 });
    }

    // Verify list ownership
    const list = await prisma.list.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Find or create the book
    let book = await prisma.book.findUnique({
      where: { openLibraryKey },
    });

    if (!book) {
      book = await prisma.book.create({
        data: {
          openLibraryKey,
          title,
          authors: JSON.stringify(authors || []),
          coverUrl,
          publishYear,
          isbn,
          pageCount,
        },
      });
    }

    // Check if book is already in list
    const existingListBook = await prisma.listBook.findUnique({
      where: {
        listId_bookId: {
          listId,
          bookId: book.id,
        },
      },
    });

    if (existingListBook) {
      return NextResponse.json({ error: "Book already in list" }, { status: 409 });
    }

    // Get the max order value to append new book at the end
    const maxOrderBook = await prisma.listBook.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    
    const nextOrder = maxOrderBook ? maxOrderBook.order + 1 : 0;

    // Add book to list
    const listBook = await prisma.listBook.create({
      data: {
        listId,
        bookId: book.id,
        status: (status as ReadingStatus) || "WANT_TO_READ",
        order: nextOrder,
      },
      include: { book: true },
    });

    return NextResponse.json({ listBook }, { status: 201 });
  } catch (error) {
    console.error("Error adding book to list:", error);
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}
