import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { Library, BookMarked, BookOpen, CheckCircle } from "lucide-react";

import type { ReadingStatus } from "@/types";

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
          <div className="p-2 bg-primary/10 rounded-lg">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {list.name}
          </h1>
        </div>
        {list.user && (
          <div className="flex items-center gap-2 text-muted-foreground ml-12">
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
        <div className="bg-card p-4 rounded-xl text-center border border-border">
          <div className="flex justify-center mb-2">
            <BookMarked className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">
            {statusCounts.WANT_TO_READ}
          </div>
          <div className="text-sm text-muted-foreground">Want to Read</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl text-center border border-border">
          <div className="flex justify-center mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {statusCounts.READING}
          </div>
          <div className="text-sm text-muted-foreground">Reading</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center border border-border">
          <div className="flex justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-tertiary" />
          </div>
          <div className="text-2xl font-bold text-tertiary">
            {statusCounts.DONE}
          </div>
          <div className="text-sm text-muted-foreground">Done</div>
        </div>
      </div>

      {/* Books */}
      {list.books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          This list is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {list.books.map((listBook) => (
            <div
              key={listBook.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-elevation-1 hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="w-16 h-20 relative flex-shrink-0 bg-muted rounded-lg overflow-hidden">
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
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  {listBook.book.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {listBook.book.authors.join(", ") || "Unknown Author"}
                </p>
                {listBook.book.publishYear && (
                  <p className="text-xs text-muted-foreground mt-1">{listBook.book.publishYear}</p>
                )}
              </div>
              <StatusBadge status={listBook.status} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Track your own reading at{" "}
          <Link href="/" className="text-primary hover:underline">
            LitList Hub
          </Link>
        </p>
      </div>
    </div>
  );
}
