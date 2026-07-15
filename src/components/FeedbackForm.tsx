import React, { useSyncExternalStore } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { Input } from "./Input";
import { RatingRow } from "./RatingRow";
import { SuccessView } from "./SuccessView";
import { ErrorView } from "./ErrorView";
import { FormSection } from "./ui/FormSection";
import { SelectionGrid } from "./ui/SelectionGrid";
import { ThemeToggle } from "./ThemeToggle";
import { RatingCategory } from "../types";
import { useFeedbackForm } from "../hooks/useFeedbackForm";
import { APP_CONFIG } from "../lib/config";
import { AGE_GROUPS, SOURCES } from "../lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─────────────────────────────────────────────
// Section label — a quiet eyebrow + rule. No numbering:
// the three sections aren't a workflow the guest steps
// through, so a sequence marker would claim an order
// that isn't actually meaningful here.
// ─────────────────────────────────────────────
const SectionLabel = React.memo(function SectionLabel({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="font-display text-caption font-semibold tracking-[0.16em] uppercase text-ios-primary shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-ios-border-subtle" />
    </div>
  );
});

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

  // const sealInitial = (branchCode || "X").replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase() || "X";

  return (
    <div className="min-h-screen flex flex-col items-center px-3.5 xs:px-4 sm:px-6 pb-8 sm:pb-10 relative overflow-hidden">
      {/* ── Letterhead ── */}
      <header
        className="w-full max-w-[min(640px,100%)] mt-4 sm:mt-6"
        style={{ paddingTop: "var(--safe-top)" }}
        aria-label="Form header"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white w-11 h-11 sm:w-12 sm:h-12 text-base sm:text-lg font-semibold shrink-0">
              {/* {sealInitial} */}
              <Image
                src="/logo.png"
                alt="X Group Logo"
                width={50}
                height={50}
              />
            </div>
            <div className="min-w-0">
              <h1
                id="form-heading"
                className="font-display text-display font-semibold tracking-tight text-ios-foreground leading-none"
              >
                {APP_CONFIG.FEEDBACK.TITLE_PREFIX}{" "}
                <span className="text-ios-primary">{APP_CONFIG.FEEDBACK.TITLE_SUFFIX}</span>
              </h1>
              <p className="text-caption text-ios-foreground-muted font-medium mt-1 tracking-wide truncate">
                {APP_CONFIG.FEEDBACK.SUBTITLE}
              </p>
            </div>
          </div>

          <ThemeToggle className="mt-0.5" />
        </div>

        {/* Location — a ticket-stub tag, not a live-status pill */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          role="status"
          aria-label={`Selected location: ${branchName}`}
          className="mt-4 flex items-center gap-2.5 py-2.5 px-3.5 rounded-[var(--radius-ios-sm)] border border-dashed border-ios-border bg-surface-100"
        >
          <span className="w-1.5 h-1.5 rotate-45 bg-ios-accent shrink-0" aria-hidden="true" />
          <span className="text-caption sm:text-label font-mono font-semibold text-ios-foreground truncate">
            {branchName}
          </span>
          {branchCode && (
            <span className="ml-auto text-micro font-mono font-bold text-ios-foreground-faint tracking-wider shrink-0">
              REF {branchCode}
            </span>
          )}
        </motion.div>
      </header>

      {/* ── Form card ── */}
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay: 0.1 }}
        className="w-full max-w-[min(640px,100%)] glass-card p-4 xs:p-5 sm:p-8 mt-5 sm:mt-6 mb-8"
      >
        <form
          className="space-y-6 sm:space-y-8"
          aria-labelledby="form-heading"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* ── Guest Information ── */}
          <div className="space-y-4">
            <SectionLabel label="Guest Information" />
            <div className="space-y-3.5">
              <Input
                label={APP_CONFIG.FORM.LABELS.GUEST_NAME}
                placeholder={APP_CONFIG.FORM.PLACEHOLDERS.GUEST_NAME}
                required
                autoFocus
                autoComplete="name"
                error={!!errors.name}
                errorMessage={errors.name?.message as string | undefined}
                {...register("name")}
              />
              <Input
                label={APP_CONFIG.FORM.LABELS.CONTACT}
                placeholder={APP_CONFIG.FORM.PLACEHOLDERS.CONTACT}
                required
                autoComplete="email"
                error={contactShowError}
                errorMessage={errors.contact?.message as string | undefined}
                validationStatus={contactStatus}
                {...register("contact")}
              />
            </div>
          </div>

          {/* ── Rate Your Visit ── */}
          <div className="space-y-4">
            <SectionLabel label="Rate Your Visit" />
            <div className="rounded-[var(--radius-ios-md)] border border-ios-border-subtle overflow-hidden">
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

          {/* ── Tell Us More ── */}
          <div className="space-y-5">
            <SectionLabel label="Tell Us More" />

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
          <div className="space-y-3.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onSubmitWrapper}
              disabled={view === "submitting"}
              className="btn-ios w-full h-13 sm:h-14 text-body relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={
                view === "submitting" ? "Submitting your feedback…" : "Submit your feedback"
              }
            >
              <AnimatePresence mode="wait">
                {view === "submitting" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 relative z-10"
                  >
                    <Loader2 className="animate-spin" size={17} aria-hidden />
                    <span className="font-semibold">{APP_CONFIG.FORM.BUTTONS.SUBMITTING}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2.5 w-full relative z-10"
                  >
                    <span className="font-semibold tracking-wide">
                      {APP_CONFIG.FORM.BUTTONS.SUBMIT}
                    </span>
                    <Send
                      size={16}
                      strokeWidth={2.4}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-caption font-medium text-ios-foreground-faint">
              <ShieldCheck size={12} className="shrink-0 text-ios-primary/70" aria-hidden />
              <span>Your feedback is encrypted and kept strictly confidential</span>
            </div>

            {feedbackId && (
              <div className="text-center">
                <span className="text-micro font-mono font-bold uppercase tracking-[0.16em] text-ios-foreground-subtle bg-ios-border-subtle px-3.5 py-1.5 rounded-[var(--radius-ios-sm)] border border-ios-border-subtle">
                  {APP_CONFIG.FEEDBACK.SECURE_BADGE} · Ref {branchCode}-{feedbackId}
                </span>
              </div>
            )}
          </div>
        </form>
      </motion.div>

      <footer className="mb-6 text-center text-micro font-semibold uppercase tracking-[0.14em] text-ios-foreground-faint">
        {APP_CONFIG.COMPANY_NAME} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}