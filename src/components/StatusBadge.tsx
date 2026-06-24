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
  bg: string; 
  text: string;
  icon: typeof BookMarked 
}> = {
  WANT_TO_READ: {
    label: "Want to Read",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: BookMarked,
  },
  READING: {
    label: "Reading",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: BookOpen,
  },
  DONE: {
    label: "Done",
    bg: "bg-muted",
    text: "text-muted-foreground",
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
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border border-border cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200`}
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
