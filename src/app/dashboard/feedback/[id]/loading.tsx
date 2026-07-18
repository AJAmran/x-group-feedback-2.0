import { Bone } from "../../../_components/skeleton";

export default function FeedbackDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <Bone className="h-4 w-24" />

      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Bone className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Bone className="h-6 w-40" />
            <Bone className="h-4 w-56" />
          </div>
          <Bone className="h-8 w-20 rounded-lg" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bone key={i} className="h-4 w-full" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Bone className="h-3 w-24 mb-2" />
              <Bone className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <Bone className="h-5 w-32 mb-4" />
        <Bone className="h-4 w-3/4 mb-2" />
        <Bone className="h-4 w-1/2" />
      </div>
    </div>
  );
}
