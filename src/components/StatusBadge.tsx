"use client";

import { useState, useEffect } from "react";
import { BookMarked, BookOpen, CheckCircle } from "lucide-react";
import type { ReadingStatus } from "@/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
    gradient: "from-blue-500 to-blue-600",
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
    gradient: "from-accent-500 to-accent-600",
    textColor: "text-white",
    icon: CheckCircle,
  },
};

export function StatusBadge({ status, onChange, editable = false }: StatusBadgeProps) {
  const [localStatus, setLocalStatus] = useState(status);
  const [pendingStatus, setPendingStatus] = useState<ReadingStatus | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const config = statusConfig[localStatus];
  const Icon = config.icon;

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const handleChange = (newStatus: ReadingStatus) => {
    if (!onChange) return;
    
    if (status === "DONE" && newStatus !== "DONE") {
      setPendingStatus(newStatus);
      setShowConfirm(true);
      return;
    }
    
    setLocalStatus(newStatus);
    onChange(newStatus);
  };

  const confirmChange = () => {
    if (pendingStatus) {
      setLocalStatus(pendingStatus);
      onChange?.(pendingStatus);
      setPendingStatus(null);
    }
    setShowConfirm(false);
  };

  const cancelChange = () => {
    setPendingStatus(null);
    setShowConfirm(false);
  };

  if (editable && onChange) {
    return (
      <>
        <select
          value={localStatus}
          onChange={(e) => handleChange(e.target.value as ReadingStatus)}
          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r ${config.gradient} ${config.textColor} border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg [&>option]:bg-stone-800 [&>option]:text-stone-100`}
        >
          <option value="WANT_TO_READ">Want to Read</option>
          <option value="READING">Reading</option>
          <option value="DONE">Done</option>
        </select>
        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Change from Done?"
          description="Changing from Done will clear the finish date. Continue?"
          confirmLabel="Continue"
          onConfirm={confirmChange}
          cancelLabel="Cancel"
        />
      </>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r ${config.gradient} ${config.textColor} shadow-lg`}>
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      {config.label}
    </span>
  );
}
