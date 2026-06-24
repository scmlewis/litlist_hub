import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { ReadingStatus } from "@/types";

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
      include: { book: true },
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

    // Validate: currentPage should not exceed totalPages
    const effectiveTotalPages = totalPages ?? listBook.totalPages ?? listBook.book?.pageCount ?? null;
    const effectiveCurrentPage = currentPage ?? listBook.currentPage ?? null;
    if (effectiveCurrentPage != null && effectiveTotalPages != null && effectiveCurrentPage > effectiveTotalPages) {
      return NextResponse.json(
        { error: "Current page cannot exceed total pages" },
        { status: 400 }
      );
    }

    // Validate: finishDate should be >= startDate
    const effectiveStartDate = startDate !== undefined 
      ? (startDate ? new Date(startDate) : null)
      : listBook.startDate;
    const effectiveFinishDate = finishDate !== undefined
      ? (finishDate ? new Date(finishDate) : null)
      : listBook.finishDate;
    if (effectiveStartDate && effectiveFinishDate && effectiveFinishDate < effectiveStartDate) {
      return NextResponse.json(
        { error: "Finish date cannot be before start date" },
        { status: 400 }
      );
    }

    // Auto-set dates based on status changes
    if (status === "READING" && !listBook.startDate) {
      updateData.startDate = new Date();
    }
    if (status === "DONE" && !listBook.finishDate) {
      updateData.finishDate = new Date();
    }

    // Clear finishDate when changing from DONE to another status
    if (status && status !== "DONE" && listBook.status === "DONE") {
      updateData.finishDate = null;
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
