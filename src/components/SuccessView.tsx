import React from "react";
import { CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "../lib/config";

interface SuccessViewProps {
    branchName: string;
    feedbackId: string;
    onClose: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = React.memo(({ branchName, feedbackId, onClose }) => {
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
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans relative">
                    {APP_CONFIG.FEEDBACK.SUCCESS_TITLE}
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed relative backdrop-blur-sm bg-white/30 px-4 py-3 rounded-2xl">
                    {APP_CONFIG.FEEDBACK.SUCCESS_MESSAGE}{" "}
                    <span className="text-brand-700 font-semibold">{branchName}</span>.
                </p>

                {/* Feedback ID card with glass effect */}
                <div className="glass-inner rounded-2xl p-5 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm" />
                    <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1 relative">
                        feedback Reference
                    </p>
                    {feedbackId && (
                        <p className="text-xl font-mono text-slate-800 tracking-wider relative font-semibold">
                            #{feedbackId}
                        </p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="glass-button text-brand-700 text-sm font-semibold py-3 px-6 rounded-xl border border-brand-200/50 hover:border-brand-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-200/30 relative overflow-hidden group"
                >
                    <span className="relative z-10">{APP_CONFIG.FORM.BUTTONS.CLOSE}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-50/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
            </div>
        </div>
    );
});

SuccessView.displayName = "SuccessView";
