import { Suspense } from "react";
import { fetchActiveBranches } from "@/lib/api";
import { FeedbackPageShell } from "@/components/FeedbackPageShell";
import { FormLoading } from "./_components/form-loading";

export default async function Home() {
  const initialBranches = await fetchActiveBranches();

  return (
    <Suspense fallback={<FormLoading />}>
      <FeedbackPageShell initialBranches={initialBranches} />
    </Suspense>
  );
}
