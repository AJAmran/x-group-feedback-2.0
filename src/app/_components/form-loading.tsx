import Image from "next/image";

function Bone({
  className = "",
  rounded = false,
}: {
  className?: string;
  rounded?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`bg-ios-border-subtle animate-pulse ${rounded ? "rounded-full" : "rounded-(--radius-ios-sm)"} ${className}`}
    />
  );
}

function SectionLabelSkeleton() {
  return (
    <div className="flex items-center gap-3 py-1">
      <Bone className="h-3 w-28" />
      <div className="flex-1 h-px bg-ios-border-subtle" />
    </div>
  );
}

function RatingRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3.5 border-b border-ios-border-subtle last:border-b-0">
      <Bone className="h-3.5 w-20" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="h-8 w-18" />
        ))}
      </div>
    </div>
  );
}

export function FormLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-3.5 xs:px-4 sm:px-6 pb-8 sm:pb-10 relative overflow-hidden"
      aria-label="Loading feedback form…"
      aria-busy="true"
    >
      <header
        className="w-full max-w-[min(640px,100%)] mt-4 sm:mt-6"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[50px] h-[50px] shrink-0 rounded-md overflow-hidden">
              <Image
                src="/logo.png"
                alt="X Group Logo"
                width={50}
                height={50}
                priority
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Bone className="h-6 w-40 sm:w-48" />
              <Bone className="h-3 w-52 sm:w-64" />
            </div>
          </div>
          <Bone className="h-[34px] w-[72px] shrink-0" rounded />
        </div>

        <div className="mt-4">
          <Bone className="h-11 w-full" />
        </div>
      </header>

      <div className="w-full max-w-[min(640px,100%)] glass-card p-4 xs:p-5 sm:p-8 mt-5 sm:mt-6 mb-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <SectionLabelSkeleton />
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Bone className="h-3 w-24" />
                <Bone className="h-[52px] w-full" />
              </div>
              <div className="space-y-1.5">
                <Bone className="h-3 w-36" />
                <Bone className="h-[52px] w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionLabelSkeleton />
            <div className="rounded-(--radius-ios-md) border border-ios-border-subtle overflow-hidden">
              {[0, 1, 2, 3, 4].map((i) => (
                <RatingRowSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <SectionLabelSkeleton />
            <div className="space-y-2">
              <Bone className="h-3 w-44" />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <Bone key={i} className="h-10" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Bone className="h-3 w-24" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} className="h-10" />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Bone className="h-3 w-32" />
              <Bone className="h-28 w-full" />
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            <Bone className="h-13 sm:h-14 w-full" />
            <div className="flex justify-center">
              <Bone className="h-3 w-64" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Bone className="h-3 w-48" />
      </div>
    </div>
  );
}
