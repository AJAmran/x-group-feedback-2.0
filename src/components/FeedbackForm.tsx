import Image from "next/image";
import {
    ChevronRight,
    Loader2,
    Sparkles,
    MapPin,
    Check,
} from "lucide-react";
import { Input } from "./Input";
import { RatingRow } from "./RatingRow";
import { SuccessView } from "./SuccessView";
import { ErrorView } from "./ErrorView";
import { RatingCategory } from "../types";
import { useFeedbackForm } from "../hooks/useFeedbackForm";
import { APP_CONFIG } from "../lib/config";
import { AGE_GROUPS, SOURCES } from "../lib/constants";
import logo from "../assets/logo.png";

/**
 * Main Feedback Form Component
 *
 * Renders the guest feedback form with success/error states.
 * Uses `useFeedbackForm` hook for logic and state management.
 * Implements Glassmorphism 3.0 visual style.
 *
 * Refactored to use SuccessView and ErrorView sub-components.
 */
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
        isValid,
        contactStatus,
        sourceValue,
        ageGroupValue,
        setFieldValue
    } = useFeedbackForm();

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
            <ErrorView
                error={error}
                onRetry={onSubmitWrapper}
                onBack={resetForm}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-6 sm:py-10 px-4 font-sans text-slate-800 relative z-10 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.03)] via-transparent to-[hsl(var(--brand-primary)/0.06)]" />

            {/* Floating orbs/particles for glassmorphism effect */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.1)] to-transparent rounded-full blur-3xl animate-float-orb-1" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-[hsl(var(--brand-glow)/0.08)] to-transparent rounded-full blur-3xl animate-float-orb-2" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/0.03 to-purple-400/0.05 rounded-full blur-3xl animate-pulse-soft delay-500" />

            <div className="w-full max-w-md mb-8 sm:mb-10 animate-slide-up relative">
                <div className="relative pl-1">
                    {/* Glassmorphism accent bar */}
                    <div className="absolute left-0 top-1 bottom-1 w-1.5 rounded-full bg-gradient-to-b from-[hsl(var(--brand-primary-light))] to-[hsl(var(--brand-primary))] shadow-lg shadow-[hsl(var(--brand-primary))]/20" />

                    <div className="space-y-3 ml-6">
                        {/* Main Title */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/0.2] to-transparent rounded-xl blur-md" />
                                <Image
                                    src={logo}
                                    alt="X-Group Logo"
                                    width={64}
                                    height={64}
                                    className="h-16 w-auto object-contain shadow-lg relative"
                                    priority={true}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-800">
                                    {APP_CONFIG.FEEDBACK.TITLE_PREFIX}{" "}
                                    <span className="font-semibold bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))] bg-clip-text text-transparent">
                                        {APP_CONFIG.FEEDBACK.TITLE_SUFFIX}
                                    </span>
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed backdrop-blur-sm bg-white/30 px-2 py-1 rounded-lg inline-block">
                                    {APP_CONFIG.FEEDBACK.SUBTITLE}
                                </p>
                            </div>
                        </div>

                        {/* Branch pill with glass effect */}
                        <div className="inline-flex items-center gap-1.5 glass-inner border border-[hsl(var(--brand-primary)/0.2)] px-4 py-2 rounded-full text-[hsl(var(--brand-primary))] w-fit shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-[hsl(var(--brand-primary)/0.3)] transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.1)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <MapPin size={14} strokeWidth={2.2} className="relative z-10" />
                            <span className="text-xs font-semibold tracking-wide uppercase relative z-10">
                                {branchName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Card with Enhanced Glassmorphism */}
            <div className="w-full max-w-md glass-card rounded-[2.5rem] p-6 sm:p-8 animate-[slide-up_0.6s_ease-out] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[hsl(var(--brand-primary))]/10 transition-all duration-500 relative overflow-hidden group">
                {/* Glass border effect */}
                <div className="absolute inset-0 glass-border rounded-[2.5rem]" />

                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-primary-light))] to-[hsl(var(--brand-glow))] rounded-t-[2.5rem]" />

                {/* Inner glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <section className="space-y-6 mb-10 relative">
                    <Input
                        label={APP_CONFIG.FORM.LABELS.GUEST_NAME}
                        placeholder={APP_CONFIG.FORM.PLACEHOLDERS.GUEST_NAME}
                        required
                        autoFocus
                        autoComplete="name"
                        error={!!errors.name}
                        {...register("name")}
                    />
                    <Input
                        label={APP_CONFIG.FORM.LABELS.CONTACT}
                        placeholder={APP_CONFIG.FORM.PLACEHOLDERS.CONTACT}
                        required
                        autoComplete="email"
                        error={!!errors.contact}
                        validationStatus={contactStatus}
                        {...register("contact")}
                    />

                </section>

                <section className="mb-8 relative">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2 backdrop-blur-sm bg-white/30 px-3 py-1.5 rounded-full">
                            <Sparkles size={12} className="text-brand-400 animate-pulse" />
                            {APP_CONFIG.FORM.LABELS.RATING_HEADER}
                        </h3>
                    </div>
                    <div className="glass-inner rounded-2xl p-2 border border-white/30">
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

                <section className="mb-8 relative space-y-8">
                    {/* Source Selection - Custom Chips */}
                    <div className="space-y-3">
                        <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                            {APP_CONFIG.FORM.LABELS.SOURCE}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {SOURCES.map((opt) => {
                                const isSelected = sourceValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFieldValue("source", opt.value)}
                                        className={`group relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isSelected
                                            ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))] text-white shadow-lg shadow-[hsl(var(--brand-primary))]/25 scale-[1.02]"
                                            : "bg-white/40 hover:bg-white/60 text-slate-600 hover:text-slate-800 border border-white/40 hover:border-white/60"
                                            }`}
                                    >
                                        <span className="relative z-10">{opt.label}</span>
                                        {isSelected && (
                                            <Check size={15} className="relative z-10 animate-scale-in" strokeWidth={3} />
                                        )}
                                        {/* Hover Glow for unselected */}
                                        {!isSelected && (
                                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Age Group Selection - Custom Chips */}
                    <div className="space-y-3">
                        <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                            {APP_CONFIG.FORM.LABELS.AGE_GROUP}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {AGE_GROUPS.map((opt) => {
                                const isSelected = ageGroupValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFieldValue("ageGroup", opt.value)}
                                        className={`group relative flex items-center justify-center gap-1.5 px-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isSelected
                                            ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))] text-white shadow-lg shadow-[hsl(var(--brand-primary))]/25 scale-[1.02]"
                                            : "bg-white/40 hover:bg-white/60 text-slate-600 hover:text-slate-800 border border-white/40 hover:border-white/60"
                                            }`}
                                    >
                                        <span className="relative z-10 whitespace-nowrap">{opt.label}</span>
                                        {isSelected && (
                                            <Check size={14} className="relative z-10 animate-scale-in" strokeWidth={3} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Hidden inputs for validation registration */}
                        <input type="hidden" {...register("source")} />
                        <input type="hidden" {...register("ageGroup")} />
                    </div>

                    <Input
                        label={APP_CONFIG.FORM.LABELS.OPINION}
                        isTextArea
                        placeholder={APP_CONFIG.FORM.PLACEHOLDERS.OPINION}
                        {...register("opinion")}
                    />
                </section>
                <button
                    onClick={onSubmitWrapper}
                    disabled={!isValid || view === "submitting"}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2.5 relative overflow-hidden group transition-all duration-500 ${isValid && view !== "submitting"
                        ? "glass-button-gradient text-white shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 hover:-translate-y-0.5"
                        : "glass-button-disabled text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {/* Animated background shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-700" />

                    {view === "submitting" ? (
                        <>
                            <Loader2 className="animate-spin relative z-10" size={22} />
                            <span className="relative z-10">{APP_CONFIG.FORM.BUTTONS.SUBMITTING}</span>
                        </>
                    ) : (
                        <>
                            <span className="relative z-10">{APP_CONFIG.FORM.BUTTONS.SUBMIT}</span>
                            <ChevronRight
                                size={22}
                                strokeWidth={3}
                                className={`relative z-10 transition-transform duration-300 ${isValid ? "group-hover:translate-x-2" : ""
                                    }`}
                            />
                        </>
                    )}
                </button>
                <div className="mt-6 text-center">
                    {feedbackId && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold backdrop-blur-sm bg-white/30 px-3 py-1.5 rounded-full inline-block">
                            {APP_CONFIG.FEEDBACK.SECURE_BADGE} • ID: {branchCode}-{feedbackId}
                        </p>
                    )}
                </div>
            </div>
            <footer className="mt-8 mb-2 text-center relative">
                <p className="text-xs text-slate-500 font-medium backdrop-blur-sm bg-white/30 px-4 py-2 rounded-full">
                    {APP_CONFIG.COMPANY_NAME} © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
