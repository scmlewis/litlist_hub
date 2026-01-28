import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListsPageClient } from "./ListsPageClient";
import { Library, Plus } from "lucide-react";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";

export default async function ListsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  let lists: Array<{
    id: string;
    name: string;
    shareId: string;
    isPublic: boolean;
    books: Array<{
      id: string;
      status: ReadingStatus;
      bookId: string;
      book: {
        id: string;
        openLibraryKey: string;
        title: string;
        authors: string[];
        coverUrl: string | null;
        publishYear: number | null;
        pageCount: number | null;
      };
      rating: number | null;
      currentPage: number | null;
      totalPages: number | null;
      notes: string | null;
      review: string | null;
      order: number;
    }>;
    _count: { books: number };
  }> = [];

  try {
    const rawLists = await prisma.list.findMany({
      where: { userId: session.user.id },
      include: {
        books: {
          include: { book: true },
          orderBy: { addedAt: "asc" },
        },
        _count: { select: { books: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Parse JSON authors field for client component and cast status
    lists = rawLists.map((list) => ({
      ...list,
      books: list.books.map((lb, index) => ({
        ...lb,
        order: (lb as { order?: number }).order ?? index,
        status: lb.status as ReadingStatus,
        book: {
          ...lb.book,
          authors: JSON.parse(lb.book.authors) as string[],
        },
      })),
    }));
  } catch (error) {
    console.error("Failed to fetch lists:", error);
    // Return empty lists on error - the client will show empty state
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
              <Library className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              My Lists
            </h1>
            <p className="text-stone-400 text-sm">
              Organize your reading journey
            </p>
          </div>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Books
        </Link>
      </div>

      <ListsPageClient initialLists={lists} />
    </div>
  );
}
