"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";

const FeedbackForm = dynamic(
  () => import("../components/FeedbackForm").then((mod) => mod.FeedbackForm),
  {
    loading: () => (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-ios-primary/6 via-transparent to-ios-accent/8" />
        <div className="h-16 w-16 glass-card rounded-2xl flex items-center justify-center">
          <Loader2 className="animate-spin text-ios-primary" size={32} />
        </div>
      </div>
    ),
    ssr: true,
  }
);

export default function Home() {
  return (
    <Suspense
      fallback={
          <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-ios-primary/6 via-transparent to-ios-accent/8" />
          <div className="h-16 w-16 glass-card rounded-2xl flex items-center justify-center">
            <Loader2 className="animate-spin text-ios-primary" size={32} />
          </div>
        </div>
      }
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FeedbackForm />
      </motion.div>
    </Suspense>
  );
}
