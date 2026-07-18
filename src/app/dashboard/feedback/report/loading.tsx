import { Bone } from "../../../_components/skeleton";

export default function FeedbackReportLoading() {
  return (
    <div className="space-y-6 pb-8">
      <Bone className="h-6 w-48" />
      <Bone className="h-4 w-72" />

      <div className="glass-card rounded-3xl p-6">
        <Bone className="h-64 w-full" />
      </div>
    </div>
  );
}
