import { ImportPageClient } from "./ImportPageClient";

export const metadata = {
  title: "Import from Goodreads - LitList Hub",
  description: "Import your Goodreads library to LitList Hub",
};

export default function ImportPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <ImportPageClient />
    </main>
  );
}
