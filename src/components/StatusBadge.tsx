"use client";

import { useState, useEffect } from "react";
import { BookMarked, BookOpen, CheckCircle } from "lucide-react";

type ReadingStatus = "WANT_TO_READ" | "READING" | "DONE";

interface StatusBadgeProps {
  status: ReadingStatus;
  onChange?: (status: ReadingStatus) => void;
  editable?: boolean;
}

const statusConfig: Record<ReadingStatus, { 
  label: string; 
  gradient: string; 
  textColor: string;
  icon: typeof BookMarked 
}> = {
  WANT_TO_READ: {
    label: "Want to Read",
    gradient: "from-violet-500 to-purple-600",
    textColor: "text-white",
    icon: BookMarked,
  },
  READING: {
    label: "Reading",
    gradient: "from-primary-500 to-primary-600",
    textColor: "text-white",
    icon: BookOpen,
  },
  DONE: {
    label: "Done",
    gradient: "from-emerald-500 to-emerald-600",
    textColor: "text-white",
    icon: CheckCircle,
  },
};

export function StatusBadge({ status, onChange, editable = false }: StatusBadgeProps) {
  const [localStatus, setLocalStatus] = useState(status);
  const config = statusConfig[localStatus];
  const Icon = config.icon;

  // Sync local status with prop when it changes
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const handleChange = (newStatus: ReadingStatus) => {
    if (!onChange) return;
    
    // Confirm when changing from DONE to another status
    if (status === "DONE" && newStatus !== "DONE") {
      const confirmed = window.confirm(
        "Changing from Done will clear the finish date. Continue?"
      );
      if (!confirmed) {
        // Reset the select to original value
        setLocalStatus(status);
        return;
      }
    }
    
    setLocalStatus(newStatus);
    onChange(newStatus);
  };

  if (editable && onChange) {
    return (
      <select
        value={localStatus}
        onChange={(e) => handleChange(e.target.value as ReadingStatus)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${config.gradient} ${config.textColor} border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg [&>option]:bg-gray-800 [&>option]:text-gray-100`}
      >
        <option value="WANT_TO_READ">Want to Read</option>
        <option value="READING">Reading</option>
        <option value="DONE">Done</option>
      </select>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${config.gradient} ${config.textColor} shadow-lg`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}
