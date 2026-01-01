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
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.03)] via-transparent to-[hsl(var(--brand-primary)/0.06)]" />
        <div className="h-16 w-16 glass-card rounded-2xl flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      </div>
    ),
    ssr: false, // Client-heavy form, can skip SSR if preferred for speed, or keep true if SEO matters for the form content. Given it's a feedback form, likely not critical for SEO indexing of the form fields themselves. False makes TTI faster sometimes.
  }
);

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.03)] via-transparent to-[hsl(var(--brand-primary)/0.06)]" />
          <div className="h-16 w-16 glass-card rounded-2xl flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FeedbackForm />
      </motion.div>
    </Suspense>
  );
}
