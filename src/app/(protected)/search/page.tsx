import { SearchPageClient } from "./SearchPageClient";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-40" />
          <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
            <Search className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Search Books
          </h1>
          <p className="text-stone-400 text-sm">
            Discover millions of books from Open Library
          </p>
        </div>
      </div>
      <SearchPageClient />
    </div>
  );
}
