"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Upload, FileText, CheckCircle, AlertCircle, BookOpen, ArrowRight, Loader2, X } from "lucide-react";

interface ParsedBook {
  title: string;
  authors: string[];
  isbn: string | null;
  isbn13: string | null;
  rating: number | null;
  shelf: string;
  dateRead: string | null;
  dateAdded: string | null;
  numberOfPages: number | null;
}

export function ImportPageClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedBooks, setParsedBooks] = useState<ParsedBook[]>([]);
  const [listName, setListName] = useState("Goodreads Import");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const parseCSV = useCallback((text: string): ParsedBook[] => {
    const lines = text.split("\n");
    if (lines.length < 2) return [];

    // Parse header to find column indices
    const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
    
    const getIndex = (names: string[]) => {
      for (const name of names) {
        const idx = header.findIndex((h) => h.includes(name));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const titleIdx = getIndex(["title"]);
    const authorIdx = getIndex(["author"]);
    const isbn13Idx = getIndex(["isbn13"]);
    const isbnIdx = getIndex(["isbn"]);
    const ratingIdx = getIndex(["my rating", "rating"]);
    const shelfIdx = getIndex(["exclusive shelf", "bookshelves", "shelf"]);
    const dateReadIdx = getIndex(["date read"]);
    const dateAddedIdx = getIndex(["date added"]);
    const pagesIdx = getIndex(["number of pages", "pages"]);

    if (titleIdx === -1) {
      showToast("error", "Could not find 'Title' column in CSV");
      return [];
    }

    const books: ParsedBook[] = [];
    
    // Parse each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV parsing with quotes
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const getValue = (idx: number): string => {
        if (idx === -1 || idx >= values.length) return "";
        return values[idx].replace(/^"|"$/g, "").trim();
      };

      const title = getValue(titleIdx);
      if (!title) continue;

      const authorStr = getValue(authorIdx);
      const authors = authorStr ? authorStr.split(",").map((a) => a.trim()).filter(Boolean) : [];

      const ratingStr = getValue(ratingIdx);
      const rating = ratingStr ? parseInt(ratingStr, 10) : null;

      const pagesStr = getValue(pagesIdx);
      const numberOfPages = pagesStr ? parseInt(pagesStr, 10) : null;

      // Clean ISBN (remove = and quotes that Goodreads adds)
      const cleanIsbn = (val: string) => {
        const cleaned = val.replace(/[="]/g, "").trim();
        return cleaned && cleaned !== "0" ? cleaned : null;
      };

      books.push({
        title,
        authors,
        isbn: cleanIsbn(getValue(isbnIdx)),
        isbn13: cleanIsbn(getValue(isbn13Idx)),
        rating: rating && rating > 0 && rating <= 5 ? rating : null,
        shelf: getValue(shelfIdx) || "to-read",
        dateRead: getValue(dateReadIdx) || null,
        dateAdded: getValue(dateAddedIdx) || null,
        numberOfPages: numberOfPages && numberOfPages > 0 ? numberOfPages : null,
      });
    }

    return books;
  }, [showToast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      showToast("error", "Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const books = parseCSV(text);
      setParsedBooks(books);
      
      if (books.length > 0) {
        showToast("success", `Found ${books.length} books in CSV`);
      } else {
        showToast("error", "No books found in CSV file");
      }
    } catch {
      showToast("error", "Failed to parse CSV file");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (parsedBooks.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/import/goodreads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          books: parsedBooks,
          listName: listName.trim() || "Goodreads Import",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImportResult(data.results);
        showToast("success", `Imported ${data.results.imported} books!`);
        
        // Redirect to lists page after short delay
        setTimeout(() => {
          router.push("/lists");
        }, 2000);
      } else {
        const error = await response.json();
        showToast("error", error.error || "Failed to import books");
      }
    } catch {
      showToast("error", "Failed to import books");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedBooks([]);
    setImportResult(null);
  };

  const shelfCounts = useMemo(
    () => parsedBooks.reduce(
      (acc, book) => {
        const shelf = book.shelf.toLowerCase();
        if (shelf === "read") acc.read++;
        else if (shelf === "currently-reading" || shelf === "reading") acc.reading++;
        else acc.toRead++;
        return acc;
      },
      { read: 0, reading: 0, toRead: 0 }
    ),
    [parsedBooks]
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="relative p-4 bg-primary text-primary-foreground rounded-2xl">
            <Upload className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Import from Goodreads</h1>
        <p className="text-muted-foreground">
          Upload your Goodreads library export to import all your books
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-card border border-border shadow-elevation-1 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">How to export from Goodreads:</h2>
        <ol className="space-y-3 text-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-medium">1</span>
            <span>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">goodreads.com/review/import</a></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-medium">2</span>
            <span>Click &quot;Export Library&quot; at the top of the page</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-medium">3</span>
            <span>Wait for the export to complete, then download the CSV file</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-medium">4</span>
            <span>Upload the file below</span>
          </li>
        </ol>
      </div>

      {/* File Upload */}
      {!file ? (
        <label className="block cursor-pointer">
          <div className="bg-muted border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-all duration-300">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports Goodreads library export format
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="bg-card border border-border shadow-elevation-1 rounded-xl p-6">
          {/* File info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isParsing ? "Parsing..." : `${parsedBooks.length} books found`}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {parsedBooks.length > 0 && !importResult && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted p-4 rounded-xl text-center border border-border">
                  <div className="text-2xl font-bold text-primary">{shelfCounts.toRead}</div>
                  <div className="text-sm text-primary">Want to Read</div>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl text-center border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{shelfCounts.reading}</div>
                  <div className="text-sm text-primary">Reading</div>
                </div>
                <div className="bg-accent p-4 rounded-xl text-center border border-border">
                  <div className="text-2xl font-bold text-foreground">{shelfCounts.read}</div>
                  <div className="text-sm text-foreground">Read</div>
                </div>
              </div>

              {/* List name input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Import to list:
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                  placeholder="Enter list name"
                />
              </div>

              {/* Import button */}
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-elevation-1 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Importing...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Import {parsedBooks.length} Books
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Import result */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-tertiary/10 rounded-xl border border-tertiary/30">
                <CheckCircle className="w-6 h-6 text-tertiary" />
                <div>
                  <p className="font-medium text-foreground">Import Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    {importResult.imported} imported, {importResult.skipped} skipped (already in list)
                  </p>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="font-medium text-foreground">
                      {importResult.errors.length} books had errors
                    </p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {importResult.errors.slice(0, 5).map((title, i) => (
                      <li key={i}>• {title}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>...and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-center text-muted-foreground">
                Redirecting to your lists...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
