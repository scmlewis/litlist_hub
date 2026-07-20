import Link from "next/link";
import { auth } from "@/lib/auth";
import { Search, BookMarked, Share2, BookOpen, ArrowRight, Sparkles, BookCheck, Library } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tertiary/8 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col items-start text-left relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/80 border border-border rounded-full text-sm font-medium text-muted-foreground mb-8">
            <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse" />
            Track your reading journey
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter-hero text-balance max-w-4xl leading-[0.95]">
            <span className="text-foreground">LitList</span>
            <br />
            <span className="text-primary">Hub</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed text-balance">
            Your personal reading companion. Track books, build lists, and share your literary journey.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {session ? (
              <>
                <Link
                  href="/search"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02] active:scale-[0.98] active:shadow-elevation-1"
                >
                  <Search className="w-5 h-5" />
                  Search Books
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/lists"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-card border border-border text-foreground rounded-2xl font-semibold hover:bg-muted transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookMarked className="w-5 h-5" />
                  My Lists
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02] active:scale-[0.98] active:shadow-elevation-1"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          
          {/* Social proof */}
          <div className="mt-16 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-primary" />
              <span>10k+ books tracked</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <BookCheck className="w-4 h-4 text-tertiary" />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight-section text-balance">
            Everything you need
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Simple tools for serious readers.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300">
            <div className="p-3 bg-primary/15 text-primary rounded-xl inline-block mb-5">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Discover
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Search millions of books from Open Library. Find your next great read.
            </p>
          </div>

          <div className="group p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300">
            <div className="p-3 bg-tertiary/15 text-tertiary rounded-xl inline-block mb-5">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Track
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Mark books as want to read, reading, or finished. Never lose track.
            </p>
          </div>

          <div className="group p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300">
            <div className="p-3 bg-accent/15 text-accent rounded-xl inline-block mb-5">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Share
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Create shareable links to show friends what you&apos;re reading.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 mb-8">
        <div className="relative p-8 md:p-12 bg-card border border-border rounded-3xl shadow-elevation-2 overflow-hidden max-w-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Start building your library</h3>
              <p className="text-muted-foreground">Join readers tracking their journey with LitList Hub.</p>
            </div>
            <Link
              href={session ? "/search" : "/auth/signin"}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02] active:scale-[0.98] active:shadow-elevation-1 shrink-0"
            >
              {session ? "Find Books" : "Get Started"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
