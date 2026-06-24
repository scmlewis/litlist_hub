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
          <div className="relative p-5 bg-primary rounded-3xl shadow-elevation-2">
            <BookOpen className="w-14 h-14 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
            LitList Hub
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Your personal reading companion. Track books, build lists, and share your literary journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session ? (
            <>
              <Link
                href="/search"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02]"
              >
                <Search className="w-5 h-5" />
                Search Books
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lists"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-card border border-border text-foreground rounded-2xl font-semibold hover:bg-muted transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              >
                <BookMarked className="w-5 h-5" />
                My Lists
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02]"
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
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to track your reading
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="group p-8 bg-card border border-border rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="relative p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
                <Search className="w-7 h-7" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Discover Books
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Search millions of books from the Open Library database. Find your next great read.
            </p>
          </div>

          <div className="group p-8 bg-card border border-border rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="relative p-4 bg-tertiary/20 text-tertiary rounded-2xl">
                <BookMarked className="w-7 h-7" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Track Progress
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Mark books as want to read, currently reading, or finished. Never lose track again.
            </p>
          </div>

          <div className="group p-8 bg-card border border-border rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 cursor-pointer">
            <div className="relative inline-block mb-6">
              <div className="relative p-4 bg-purple-500/20 text-purple-400 rounded-2xl">
                <Share2 className="w-7 h-7" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Share Lists
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Create shareable links to show friends what you&apos;re reading. Inspire others.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
