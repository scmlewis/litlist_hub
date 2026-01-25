import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ExportPageClient } from "./ExportPageClient";

export const metadata = {
  title: "Export Data - LitList Hub",
  description: "Export your reading lists and data",
};

export default async function ExportPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ExportPageClient />
    </main>
  );
}
