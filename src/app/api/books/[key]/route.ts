import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ key: string }>;
}

// GET /api/books/[key] - Get book details from Open Library
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;

  try {
    // Decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);
    
    // Fetch work details from Open Library
    const workUrl = `https://openlibrary.org${decodedKey}.json`;
    const workResponse = await fetch(workUrl, {
      headers: {
        "User-Agent": "LitListHub/1.0 (https://github.com/litlist-hub)",
      },
    });

    if (!workResponse.ok) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const workData = await workResponse.json();

    // Fetch author details if available
    let authors: { name: string; key: string }[] = [];
    if (workData.authors && Array.isArray(workData.authors)) {
      const authorPromises = workData.authors.slice(0, 5).map(async (author: { author?: { key: string } }) => {
        if (author.author?.key) {
          try {
            const authorResponse = await fetch(
              `https://openlibrary.org${author.author.key}.json`,
              {
                headers: {
                  "User-Agent": "LitListHub/1.0",
                },
              }
            );
            if (authorResponse.ok) {
              const authorData = await authorResponse.json();
              return { name: authorData.name, key: author.author.key };
            }
          } catch {
            // Ignore author fetch errors
          }
        }
        return null;
      });
      authors = (await Promise.all(authorPromises)).filter(Boolean);
    }

    // Get description
    let description = "";
    if (workData.description) {
      description =
        typeof workData.description === "string"
          ? workData.description
          : workData.description.value || "";
    }

    // Get subjects
    const subjects: string[] = workData.subjects?.slice(0, 10) || [];

    // Get cover
    const coverId = workData.covers?.[0];
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : null;

    // Fetch editions to get more details
    let firstPublishYear = workData.first_publish_date
      ? parseInt(workData.first_publish_date)
      : null;
    let pageCount: number | null = null;
    let isbn: string | null = null;

    try {
      const editionsResponse = await fetch(
        `https://openlibrary.org${decodedKey}/editions.json?limit=5`,
        {
          headers: {
            "User-Agent": "LitListHub/1.0",
          },
        }
      );
      if (editionsResponse.ok) {
        const editionsData = await editionsResponse.json();
        const editions = editionsData.entries || [];
        
        // Find first edition with page count
        for (const edition of editions) {
          if (!pageCount && edition.number_of_pages) {
            pageCount = edition.number_of_pages;
          }
          if (!isbn && edition.isbn_13?.length) {
            isbn = edition.isbn_13[0];
          }
          if (!isbn && edition.isbn_10?.length) {
            isbn = edition.isbn_10[0];
          }
          if (pageCount && isbn) break;
        }
      }
    } catch {
      // Ignore editions fetch errors
    }

    return NextResponse.json({
      key: decodedKey,
      title: workData.title,
      authors,
      description,
      subjects,
      coverUrl,
      firstPublishYear,
      pageCount,
      isbn,
      links: workData.links || [],
    });
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
