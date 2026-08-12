/** Centralized dashboard route labels for breadcrumbs & page headers. */
export const DASHBOARD_ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Executive Overview",
  "/dashboard/feedback": "Feedback Management",
  "/dashboard/analytics": "Analytics",
  "/dashboard/reports": "Reports",
  "/dashboard/branches": "Branch Performance",
  "/dashboard/users": "User Management",
  "/dashboard/settings": "Settings",
  "/dashboard/manager-report": "Manager Reports",
  "/dashboard/guest-offers": "Guest Offers",
  "/dashboard/inventory": "Inventory",
};

/** Resolve breadcrumb segments from a pathname. */
export function getBreadcrumbSegments(pathname: string): { label: string; href?: string }[] {
  const segments: { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  if (pathname === "/dashboard") return segments;

  const exact = DASHBOARD_ROUTE_LABELS[pathname];
  if (exact) {
    segments.push({ label: exact });
    return segments;
  }

  // Nested routes: feedback detail, feedback report
  if (pathname.startsWith("/dashboard/feedback/report")) {
    segments.push({ label: "Feedback Management", href: "/dashboard/feedback" });
    segments.push({ label: "Report" });
    return segments;
  }
  if (pathname.startsWith("/dashboard/feedback/")) {
    segments.push({ label: "Feedback Management", href: "/dashboard/feedback" });
    segments.push({ label: "Details" });
    return segments;
  }

  // Fallback: match longest prefix
  const matched = Object.entries(DASHBOARD_ROUTE_LABELS)
    .filter(([path]) => path !== "/dashboard" && pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (matched) {
    segments.push({ label: matched[1] });
  } else {
    segments.push({ label: "Page" });
  }

  return segments;
}
