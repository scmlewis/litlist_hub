import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 opacity-40">
        {React.cloneElement(icon, {
          className: "w-20 h-20 text-primary-500",
        })}
      </div>
      <h3 className="text-xl font-semibold text-primary-100 mb-2">{title}</h3>
      <p className="text-primary-300 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
