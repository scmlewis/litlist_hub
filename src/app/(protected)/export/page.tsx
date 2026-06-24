import { ExportPageClient } from "./ExportPageClient";

export const metadata = {
  title: "Export Data - LitList Hub",
  description: "Export your reading lists and data",
};

export default function ExportPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <ExportPageClient />
    </main>
  );
}
