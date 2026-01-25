import Link from "next/link";
import { auth } from "@/lib/auth";
import { Search, BookMarked, Share2, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-30 scale-150" />
          <div className="relative p-5 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-3xl shadow-2xl shadow-primary-500/30">
            <BookOpen className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            LitList Hub
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Your personal reading companion. Track books, build lists, and share your literary journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session ? (
            <>
              <Link
                href="/search"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 cursor-pointer shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02]"
              >
                <Search className="w-5 h-5" />
                Search Books
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lists"
                className="group inline-flex items-center gap-3 px-8 py-4 glass-card text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              >
                <BookMarked className="w-5 h-5" />
                My Lists
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 cursor-pointer shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/40 text-primary-300 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need to track your reading
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="group p-8 glass-card rounded-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <Search className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Discover Books
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Search millions of books from the Open Library database. Find your next great read.
            </p>
          </div>

          <div className="group p-8 glass-card rounded-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl">
                <BookMarked className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Track Progress
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Mark books as want to read, currently reading, or finished. Never lose track again.
            </p>
          </div>

          <div className="group p-8 glass-card rounded-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Share Lists
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Create shareable links to show friends what you&apos;re reading. Inspire others.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
