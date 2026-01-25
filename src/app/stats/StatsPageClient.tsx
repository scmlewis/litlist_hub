"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReadingHeatmap } from "@/components/ReadingHeatmap";
import { DayActivityModal } from "@/components/DayActivityModal";
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  Star, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Library,
  BookMarked,
  Target
} from "lucide-react";

interface RecentBook {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  rating: number | null;
  finishDate: string | null;
  pageCount: number | null;
}

interface DayBook {
  id: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
}

interface DailyActivity {
  count: number;
  books: DayBook[];
}

interface Stats {
  year: number;
  totalBooksRead: number;
  booksReadThisYear: number;
  totalPagesRead: number;
  pagesThisYear: number;
  pagesInProgress: number;
  averageRating: number | null;
  booksPerMonth: number[];
  currentlyReading: number;
  wantToRead: number;
  averageReadingDays: number | null;
  recentBooks: RecentBook[];
  yearsWithData: number[];
  dailyActivity: Record<string, DailyActivity>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function StatsPageClient() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: string; books: DayBook[] } | null>(null);

  useEffect(() => {
    fetchStats();
  }, [year]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stats?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxBooksInMonth = stats?.booksPerMonth?.length 
    ? Math.max(...stats.booksPerMonth, 1) 
    : 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-xl opacity-30" />
          <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Reading Statistics</h1>
        <p className="text-stone-400">Track your reading journey</p>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setYear(year - 1)}
          disabled={stats?.yearsWithData && !stats.yearsWithData.includes(year - 1) && year - 1 < Math.min(...(stats.yearsWithData || [new Date().getFullYear()]))}
          className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold text-white min-w-[100px] text-center">
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= new Date().getFullYear()}
          className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-8 w-8 bg-stone-700 rounded-lg mb-3" />
                <div className="h-8 w-16 bg-stone-700 rounded mb-2" />
                <div className="h-4 w-24 bg-stone-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-6">
              <BookOpen className="w-8 h-8 text-accent-400 mb-3" />
              <div className="text-3xl font-bold text-white">{stats.booksReadThisYear}</div>
              <div className="text-sm text-stone-400">Books Read in {year}</div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <Library className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-3xl font-bold text-white">{stats.pagesThisYear.toLocaleString()}</div>
              <div className="text-sm text-stone-400">Pages Read</div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <Star className="w-8 h-8 text-amber-400 mb-3" />
              <div className="text-3xl font-bold text-white">
                {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
              </div>
              <div className="text-sm text-stone-400">Avg Rating</div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <Clock className="w-8 h-8 text-accent-400 mb-3" />
              <div className="text-3xl font-bold text-white">
                {stats.averageReadingDays ? `${stats.averageReadingDays}d` : "—"}
              </div>
              <div className="text-sm text-stone-400">Avg Time per Book</div>
            </div>
          </div>

          {/* Reading Status */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/lists" className="glass-card rounded-2xl p-6 hover:bg-stone-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-900/40 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.currentlyReading}</div>
                  <div className="text-sm text-stone-400">Currently Reading</div>
                </div>
              </div>
            </Link>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-900/40 rounded-xl">
                  <Library className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{(stats.pagesInProgress ?? 0).toLocaleString()}</div>
                  <div className="text-sm text-stone-400">Pages in Progress</div>
                </div>
              </div>
            </div>
            <Link href="/lists" className="glass-card rounded-2xl p-6 hover:bg-stone-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-900/40 rounded-xl">
                  <BookMarked className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.wantToRead}</div>
                  <div className="text-sm text-stone-400">Want to Read</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Monthly Chart */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Books Read per Month</h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {stats.booksPerMonth.map((count, index) => {
                const height = (count / maxBooksInMonth) * 100;
                const isCurrentMonth = year === new Date().getFullYear() && index === new Date().getMonth();
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm text-stone-400">{count > 0 ? count : ""}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isCurrentMonth
                          ? "bg-gradient-to-t from-primary-600 to-primary-400"
                          : count > 0
                          ? "bg-gradient-to-t from-accent-600 to-accent-400"
                          : "bg-stone-700"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-stone-500">{MONTHS[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reading Heatmap */}
          <ReadingHeatmap
            year={year}
            dailyActivity={stats.dailyActivity || {}}
            onDayClick={(date, activity) => setSelectedDay({ date, books: activity.books })}
          />

          {/* Recent Books */}
          {stats.recentBooks.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recently Finished</h3>
              <div className="space-y-3">
                {stats.recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-4 p-3 bg-stone-800/50 rounded-xl">
                    <div className="w-12 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-700">
                          <BookOpen className="w-5 h-5 text-stone-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{book.title}</h4>
                      <p className="text-sm text-stone-400 truncate">
                        {book.authors.join(", ") || "Unknown Author"}
                      </p>
                    </div>
                    {book.rating && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{book.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time Stats */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All-Time Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-800/50 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.totalBooksRead}</div>
                <div className="text-sm text-stone-400">Total Books Read</div>
              </div>
              <div className="p-4 bg-stone-800/50 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.totalPagesRead.toLocaleString()}</div>
                <div className="text-sm text-stone-400">Total Pages Read</div>
              </div>
            </div>
          </div>

          {/* Goal Link */}
          <Link
            href="/goals"
            className="block glass-card rounded-2xl p-6 hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-900/40 rounded-xl">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Set a Reading Goal</h3>
                <p className="text-sm text-stone-400">Challenge yourself to read more</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-stone-400">No reading data available yet.</p>
          <Link href="/search" className="text-primary-400 hover:underline">
            Start adding books →
          </Link>
        </div>
      )}

      {/* Day Activity Modal */}
      <DayActivityModal
        date={selectedDay?.date ?? null}
        books={selectedDay?.books ?? []}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
