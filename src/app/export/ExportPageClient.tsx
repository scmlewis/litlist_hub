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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      format: "csv" as ExportFormat,
      title: "CSV Export",
      description: "Spreadsheet-compatible format. Good for viewing in Excel or Google Sheets.",
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      format: "goodreads" as ExportFormat,
      title: "Goodreads Format",
      description: "Compatible with Goodreads import. Transfer your library to other platforms.",
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="relative p-4 bg-emerald-500 rounded-2xl">
            <Download className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Export Your Data</h1>
        <p className="text-muted-foreground">
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
              className={`w-full p-6 bg-white border border-border rounded-xl shadow-elevation-1 rounded-2xl text-left transition-all duration-200 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${option.bgColor}`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : isComplete ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
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
      <div className="mt-8 p-6 bg-white border border-border rounded-xl shadow-elevation-1 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">📦 What&apos;s Included</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            All your reading lists and their books
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            Reading status (Want to Read, Reading, Done)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            Your ratings, notes, and reviews
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            Reading progress and dates
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            Reading goals (JSON format only)
          </li>
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700">
          <strong>Privacy:</strong> Your data is yours. Downloads are processed 
          locally and we don&apos;t store copies of your exports.
        </p>
      </div>
    </div>
  );
}