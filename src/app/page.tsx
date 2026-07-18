import { Suspense } from "react";
import { fetchActiveBranches } from "@/lib/api";
import { FeedbackPageShell } from "@/components/FeedbackPageShell";
import Loading from "./loading";

// Server Component — no "use client". Runs on the server at request time.
export default async function Home() {
  // Fetch branches directly on the server — no useEffect waterfall.
  // This data arrives pre-filled in the initial HTML.
  const initialBranches = await fetchActiveBranches();

  return (
    // Suspense delegates its fallback to loading.tsx (the skeleton).
    // The <Loading /> import here is a type-safe reference; Next.js also
    // auto-serves app/loading.tsx for the route segment automatically.
    <Suspense fallback={<Loading />}>
      <FeedbackPageShell initialBranches={initialBranches} />
    </Suspense>
  );
}
