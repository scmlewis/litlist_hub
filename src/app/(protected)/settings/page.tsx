import { auth } from "@/lib/auth";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  const session = await auth();

  return <SettingsPageClient user={session!.user} />;
}
