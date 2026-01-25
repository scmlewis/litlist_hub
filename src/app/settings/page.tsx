import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <SettingsPageClient user={session.user} />;
}
