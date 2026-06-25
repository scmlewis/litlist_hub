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

  useEffect(() => {
    fetchGoal();
  }, [year]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="relative p-4 bg-primary text-primary-foreground rounded-2xl">
            <Target className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reading Goals</h1>
        <p className="text-muted-foreground">Set and track your reading targets</p>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setYear(year - 1)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold text-foreground min-w-[100px] text-center">
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= new Date().getFullYear() + 1}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-32 w-32 mx-auto bg-muted rounded-full mb-4" />
            <div className="h-6 w-48 mx-auto bg-muted rounded mb-2" />
            <div className="h-4 w-32 mx-auto bg-muted rounded" />
          </div>
        </div>
      ) : goal ? (
        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-8">
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
                className="text-muted"
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
                  <Trophy className="w-10 h-10 text-primary mb-1" />
                  <span className="text-sm text-primary font-medium">Complete!</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold text-foreground">{booksRead}</span>
                  <span className="text-muted-foreground">of {goal.target}</span>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground">
              {isComplete ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Congratulations! You reached your goal!
                  <Sparkles className="w-5 h-5 text-primary" />
                </span>
              ) : (
                <>
                  <span className="text-foreground font-semibold">{goal.target - booksRead}</span>
                  {" "}more book{goal.target - booksRead !== 1 ? "s" : ""} to reach your goal
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Edit Goal */}
          {isEditing ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="text-foreground">Target:</label>
              <input
                type="number"
                min={1}
                max={365}
                value={editTarget}
                onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2.5 bg-muted border border-border rounded-xl text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-foreground">books</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveGoal}
                  className="p-2.5 text-tertiary hover:bg-accent rounded-xl transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTarget(goal.target);
                  }}
                  className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mx-auto flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Goal
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="relative p-5 bg-muted rounded-full">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No goal set for {year}</h3>
          <p className="text-muted-foreground mb-6">
            Set a reading goal to track your progress throughout the year
          </p>

          {isEditing ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="text-foreground">I want to read</label>
              <input
                type="number"
                min={1}
                max={365}
                value={editTarget}
                onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2.5 bg-muted border border-border rounded-xl text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-foreground">books</span>
              <button
                onClick={saveGoal}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-elevation-1 hover:shadow-elevation-2 transition-all"
              >
                Set Goal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200"
            >
              <Target className="w-5 h-5" />
              Set a Goal
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-6 bg-card border border-border rounded-xl shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4">📚 Reading Tips</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Start with a realistic goal - 1-2 books per month is a great start
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Track your progress by marking books as &quot;Done&quot; with a finish date
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Mix shorter and longer books to keep momentum
          </li>
        </ul>
      </div>
    </div>
  );
}
