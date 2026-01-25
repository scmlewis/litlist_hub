export interface OpenLibrarySearchResult {
  key: string; // e.g., "/works/OL27448W"
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  isbn?: string[];
  number_of_pages_median?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibrarySearchResult[];
}

export interface BookData {
  openLibraryKey: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishYear: number | null;
  isbn: string | null;
  pageCount: number | null;
}

const OPEN_LIBRARY_API = "https://openlibrary.org";
const COVERS_API = "https://covers.openlibrary.org";

export function getCoverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M"): string | null {
  if (!coverId) return null;
  return `${COVERS_API}/b/id/${coverId}-${size}.jpg`;
}

export function getCoverUrlByIsbn(isbn: string, size: "S" | "M" | "L" = "M"): string {
  return `${COVERS_API}/b/isbn/${isbn}-${size}.jpg`;
}

export async function searchBooks(query: string, limit = 20): Promise<BookData[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `${OPEN_LIBRARY_API}/search.json?q=${encodedQuery}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year,isbn,number_of_pages_median`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "LitListHub/1.0 (https://github.com/litlist-hub)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data: OpenLibrarySearchResponse = await response.json();

  return data.docs.map((doc) => ({
    openLibraryKey: doc.key,
    title: doc.title,
    authors: doc.author_name || [],
    coverUrl: getCoverUrl(doc.cover_i, "M"),
    publishYear: doc.first_publish_year || null,
    isbn: doc.isbn?.[0] || null,
    pageCount: doc.number_of_pages_median || null,
  }));
}

export async function getBookByKey(key: string): Promise<BookData | null> {
  // Key format: "/works/OL27448W"
  const url = `${OPEN_LIBRARY_API}${key}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "LitListHub/1.0 (https://github.com/litlist-hub)",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();

  // Get author names (requires additional API calls)
  let authors: string[] = [];
  if (data.authors) {
    const authorPromises = data.authors.slice(0, 5).map(async (author: { author: { key: string } }) => {
      try {
        const authorRes = await fetch(`${OPEN_LIBRARY_API}${author.author.key}.json`);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          return authorData.name;
        }
      } catch {
        return null;
      }
      return null;
    });
    authors = (await Promise.all(authorPromises)).filter(Boolean);
  }

  return {
    openLibraryKey: key,
    title: data.title,
    authors,
    coverUrl: data.covers?.[0] ? getCoverUrl(data.covers[0], "M") : null,
    publishYear: data.first_publish_date ? parseInt(data.first_publish_date) : null,
    isbn: null,
    pageCount: null,
  };
}
