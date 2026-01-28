import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lists - Get all lists for current user
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lists = await prisma.list.findMany({
      where: { userId: session.user.id },
      include: {
        books: {
          include: { book: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { books: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

// POST /api/lists - Create a new list
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const list = await prisma.list.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
