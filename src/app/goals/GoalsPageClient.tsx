"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { 
  Target, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Check,
  X
} from "lucide-react";

interface Goal {
  id: string;
  year: number;
  target: number;
}

export function GoalsPageClient() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [goal, setGoal] = useState<Goal | null>(null);
  const [booksRead, setBooksRead] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(12);
  const { showToast } = useToast();

  useEffect(() => {
    fetchGoal();
  }, [year]);

  const fetchGoal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setGoal(data.goal);
        setBooksRead(data.booksRead);
        if (data.goal) {
          setEditTarget(data.goal.target);
        }
      }
    } catch (error) {
      console.error("Failed to fetch goal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoal = async () => {
    if (editTarget < 1) {
      showToast("error", "Goal must be at least 1 book");
      return;
    }

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, target: editTarget }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoal(data.goal);
        setIsEditing(false);
        showToast("success", `Goal set: ${editTarget} books in ${year}`);
      }
    } catch {
      showToast("error", "Failed to save goal");
    }
  };

  const progress = goal ? Math.min((booksRead / goal.target) * 100, 100) : 0;
  const isComplete = goal && booksRead >= goal.target;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-xl opacity-30" />
          <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Reading Goals</h1>
        <p className="text-stone-400">Set and track your reading targets</p>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setYear(year - 1)}
          className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold text-white min-w-[100px] text-center">
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= new Date().getFullYear() + 1}
          className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-pulse">
            <div className="h-32 w-32 mx-auto bg-stone-700 rounded-full mb-4" />
            <div className="h-6 w-48 mx-auto bg-stone-700 rounded mb-2" />
            <div className="h-4 w-32 mx-auto bg-stone-700 rounded" />
          </div>
        </div>
      ) : goal ? (
        <div className="glass-card rounded-2xl p-8">
          {/* Progress Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-stone-700"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * progress) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5a2b" />
                  <stop offset="100%" stopColor="#b87333" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isComplete ? (
                <>
                  <Trophy className="w-10 h-10 text-primary-400 mb-1" />
                  <span className="text-sm text-primary-400 font-medium">Complete!</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold text-white">{booksRead}</span>
                  <span className="text-stone-400">of {goal.target}</span>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <p className="text-lg text-stone-300">
              {isComplete ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  Congratulations! You reached your goal!
                  <Sparkles className="w-5 h-5 text-primary-400" />
                </span>
              ) : (
                <>
                  <span className="text-white font-semibold">{goal.target - booksRead}</span>
                  {" "}more book{goal.target - booksRead !== 1 ? "s" : ""} to reach your goal
                </>
              )}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Edit Goal */}
          {isEditing ? (
            <div className="flex items-center justify-center gap-3">
              <label className="text-stone-300">Target:</label>
              <input
                type="number"
                min={1}
                max={365}
                value={editTarget}
                onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 bg-stone-700 border border-stone-600 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-stone-300">books</span>
              <button
                onClick={saveGoal}
                className="p-2 text-primary-400 hover:bg-primary-900/30 rounded-xl transition-colors cursor-pointer"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTarget(goal.target);
                }}
                className="p-2 text-stone-400 hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mx-auto flex items-center gap-2 px-4 py-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Goal
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-xl opacity-30" />
            <div className="relative p-5 bg-gradient-to-br from-primary-900/50 to-primary-800/50 rounded-full">
              <BookOpen className="w-10 h-10 text-primary-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No goal set for {year}</h3>
          <p className="text-stone-400 mb-6">
            Set a reading goal to track your progress throughout the year
          </p>

          {isEditing ? (
            <div className="flex items-center justify-center gap-3">
              <label className="text-stone-300">I want to read</label>
              <input
                type="number"
                min={1}
                max={365}
                value={editTarget}
                onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 bg-stone-700 border border-stone-600 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-stone-300">books</span>
              <button
                onClick={saveGoal}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-colors cursor-pointer"
              >
                Set Goal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer"
            >
              <Target className="w-5 h-5" />
              Set a Goal
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-6 glass-card rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">📚 Reading Tips</h3>
        <ul className="space-y-2 text-stone-400">
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            Start with a realistic goal - 1-2 books per month is a great start
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            Track your progress by marking books as &quot;Done&quot; with a finish date
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            Mix shorter and longer books to keep momentum
          </li>
        </ul>
      </div>
    </div>
  );
}
