"use client";

import { useMemo } from "react";

interface DailyActivity {
  count: number;
  books: { id: string; title: string; coverUrl: string | null; rating: number | null }[];
}

interface ReadingHeatmapProps {
  year: number;
  dailyActivity: Record<string, DailyActivity>;
  onDayClick: (date: string, activity: DailyActivity) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColorClass(count: number): string {
  if (count === 0) return "bg-stone-800 hover:bg-stone-700";
  if (count === 1) return "bg-amber-900/70 hover:bg-amber-800";
  if (count === 2) return "bg-amber-700 hover:bg-amber-600";
  return "bg-amber-500 hover:bg-amber-400";
}

function getDaysInYear(year: number): { date: Date; dateKey: string }[] {
  const days: { date: Date; dateKey: string }[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push({
      date: new Date(current),
      dateKey: current.toISOString().split("T")[0],
    });
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

function getWeeks(year: number): { date: Date; dateKey: string }[][] {
  const days = getDaysInYear(year);
  const weeks: { date: Date; dateKey: string }[][] = [];
  
  // Start from the first day and pad with empty cells if needed
  const firstDay = days[0].date;
  const firstDayOfWeek = firstDay.getDay();
  
  let currentWeek: { date: Date; dateKey: string }[] = [];
  
  // Add empty cells for days before Jan 1
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), dateKey: "" });
  }
  
  days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  // Add remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
}

function getMonthLabels(year: number): { month: string; weekIndex: number }[] {
  const weeks = getWeeks(year);
  
  return weeks.reduce<{ labels: { month: string; weekIndex: number }[]; lastMonth: number }>((acc, week, weekIndex) => {
    const validDays = week.filter((d) => d.dateKey !== "");
    if (validDays.length > 0) {
      const month = validDays[0].date.getMonth();
      if (month !== acc.lastMonth) {
        acc.labels.push({ month: MONTHS[month], weekIndex });
        acc.lastMonth = month;
      }
    }
    return acc;
  }, { labels: [], lastMonth: -1 }).labels;
}

export function ReadingHeatmap({ year, dailyActivity, onDayClick }: ReadingHeatmapProps) {
  const weeks = useMemo(() => getWeeks(year), [year]);
  const monthLabels = useMemo(() => getMonthLabels(year), [year]);
  
  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const isCurrentYear = year === today.getFullYear();

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Reading Activity</h3>
      
      {/* Month labels */}
      <div className="flex mb-2 ml-10">
        <div className="flex" style={{ gap: "3px" }}>
          {weeks.map((_, weekIndex) => {
            const label = monthLabels.find((l) => l.weekIndex === weekIndex);
            return (
              <div
                key={weekIndex}
                className="w-3 text-xs text-stone-500"
                style={{ width: "13px" }}
              >
                {label?.month || ""}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex">
        {/* Day of week labels */}
        <div className="flex flex-col mr-2" style={{ gap: "3px" }}>
          {DAYS_OF_WEEK.map((day, i) => (
            <div
              key={day}
              className="text-xs text-stone-500 h-3 flex items-center"
              style={{ height: "13px" }}
            >
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: "3px" }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col" style={{ gap: "3px" }}>
              {week.map((day, dayIndex) => {
                if (day.dateKey === "") {
                  return (
                    <div
                      key={`empty-${dayIndex}`}
                      className="w-3 h-3 rounded-sm"
                      style={{ width: "13px", height: "13px" }}
                    />
                  );
                }

                const activity = dailyActivity[day.dateKey] || { count: 0, books: [] };
                const isFuture = isCurrentYear && day.dateKey > todayKey;
                const isToday = day.dateKey === todayKey;
                const formattedDate = day.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => activity.count > 0 && onDayClick(day.dateKey, activity)}
                    disabled={isFuture || activity.count === 0}
                    className={`w-3 h-3 rounded-sm transition-all duration-150 ${
                      isFuture
                        ? "bg-stone-900 cursor-not-allowed"
                        : getColorClass(activity.count)
                    } ${isToday ? "ring-1 ring-primary-400" : ""}`}
                    style={{ width: "13px", height: "13px" }}
                    title={`${formattedDate}: ${activity.count} book${activity.count !== 1 ? "s" : ""} finished`}
                    aria-label={`${formattedDate}: ${activity.count} book${activity.count !== 1 ? "s" : ""} finished`}
                  />
                );
              })}
            </div>
          ))}
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-stone-500">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-stone-800" />
          <div className="w-3 h-3 rounded-sm bg-amber-900/70" />
          <div className="w-3 h-3 rounded-sm bg-amber-700" />
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
        </div>
        <span className="text-xs text-stone-500">More</span>
      </div>
    </div>
  );
}
