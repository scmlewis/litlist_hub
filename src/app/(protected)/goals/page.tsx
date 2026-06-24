import { GoalsPageClient } from "./GoalsPageClient";

export const metadata = {
  title: "Reading Goals - LitList Hub",
  description: "Set and track your reading goals",
};

export default function GoalsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <GoalsPageClient />
    </main>
  );
}
