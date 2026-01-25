import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GoalsPageClient } from "./GoalsPageClient";

export const metadata = {
  title: "Reading Goals - LitList Hub",
  description: "Set and track your reading goals",
};

export default async function GoalsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <GoalsPageClient />
    </main>
  );
}
