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
      className="glass-card rounded-xl p-4 border-accent-500 border-2 sticky top-20 z-10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-accent-500" />
          <span className="font-semibold text-primary-100">
            {selectedCount} book{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Set Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary-700 text-primary-300 hover:text-primary-200"
              >
                Set Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-primary-700">
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

          {/* Set Rating */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary-700 text-primary-300 hover:text-primary-200"
              >
                <Star className="w-4 h-4 mr-1" />
                Rate
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-primary-700">
              {[5, 4, 3, 2, 1].map((rating) => (
                <DropdownMenuItem key={rating} onClick={() => onSetRating(rating)}>
                  {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          {/* Cancel */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-primary-400 hover:text-primary-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
