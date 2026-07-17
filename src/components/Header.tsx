import Link from "next/link";
import Image from "next/image";
import { auth, signIn, signOut } from "@/lib/auth";
import { BookOpen, Search, Library, LogOut, Sparkles, Upload, Target, BarChart3, Download, Settings } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 header-safe-top">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-elevation-1">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 bg-primary rounded-xl transition-transform duration-200 group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            LitList
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {session ? (
            <>
              <Link
                href="/search"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
              <Link
                href="/lists"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <Library className="w-4 h-4" />
                <span>My Lists</span>
              </Link>
              <Link
                href="/import"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </Link>
              <Link
                href="/goals"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <Target className="w-4 h-4" />
                <span>Goals</span>
              </Link>
              <Link
                href="/stats"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </Link>
              <Link
                href="/export"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Link>
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-border"
                  />
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-elevation-1 hover:shadow-elevation-2 hover:brightness-110 active:scale-[0.98] active:shadow-elevation-1 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </button>
            </form>
          )}
        </div>

        {/* Mobile: User avatar only (nav is at bottom) */}
        <div className="md:hidden flex items-center gap-2">
          {session ? (
            session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-border"
              />
            )
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-elevation-1 active:scale-[0.98] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Start
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
