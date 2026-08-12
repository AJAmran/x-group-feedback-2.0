import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { getCurrentUserAction } from "@/features/auth/actions";
import { SettingsEditor } from "./settings-editor";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function SettingsPage() {
  const user = await getCurrentUserAction();
  if (user?.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage system-wide configuration (Super Admin only)"
      />
      <SettingsEditor />
    </div>
  );
}