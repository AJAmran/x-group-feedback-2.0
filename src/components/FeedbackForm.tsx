import Image from "next/image";
import {
    CheckCircle2,
    ChevronRight,
    Loader2,
    Sparkles,
    MapPin,
    AlertCircle,
} from "lucide-react";
import { Input } from "./Input";
import { RatingRow } from "./RatingRow";
import { RatingCategory } from "../types";
import { useFeedbackForm } from "../hooks/useFeedbackForm";
import logo from "../assets/logo.png";

export function FeedbackForm() {
    const {
        view,
        error,
        showValidation,
        feedbackId,
        branchCode,
        branchName,
        name,
        setName,
        contact,
        setContact,
        opinion,
        setOpinion,
        ratings,
        handleRatingChange,
        isFormValid,
        handleSubmit,
        resetForm,
        setShowValidation,
    } = useFeedbackForm();

    if (view === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 animate-fade-in relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.03)] via-transparent to-[hsl(var(--brand-primary)/0.06)]" />

                {/* Floating orbs/particles */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.1)] to-[hsl(var(--brand-primary)/0.05)] rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[hsl(var(--brand-glow)/0.08)] to-transparent rounded-full blur-3xl animate-pulse-soft delay-1000" />

                <div className="w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden p-8 text-center relative animate-[float_3s_ease-in-out_infinite]">
                    {/* Glass border effect */}
                    <div className="absolute inset-0 glass-border rounded-[2.5rem]" />

                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 rounded-t-[2.5rem]" />

                    {/* Success icon with glow effect */}
                    <div className="flex justify-center mb-6 mt-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-xl rounded-full" />
                        <div className="h-24 w-24 bg-gradient-to-tr from-white/95 to-green-50 rounded-full flex items-center justify-center text-green-600 shadow-2xl shadow-green-200/50 border border-green-100/50 animate-scale-in relative">
                            <CheckCircle2
                                size={48}
                                strokeWidth={2.5}
                                className="drop-shadow-sm"
                            />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans relative">
                        Thank You!
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed relative backdrop-blur-sm bg-white/30 px-4 py-3 rounded-2xl">
                        Your feedback helps us create better dining experiences at{" "}
                        <span className="text-brand-700 font-semibold">{branchName}</span>.
                    </p>

                    {/* Feedback ID card with glass effect */}
                    <div className="glass-inner rounded-2xl p-5 mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm" />
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1 relative">
                            Feedback Reference
                        </p>
                        {feedbackId && (
                            <p className="text-xl font-mono text-slate-800 tracking-wider relative font-semibold">
                                #{feedbackId}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="glass-button text-brand-700 text-sm font-semibold py-3 px-6 rounded-xl border border-brand-200/50 hover:border-brand-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-200/30 relative overflow-hidden group"
                    >
                        <span className="relative z-10">Close Window</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-50/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                </div>
            </div>
        );
    }

    if (view === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 animate-fade-in relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-transparent to-orange-50/20" />

                {/* Floating orbs/particles */}
                <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-red-400/0.05 to-orange-400/0.08 rounded-full blur-3xl animate-pulse-soft" />

                <div className="w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden p-8 text-center relative animate-[float_3s_ease-in-out_infinite]">
                    {/* Glass border effect */}
                    <div className="absolute inset-0 glass-border rounded-[2.5rem]" />

                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-t-[2.5rem]" />

                    {/* Error icon with glow effect */}
                    <div className="flex justify-center mb-8 mt-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 blur-xl rounded-full" />
                        <div className="h-24 w-24 bg-gradient-to-tr from-white/95 to-red-50 rounded-full flex items-center justify-center text-red-600 shadow-2xl shadow-red-200/50 border border-red-100/50 animate-scale-in relative">
                            <AlertCircle
                                size={48}
                                strokeWidth={2.5}
                                className="drop-shadow-sm"
                            />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans relative">
                        Oops!
                    </h2>
                    <p className="text-slate-600 mb-8 leading-relaxed relative backdrop-blur-sm bg-white/30 px-4 py-3 rounded-2xl">
                        {error || "Something went wrong while submitting your feedback."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={resetForm}
                            className="glass-button text-slate-700 text-sm font-semibold py-3 px-6 rounded-xl border border-slate-300/50 hover:border-slate-400/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/30 relative overflow-hidden group"
                        >
                            <span className="relative z-10">Back to Form</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="glass-button bg-gradient-to-br from-[hsl(var(--brand-glow))] to-[hsl(var(--brand-primary))] text-white text-sm font-semibold py-3 px-6 rounded-xl shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
                        >
                            <span className="relative z-10">Try Again</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </div>
                </div>
            </div>
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
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-800">
                                    Guest{" "}
                                    <span className="font-semibold bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))] bg-clip-text text-transparent">
                                        Feedback
                                    </span>
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed backdrop-blur-sm bg-white/30 px-2 py-1 rounded-lg inline-block">
                                    Your experience matters — help us improve.
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
                <section className="mb-8 relative">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2 backdrop-blur-sm bg-white/30 px-3 py-1.5 rounded-full">
                            <Sparkles size={12} className="text-brand-400 animate-pulse" />
                            Rate Your Experience
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
                <section className="mb-8 relative">
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
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2.5 relative overflow-hidden group transition-all duration-500 ${isFormValid
                        ? "glass-button-gradient text-white shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 hover:-translate-y-0.5"
                        : "glass-button-disabled text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {/* Animated background shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    {view === "submitting" ? (
                        <>
                            <Loader2 className="animate-spin relative z-10" size={22} />
                            <span className="relative z-10">Submitting...</span>
                        </>
                    ) : (
                        <>
                            <span className="relative z-10">Submit Feedback</span>
                            <ChevronRight
                                size={22}
                                strokeWidth={3}
                                className={`relative z-10 transition-transform duration-300 ${isFormValid ? "group-hover:translate-x-2" : ""
                                    }`}
                            />
                        </>
                    )}
                </button>
                <div className="mt-6 text-center">
                    {feedbackId && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold backdrop-blur-sm bg-white/30 px-3 py-1.5 rounded-full inline-block">
                            Secure Form • ID: {branchCode}-{feedbackId}
                        </p>
                    )}
                </div>
            </div>
            <footer className="mt-8 mb-2 text-center relative">
                <p className="text-xs text-slate-500 font-medium backdrop-blur-sm bg-white/30 px-4 py-2 rounded-full">
                    X-Group Hospitality Systems © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
