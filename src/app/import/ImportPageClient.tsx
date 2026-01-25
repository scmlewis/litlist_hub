"use client";

import { useState, useCallback } from "react";
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

  const shelfCounts = parsedBooks.reduce(
    (acc, book) => {
      const shelf = book.shelf.toLowerCase();
      if (shelf === "read") acc.read++;
      else if (shelf === "currently-reading" || shelf === "reading") acc.reading++;
      else acc.toRead++;
      return acc;
    },
    { read: 0, reading: 0, toRead: 0 }
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-xl opacity-30" />
          <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Import from Goodreads</h1>
        <p className="text-gray-400">
          Upload your Goodreads library export to import all your books
        </p>
      </div>

      {/* Instructions */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">How to export from Goodreads:</h2>
        <ol className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-900/50 text-primary-400 rounded-full text-sm font-medium">1</span>
            <span>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">goodreads.com/review/import</a></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-900/50 text-primary-400 rounded-full text-sm font-medium">2</span>
            <span>Click &quot;Export Library&quot; at the top of the page</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-900/50 text-primary-400 rounded-full text-sm font-medium">3</span>
            <span>Wait for the export to complete, then download the CSV file</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-900/50 text-primary-400 rounded-full text-sm font-medium">4</span>
            <span>Upload the file below</span>
          </li>
        </ol>
      </div>

      {/* File Upload */}
      {!file ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-600 rounded-2xl p-10 text-center hover:border-primary-500 hover:bg-primary-900/20 transition-all duration-300">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-white mb-2">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-gray-400">
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
        <div className="glass-card rounded-2xl p-6">
          {/* File info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {isParsing ? "Parsing..." : `${parsedBooks.length} books found`}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {parsedBooks.length > 0 && !importResult && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-900/30 p-4 rounded-xl text-center border border-amber-800/50">
                  <div className="text-2xl font-bold text-amber-300">{shelfCounts.toRead}</div>
                  <div className="text-sm text-amber-400">Want to Read</div>
                </div>
                <div className="bg-primary-900/30 p-4 rounded-xl text-center border border-primary-800/50">
                  <div className="text-2xl font-bold text-primary-300">{shelfCounts.reading}</div>
                  <div className="text-sm text-primary-400">Reading</div>
                </div>
                <div className="bg-accent-900/30 p-4 rounded-xl text-center border border-accent-800/50">
                  <div className="text-2xl font-bold text-accent-300">{shelfCounts.read}</div>
                  <div className="text-sm text-accent-400">Read</div>
                </div>
              </div>

              {/* List name input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Import to list:
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter list name"
                />
              </div>

              {/* Import button */}
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
              <div className="flex items-center gap-3 p-4 bg-accent-900/30 rounded-xl border border-accent-800/50">
                <CheckCircle className="w-6 h-6 text-accent-400" />
                <div>
                  <p className="font-medium text-accent-300">Import Complete!</p>
                  <p className="text-sm text-accent-400">
                    {importResult.imported} imported, {importResult.skipped} skipped (already in list)
                  </p>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="p-4 bg-amber-900/30 rounded-xl border border-amber-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <p className="font-medium text-amber-300">
                      {importResult.errors.length} books had errors
                    </p>
                  </div>
                  <ul className="text-sm text-amber-400 space-y-1">
                    {importResult.errors.slice(0, 5).map((title, i) => (
                      <li key={i}>• {title}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>...and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-center text-gray-400">
                Redirecting to your lists...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
