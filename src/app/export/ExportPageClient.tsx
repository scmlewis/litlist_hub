"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Download, FileJson, FileText, Loader2, CheckCircle } from "lucide-react";

type ExportFormat = "json" | "csv" | "goodreads";

export function ExportPageClient() {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exported, setExported] = useState<ExportFormat | null>(null);
  const { showToast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    setExported(null);

    try {
      const response = await fetch(`/api/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `litlist-export.${format === "json" ? "json" : "csv"}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExported(format);
      showToast("success", `Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      showToast("error", "Failed to export data");
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      format: "json" as ExportFormat,
      title: "JSON Export",
      description: "Complete data export with all details. Best for backups and data portability.",
      icon: FileJson,
      color: "text-blue-400",
      bgColor: "bg-blue-900/30",
      borderColor: "border-blue-800/50",
    },
    {
      format: "csv" as ExportFormat,
      title: "CSV Export",
      description: "Spreadsheet-compatible format. Good for viewing in Excel or Google Sheets.",
      icon: FileText,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/30",
      borderColor: "border-emerald-800/50",
    },
    {
      format: "goodreads" as ExportFormat,
      title: "Goodreads Format",
      description: "Compatible with Goodreads import. Transfer your library to other platforms.",
      icon: FileText,
      color: "text-amber-400",
      bgColor: "bg-amber-900/30",
      borderColor: "border-amber-800/50",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-xl opacity-30" />
          <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl">
            <Download className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Export Your Data</h1>
        <p className="text-gray-400">
          Download your reading lists, progress, and statistics
        </p>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isLoading = isExporting === option.format;
          const isComplete = exported === option.format;

          return (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting !== null}
              className={`w-full p-6 glass-card rounded-2xl text-left transition-all duration-200 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border ${option.borderColor}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${option.bgColor}`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : isComplete ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Download className={`w-6 h-6 ${option.color}`} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-8 p-6 glass-card rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">📦 What&apos;s Included</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            All your reading lists and their books
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            Reading status (Want to Read, Reading, Done)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            Your ratings, notes, and reviews
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            Reading progress and dates
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            Reading goals (JSON format only)
          </li>
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
        <p className="text-sm text-blue-300">
          <strong>Privacy:</strong> Your data is yours. Downloads are processed 
          locally and we don&apos;t store copies of your exports.
        </p>
      </div>
    </div>
  );
}
