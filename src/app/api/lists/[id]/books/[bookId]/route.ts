import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";

interface RouteParams {
  params: Promise<{ id: string; bookId: string }>;
}

// PATCH /api/lists/[id]/books/[bookId] - Update book status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id: listId, bookId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, notes, review, rating, currentPage, totalPages, startDate, finishDate } = body;

    // Verify list ownership
    const list = await prisma.list.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Find the list book entry
    const listBook = await prisma.listBook.findFirst({
      where: { listId, bookId },
    });

    if (!listBook) {
      return NextResponse.json({ error: "Book not in list" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status as ReadingStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (review !== undefined) updateData.review = review;
    if (rating !== undefined) updateData.rating = rating === 0 ? null : rating;
    if (currentPage !== undefined) updateData.currentPage = currentPage;
    if (totalPages !== undefined) updateData.totalPages = totalPages;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (finishDate !== undefined) updateData.finishDate = finishDate ? new Date(finishDate) : null;

    // Auto-set dates based on status changes
    if (status === "READING" && !listBook.startDate) {
      updateData.startDate = new Date();
    }
    if (status === "DONE" && !listBook.finishDate) {
      updateData.finishDate = new Date();
    }

    // Update the list book
    const updated = await prisma.listBook.update({
      where: { id: listBook.id },
      data: updateData,
      include: { book: true },
    });

    return NextResponse.json({ listBook: updated });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

// DELETE /api/lists/[id]/books/[bookId] - Remove book from list
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: listId, bookId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify list ownership
    const list = await prisma.list.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Find and delete the list book entry
    const listBook = await prisma.listBook.findFirst({
      where: { listId, bookId },
    });

    if (!listBook) {
      return NextResponse.json({ error: "Book not in list" }, { status: 404 });
    }

    await prisma.listBook.delete({
      where: { id: listBook.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing book:", error);
    return NextResponse.json({ error: "Failed to remove book" }, { status: 500 });
  }
}
