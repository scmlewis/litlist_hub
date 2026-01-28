"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["Ctrl/Cmd", "K"], description: "Open search" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modals / Clear selection" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["J"], description: "Next book" },
      { keys: ["K"], description: "Previous book" },
      { keys: ["Enter"], description: "Expand/Open book" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["E"], description: "Edit book details" },
      { keys: ["D"], description: "Delete book" },
      { keys: ["R"], description: "Rate book" },
      { keys: ["Space"], description: "Select/Deselect (multi-select mode)" },
    ],
  },
  {
    title: "Bulk Operations",
    shortcuts: [
      { keys: ["Ctrl/Cmd", "A"], description: "Select all books" },
      { keys: ["Shift", "Click"], description: "Range select" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary-700 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-accent-500" />
            <DialogTitle className="text-2xl font-semibold text-primary-100">
              Keyboard Shortcuts
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="grid gap-6 mt-4 max-h-[60vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-lg font-semibold text-primary-200 mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-primary-950/50 transition-colors"
                  >
                    <span className="text-primary-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-primary-100 bg-primary-900 border border-primary-700 rounded shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
