import { StatsPageClient } from "./StatsPageClient";

export const metadata = {
  title: "Reading Statistics - LitList Hub",
  description: "View your reading statistics and progress",
};

export default function StatsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <StatsPageClient />
    </main>
  );
}
