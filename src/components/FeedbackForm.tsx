import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import { Loader2, Send, Lock } from "lucide-react";
import { Input } from "./Input";
import { RatingRow } from "./RatingRow";
import { SuccessView } from "./SuccessView";
import { ErrorView } from "./ErrorView";
import { FormSection } from "./ui/FormSection";
import { SelectionGrid } from "./ui/SelectionGrid";
import { RatingCategory } from "../types";
import { useFeedbackForm } from "../hooks/useFeedbackForm";
import { APP_CONFIG } from "../lib/config";
import { AGE_GROUPS, SOURCES } from "../lib/constants";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// Section divider — only used because this form
// is a genuine three-step sequence (who / what / context).
// ─────────────────────────────────────────────
function SectionDivider({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-ios-primary/10 ring-1 ring-ios-primary/20 shrink-0">
        <span className="text-micro font-black text-ios-primary tracking-wide leading-none">
          {number}
        </span>
      </div>
      <span className="text-caption font-bold uppercase tracking-[0.14em] text-ios-foreground-subtle">
        {label}
      </span>
      <div className="flex-1 h-px bg-ios-border-subtle" />
    </div>
  );
}

export function FeedbackForm() {
  const {
    view,
    error,
    feedbackId,
    branchCode,
    branchName,
    ratings,
    handleRatingChange,
    onSubmitWrapper,
    resetForm,
    register,
    errors,
    contactStatus,
    contactShowError,
    sourceValue,
    ageGroupValue,
    setFieldValue,
  } = useFeedbackForm();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  if (view === "success") {
    return (
      <SuccessView
        branchName={branchName}
        feedbackId={feedbackId}
        onClose={() => window.location.reload()}
      />
    );
  }

  if (view === "error") {
    return (
      <ErrorView error={error} onRetry={onSubmitWrapper} onBack={resetForm} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-10 pt-[calc(var(--safe-top)+1rem)] sm:px-6 relative overflow-hidden">
      {/* ── Header — compact inline layout ── */}
      <header
        className="w-full max-w-[min(640px,100%)] mb-8 flex flex-col items-center gap-5"
        aria-label="Form header"
      >
        <motion.div
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="flex items-center gap-4"
        >
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-ios-primary/20 blur-2xl rounded-full opacity-60 pointer-events-none" />
            <Image
              src={logo}
              alt="X-Group Logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain relative drop-shadow-xl active:scale-95 transition-transform"
              priority
              fetchPriority="high"
            />
          </div>

          {/* Title block */}
          <div className="text-left">
            <h1
              id="form-heading"
              className="text-display font-extrabold tracking-tight text-ios-foreground leading-snug"
            >
              {APP_CONFIG.FEEDBACK.TITLE_PREFIX}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-ios-primary to-ios-accent">
                {APP_CONFIG.FEEDBACK.TITLE_SUFFIX}
              </span>
            </h1>
            <p className="text-subtitle text-ios-foreground-muted font-medium mt-0.5 tracking-wide">
              {APP_CONFIG.FEEDBACK.SUBTITLE}
            </p>
          </div>
        </motion.div>

        {/* Location badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.14, type: "spring", stiffness: 260, damping: 22 }}
          role="status"
          aria-label={`Selected location: ${branchName}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass text-label font-semibold text-ios-foreground tracking-wide shadow-sm"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ios-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ios-primary" />
          </span>
          {branchName}
        </motion.div>
      </header>

      {/* ── Form card ── */}
      <motion.div
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.08 }}
        className="w-full max-w-[min(640px,100%)] glass-card p-5 sm:p-8 relative mb-8 rounded-[2rem] overflow-visible"
      >
        {/* Ambient glows */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-ios-primary/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-ios-accent/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Required fields note */}
        <p className="text-caption font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle mb-7 px-0.5">
          Fields marked{" "}
          <span className="text-ios-primary font-black">*</span> are required
        </p>

        <form
          className="space-y-8 relative z-10"
          aria-labelledby="form-heading"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* ── 01 · Guest Information ── */}
          <div className="space-y-5">
            <SectionDivider number="01" label="Guest Information" />
            <div className="space-y-4">
              <Input
                label={APP_CONFIG.FORM.LABELS.GUEST_NAME}
                placeholder={APP_CONFIG.FORM.PLACEHOLDERS.GUEST_NAME}
                required
                autoFocus
                autoComplete="name"
                error={!!errors.name}
                errorMessage={errors.name?.message as string | undefined}
                helperText="Helps us personalise our response"
                {...register("name")}
              />
              <Input
                label={APP_CONFIG.FORM.LABELS.CONTACT}
                placeholder={APP_CONFIG.FORM.PLACEHOLDERS.CONTACT}
                required
                autoComplete="email"
                error={contactShowError}
                errorMessage={errors.contact?.message as string | undefined}
                helperText="Email or phone — never shared externally"
                validationStatus={contactStatus}
                {...register("contact")}
              />
            </div>
          </div>

          {/* ── 02 · Rate Your Visit ── */}
          <div className="space-y-4">
            <SectionDivider number="02" label="Rate Your Visit" />
            <div className="liquid-glass rounded-2xl p-1.5 space-y-1">
              {Object.values(RatingCategory).map((cat) => (
                <RatingRow
                  key={cat}
                  category={cat}
                  value={ratings[cat]}
                  onChange={handleRatingChange}
                />
              ))}
            </div>
          </div>

          {/* ── 03 · Tell Us More ── */}
          <div className="space-y-6">
            <SectionDivider number="03" label="Tell Us More" />

            <FormSection title={APP_CONFIG.FORM.LABELS.SOURCE} id="source-label">
              <SelectionGrid
                options={SOURCES}
                selectedValue={(sourceValue as string) || null}
                onChange={(val: string) =>
                  setFieldValue("source", val as import("../types").Source)
                }
                gridColsClass="grid-cols-1 sm:grid-cols-3"
                labelSize="sm"
                aria-labelledby="source-label"
              />
            </FormSection>

            <FormSection title={APP_CONFIG.FORM.LABELS.AGE_GROUP} id="age-label">
              <SelectionGrid
                options={AGE_GROUPS}
                selectedValue={(ageGroupValue as string) || null}
                onChange={(val: string) =>
                  setFieldValue("ageGroup", val as import("../types").AgeGroup)
                }
                gridColsClass="grid-cols-2 sm:grid-cols-4"
                labelSize="xs"
                aria-labelledby="age-label"
              />
            </FormSection>

            <Input
              label={APP_CONFIG.FORM.LABELS.OPINION}
              isTextArea
              placeholder={APP_CONFIG.FORM.PLACEHOLDERS.OPINION}
              maxCharCount={500}
              helperText="Optional — any additional thoughts you'd like to share"
              {...register("opinion")}
            />
          </div>

          {/* ── Submit ── */}
          <div className="space-y-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSubmitWrapper}
              disabled={view === "submitting"}
              className="btn-ios w-full h-16 text-body relative overflow-hidden group shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={
                view === "submitting"
                  ? "Submitting your feedback…"
                  : "Submit your feedback"
              }
            >
              <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none" />

              <AnimatePresence mode="wait">
                {view === "submitting" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 relative z-10"
                  >
                    <Loader2 className="animate-spin" size={18} aria-hidden />
                    <span className="font-bold">{APP_CONFIG.FORM.BUTTONS.SUBMITTING}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 w-full relative z-10"
                  >
                    <span className="font-extrabold tracking-tight">
                      {APP_CONFIG.FORM.BUTTONS.SUBMIT}
                    </span>
                    <Send
                      size={18}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      aria-hidden
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shine on hover */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
            </motion.button>

            {/* Privacy assurance — builds trust without being heavy */}
            <div className="flex items-center justify-center gap-1.5 text-caption font-semibold text-ios-foreground-faint tracking-wide">
              <Lock size={9} aria-hidden />
              <span>Your feedback is encrypted and kept strictly confidential</span>
            </div>

            {/* Reference ID (shown after first attempt if feedbackId exists) */}
            {feedbackId && (
              <div className="text-center">
                <span className="text-micro font-bold uppercase tracking-[0.2em] text-ios-foreground-subtle bg-ios-border-subtle px-4 py-1.5 rounded-full ring-1 ring-ios-border">
                  {APP_CONFIG.FEEDBACK.SECURE_BADGE} · Ref: {branchCode}-{feedbackId}
                </span>
              </div>
            )}
          </div>
        </form>
      </motion.div>

      <footer className="mt-8 mb-6 text-center text-caption font-bold uppercase tracking-[0.15em] text-ios-foreground-faint">
        {APP_CONFIG.COMPANY_NAME} &copy; {new Date().getFullYear()}
      </footer>

      {/* iOS home-indicator mimic */}
      <div className="flex justify-center w-full pb-3 pointer-events-none">
        <div className="w-28 h-[4px] bg-ios-border rounded-full" />
      </div>
    </div>
  );
}
