import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/lists/[id] - Get a specific list
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await prisma.list.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        books: {
          include: { book: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}

// PATCH /api/lists/[id] - Update a list
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, isPublic } = body;

    // Verify ownership
    const existing = await prisma.list.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const list = await prisma.list.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Error updating list:", error);
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 });
  }
}

// DELETE /api/lists/[id] - Delete a list
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify ownership
    const existing = await prisma.list.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    await prisma.list.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}
