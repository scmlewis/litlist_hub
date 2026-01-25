import Link from "next/link";
import Image from "next/image";
import { auth, signIn, signOut } from "@/lib/auth";
import { BookOpen, Search, Library, LogOut, Sparkles, Upload, Target, BarChart3, Download } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between glass-card rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-1.5 sm:p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            LitList
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {session ? (
            <>
              <Link
                href="/search"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
              <Link
                href="/lists"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <Library className="w-4 h-4" />
                <span>My Lists</span>
              </Link>
              <Link
                href="/import"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </Link>
              <Link
                href="/goals"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Goals</span>
              </Link>
              <Link
                href="/stats"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </Link>
              <Link
                href="/export"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-primary-400 hover:bg-primary-900/30 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Link>
              <div className="flex items-center gap-3 ml-3 pl-4 border-l border-gray-700/50">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-primary-800"
                  />
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 cursor-pointer"
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 cursor-pointer"
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
                className="rounded-full ring-2 ring-primary-800"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm cursor-pointer"
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
