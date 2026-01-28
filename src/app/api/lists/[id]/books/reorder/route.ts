import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const listId = params.id;

    // Verify list ownership
    const list = await prisma.list.findUnique({
      where: { id: listId },
      select: { userId: true },
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const body = await request.json();
    const { bookOrders } = body as { bookOrders: Array<{ id: string; order: number }> };

    if (!Array.isArray(bookOrders)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected bookOrders array." },
        { status: 400 }
      );
    }

    // Update book orders in a transaction
    await prisma.$transaction(
      bookOrders.map(({ id, order }) =>
        prisma.listBook.updateMany({
          where: {
            id,
            listId, // Ensure the book belongs to this list
          },
          data: { order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder books:", error);
    return NextResponse.json(
      { error: "Failed to reorder books" },
      { status: 500 }
    );
  }
}
