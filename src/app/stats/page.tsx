import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StatsPageClient } from "./StatsPageClient";

export const metadata = {
  title: "Reading Statistics - LitList Hub",
  description: "View your reading statistics and progress",
};

export default async function StatsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <StatsPageClient />
    </main>
  );
}
