import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ImportPageClient } from "./ImportPageClient";

export const metadata = {
  title: "Import from Goodreads - LitList Hub",
  description: "Import your Goodreads library to LitList Hub",
};

export default async function ImportPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ImportPageClient />
    </main>
  );
}
