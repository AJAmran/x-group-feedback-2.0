"use server";

import { authenticatedFetch } from "@/features/auth/actions";

export async function getSettingsAction(): Promise<Record<string, string>> {
  try {
    const res = await authenticatedFetch("/api/v1/settings");
    if (!res.ok) return {};
    const json = await res.json();
    return json.data ?? {};
  } catch {
    return {};
  }
}

export async function updateSettingsAction(
  settings: Record<string, string>,
): Promise<{ success: boolean; data?: Record<string, string>; error?: string }> {
  try {
    const res = await authenticatedFetch("/api/v1/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.message || "Failed to update settings" };
    }

    return { success: true, data: json.data ?? {} };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings",
    };
  }
}
