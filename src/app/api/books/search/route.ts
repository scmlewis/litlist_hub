import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/services/openLibrary";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const books = await searchBooks(query, 20);
    return NextResponse.json({ books });
  } catch (error) {
    console.error("Book search error:", error);
    return NextResponse.json({ error: "Failed to search books" }, { status: 500 });
  }
}
