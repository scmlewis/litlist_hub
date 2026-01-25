import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { Library, BookMarked, BookOpen, CheckCircle } from "lucide-react";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  const rawList = await prisma.list.findUnique({
    where: { shareId },
    include: {
      user: { select: { name: true, image: true } },
      books: {
        include: { book: true },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!rawList || !rawList.isPublic) {
    notFound();
  }

  // Parse JSON authors field
  const list = {
    ...rawList,
    books: rawList.books.map((lb) => ({
      ...lb,
      status: lb.status as ReadingStatus,
      book: {
        ...lb.book,
        authors: JSON.parse(lb.book.authors) as string[],
      },
    })),
  };

  const statusCounts = {
    WANT_TO_READ: list.books.filter((b) => b.status === "WANT_TO_READ").length,
    READING: list.books.filter((b) => b.status === "READING").length,
    DONE: list.books.filter((b) => b.status === "DONE").length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-900/40 rounded-lg">
            <Library className="w-6 h-6 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {list.name}
          </h1>
        </div>
        {list.user && (
          <div className="flex items-center gap-2 text-stone-400 ml-12">
            {list.user.image && (
              <Image
                src={list.user.image}
                alt={list.user.name || "User"}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span>by {list.user.name || "Anonymous"}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-accent-900/30 p-4 rounded-xl text-center border border-accent-800">
          <div className="flex justify-center mb-2">
            <BookMarked className="w-5 h-5 text-accent-400" />
          </div>
          <div className="text-2xl font-bold text-accent-300">
            {statusCounts.WANT_TO_READ}
          </div>
          <div className="text-sm text-accent-400">Want to Read</div>
        </div>
        <div className="bg-primary-900/30 p-4 rounded-xl text-center border border-primary-800">
          <div className="flex justify-center mb-2">
            <BookOpen className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-primary-300">
            {statusCounts.READING}
          </div>
          <div className="text-sm text-primary-400">Reading</div>
        </div>
        <div className="bg-green-900/30 p-4 rounded-xl text-center border border-green-800">
          <div className="flex justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-300">
            {statusCounts.DONE}
          </div>
          <div className="text-sm text-green-400">Done</div>
        </div>
      </div>

      {/* Books */}
      {list.books.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          This list is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {list.books.map((listBook) => (
            <div
              key={listBook.id}
              className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-stone-800/50 transition-colors duration-200"
            >
              <div className="w-16 h-20 relative flex-shrink-0 bg-gradient-to-br from-primary-900/40 to-primary-800/40 rounded-lg overflow-hidden">
                {listBook.book.coverUrl ? (
                  <Image
                    src={listBook.book.coverUrl}
                    alt={listBook.book.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">
                  {listBook.book.title}
                </h3>
                <p className="text-sm text-stone-400">
                  {listBook.book.authors.join(", ") || "Unknown Author"}
                </p>
                {listBook.book.publishYear && (
                  <p className="text-xs text-stone-500 mt-1">{listBook.book.publishYear}</p>
                )}
              </div>
              <StatusBadge status={listBook.status} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-stone-400">
        <p>
          Track your own reading at{" "}
          <a href="/" className="text-primary-400 hover:underline">
            LitList Hub
          </a>
        </p>
      </div>
    </div>
  );
}
