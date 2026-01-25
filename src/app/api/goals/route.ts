import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals - Get reading goals for current user
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
    const goal = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    });

    // Count books finished this year
    const booksRead = await prisma.listBook.count({
      where: {
        list: { userId: session.user.id },
        status: "DONE",
        finishDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    return NextResponse.json({ goal, booksRead, year });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

// POST /api/goals - Create or update reading goal
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { year, target } = body;

    if (!year || !target || target < 1) {
      return NextResponse.json({ error: "Invalid goal data" }, { status: 400 });
    }

    const goal = await prisma.readingGoal.upsert({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
      update: { target },
      create: {
        userId: session.user.id,
        year,
        target,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error saving goal:", error);
    return NextResponse.json({ error: "Failed to save goal" }, { status: 500 });
  }
}
