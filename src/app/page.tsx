"use client";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { RatingCategory, RatingValue } from "../types";
import type { FeedbackSubmissionRequest, ApiError } from "../types";
import { Input } from "../components/Input";
import { RatingRow } from "../components/RatingRow";
import { submitFeedbackWithRetry } from "../lib/api";
import logo from "../assets/logo.png"

// Move BRANCH_MAP outside component to prevent recreation on every render
const BRANCH_MAP: Record<string, string> = {
  "X-01": "Xian Restaurant",
  "X-02": "Xenial Restaurant",
  "X-03": "Xiamen Restaurant",
  "X-04": "Golden Chimney Restaurant",
  "X-05": "Xindian Restaurant",
  "X-06": "Xinxian Restaurant, Dhanmondi",
  "X-07": "Four Seasons Restaurant, Dhanmondi",
  "X-08": "Xian Restaurant, Mirpur-10",
  "X-09": "Chung Wah Restaurant",
  "X-11": "Xinxian Restaurant, Uttara",
  "X-12": "Shimanto Convention Center",
  "X-16": "Xinxian Restaurant, Mirpur-01",
  "X-17": "Zam Zam Convention Center, Mirpur-01",
  "X-18": "Zam Zam Convention Center, Mirpur-11",
  "X-19": "Four Seasons Restaurant, Mirpur-11",
};

