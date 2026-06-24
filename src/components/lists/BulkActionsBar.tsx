"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, Star, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onSetStatus: (status: string) => Promise<void>;
  onSetRating: (rating: number) => Promise<void>;
  onCancel: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onSetStatus,
  onSetRating,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border-2 border-primary rounded-xl p-4 shadow-elevation-2 sticky top-20 z-10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">
            {selectedCount} book{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Set Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSetStatus("WANT_TO_READ")}>
                Want to Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetStatus("READING")}>
                Reading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetStatus("DONE")}>
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-1" />
                Rate
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[5, 4, 3, 2, 1].map((rating) => (
                <DropdownMenuItem key={rating} onClick={() => onSetRating(rating)}>
                  {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