function FeedbackForm() {
  const [view, setView] = useState<"form" | "submitting" | "success" | "error">(
    "form"
  );
  const [error, setError] = useState<string>("");
  const [showValidation, setShowValidation] = useState(false);

  const searchParams = useSearchParams();
  const branchParam = searchParams.get("branch");
  const branchCode = branchParam ? branchParam.toUpperCase() : "X-01";
  const branchName = BRANCH_MAP[branchCode] || "X-Group Hospitality";

  const [feedbackId, setFeedbackId] = useState("");
  useEffect(() => {
    const branchPrefix = branchCode.replace("X-", "").toUpperCase() || "01";
    const random = Math.floor(1000 + Math.random() * 9000);
    setFeedbackId(`${branchPrefix}${random}`);
  }, [branchCode]);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [opinion, setOpinion] = useState("");
  const [ratings, setRatings] = useState<
    Record<RatingCategory, RatingValue | null>
  >({
    [RatingCategory.FOOD]: null,
    [RatingCategory.SERVICE]: null,
    [RatingCategory.ENVIRONMENT]: null,
    [RatingCategory.OVERALL]: null,
  });

  const handleRatingChange = useCallback(
    (category: RatingCategory, value: RatingValue) => {
      setRatings((prev) => ({ ...prev, [category]: value }));
    },
    []
  );

  const isFormValid = useMemo(
    () => name.trim().length > 0 && contact.trim().length > 0,
    [name, contact]
  );

  const handleSubmit = useCallback(async () => {
    // Show validation errors if form is invalid
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    const submittedData: FeedbackSubmissionRequest = {
      feedbackId,
      branchCode,
      branchName,
      submittedAt: new Date().toISOString(),
      guest: { name: name.trim(), contact: contact.trim() },
      ratings: {
        [RatingCategory.FOOD]: ratings[RatingCategory.FOOD] ?? null,
        [RatingCategory.SERVICE]: ratings[RatingCategory.SERVICE] ?? null,
        [RatingCategory.ENVIRONMENT]:
          ratings[RatingCategory.ENVIRONMENT] ?? null,
        [RatingCategory.OVERALL]: ratings[RatingCategory.OVERALL] ?? null,
      },
      comments: opinion.trim() || null,
    };

    setView("submitting");
    setError("");
    setShowValidation(false);

    try {
      const response = await submitFeedbackWithRetry(submittedData, 3);

      if (response.success) {
        setView("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Submission error:", err);
      const apiError = err as ApiError;
      setError(
        apiError.message || "Failed to submit feedback. Please try again."
      );
      setView("error");
    }
  }, [
    isFormValid,
    feedbackId,
    branchCode,
    branchName,
    name,
    contact,
    ratings,
    opinion,
  ]);

  if (view === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 shadow-xl shadow-[hsl(var(--brand-primary))]/10 rounded-4xl overflow-hidden p-8 text-center relative animate-[float_3s_ease-in-out_infinite]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand-600 to-brand-400" />
          <div className="flex justify-center mb-6 mt-4">
            <div className="h-24 w-24 bg-linear-to-tr from-green-50 to-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner animate-scale-in">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans">
            Thank You!
          </h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your feedback helps us create better dining experiences at{" "}
            <span className="text-brand-700 font-semibold">{branchName}</span>.
          </p>
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
              Feedback Reference
            </p>
            {feedbackId && (
              <p className="text-xl font-mono text-slate-700 tracking-wider">
                #{feedbackId}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-brand-600 text-sm hover:text-brand-800 transition-colors font-semibold py-2 shadow-md px-4 rounded-lg border border-brand-200 hover:bg-brand-50"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 shadow-xl shadow-[hsl(var(--brand-primary))]/10 rounded-4xl overflow-hidden p-8 text-center relative animate-[float_3s_ease-in-out_infinite]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500 to-orange-500" />
          <div className="flex justify-center mb-8 mt-4">
            <div className="h-24 w-24 bg-linear-to-tr from-red-50 to-orange-50 rounded-full flex items-center justify-center text-red-600 shadow-inner animate-scale-in">
              <AlertCircle size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans">
            Oops!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {error || "Something went wrong while submitting your feedback."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setView("form");
                setError("");
              }}
              className="text-slate-600 text-sm hover:text-slate-800 transition-colors font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Back to Form
            </button>
            <button
              onClick={handleSubmit}
              className="bg-linear-to-br from-[hsl(var(--brand-glow))] to-[hsl(var(--brand-primary))] text-white text-sm font-semibold py-2 px-6 rounded-lg shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-6 sm:py-10 px-4 font-sans text-slate-800 relative z-10 ">
      <div className="w-full max-w-md mb-8 sm:mb-10 animate-slide-up">
        <div className="relative pl-1">
          {/* Soft brand-colored left accent bar */}
          <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-[hsl(var(--brand-primary-light))]" />

          <div className="space-y-3 ml-4">
            {/* Main Title */}
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="X-Group Logo"
                width={64}
                height={64}
                className="h-16 w-auto object-contain drop-shadow-lg"
                priority
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-800">
                  Guest{" "}
                  <span className="font-semibold text-[hsl(var(--brand-primary))]">
                    Feedback
                  </span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Your experience matters — help us improve.
                </p>
              </div>
            </div>

            {/* Branch pill */}
            <div className="inline-flex items-center gap-1.5 bg-[hsl(var(--brand-primary)/0.07)] border border-[hsl(var(--brand-primary)/0.15)] px-3 py-1.5 rounded-full text-[hsl(var(--brand-primary))] w-fit shadow-sm">
              <MapPin size={14} strokeWidth={2.2} />
              <span className="text-xs font-semibold tracking-wide uppercase">
                {branchName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 shadow-xl shadow-[hsl(var(--brand-primary))]/10 rounded-[2.5rem] p-6 sm:p-8 animate-[slide-up_0.6s_ease-out] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[hsl(var(--brand-primary))]/20 transition-all duration-300">
        <section className="space-y-6 mb-10">
          <Input
            label="Guest Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showValidation && e.target.value.trim())
                setShowValidation(false);
            }}
            required
            autoComplete="name"
            error={showValidation && !name.trim()}
          />
          <Input
            label="Contact (Mobile/Email)"
            placeholder="Contact number or email"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (showValidation && e.target.value.trim())
                setShowValidation(false);
            }}
            required
            autoComplete="email"
            error={showValidation && !contact.trim()}
          />
        </section>
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Sparkles size={12} className="text-brand-400" />
              Rate Your Experience
            </h3>
            {/* <span className="text-[9px] font-bold text-brand-600/70 bg-brand-50 px-1.5 py-0.5 rounded-md tracking-wider">OPTIONAL</span> */}
          </div>
          <div className="space-y-1.5 glass-input rounded-2xl p-2">
            {Object.values(RatingCategory).map((cat) => (
              <RatingRow
                key={cat}
                category={cat}
                value={ratings[cat]}
                onChange={handleRatingChange}
              />
            ))}
          </div>
        </section>
        <section className="mb-8">
          <Input
            label="Valuable Opinion"
            isTextArea
            placeholder="Any compliments or suggestions?"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
          />
        </section>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || view === "submitting"}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2.5 relative overflow-hidden group ${
            isFormValid
              ? "bg-linear-to-br from-[hsl(var(--brand-glow))] to-[hsl(var(--brand-primary))] text-white shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {view === "submitting" ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Feedback</span>
              <ChevronRight
                size={22}
                strokeWidth={3}
                className={`transition-transform duration-300 ${
                  isFormValid ? "group-hover:translate-x-1" : ""
                }`}
              />
            </>
          )}
        </button>
        <div className="mt-6 text-center">
          {feedbackId && (
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Secure Form • ID: {branchCode}-{feedbackId}
            </p>
          )}
        </div>
      </div>
      <footer className="mt-6 mb-2 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          X-Group Hospitality Systems © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-600" size={48} />
        </div>
      }
    >
      <FeedbackForm />
    </Suspense>
  );
}
