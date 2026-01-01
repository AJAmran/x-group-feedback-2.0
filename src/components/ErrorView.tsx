import React from "react";
import { AlertCircle } from "lucide-react";
import { APP_CONFIG } from "../lib/config";

interface ErrorViewProps {
    error?: string;
    onRetry: () => void;
    onBack: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = React.memo(({ error, onRetry, onBack }) => {
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
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-3 font-sans relative">
                    {APP_CONFIG.FEEDBACK.ERROR_TITLE}
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed relative backdrop-blur-sm bg-white/30 px-4 py-3 rounded-2xl">
                    {error || APP_CONFIG.FEEDBACK.ERROR_DEFAULT}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onBack}
                        className="glass-button text-slate-700 text-sm font-semibold py-3 px-6 rounded-xl border border-slate-300/50 hover:border-slate-400/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/30 relative overflow-hidden group"
                    >
                        <span className="relative z-10">{APP_CONFIG.FORM.BUTTONS.BACK}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                    <button
                        onClick={onRetry}
                        className="glass-button bg-gradient-to-br from-[hsl(var(--brand-glow))] to-[hsl(var(--brand-primary))] text-white text-sm font-semibold py-3 px-6 rounded-xl shadow-lg shadow-[hsl(var(--brand-primary))]/40 hover:shadow-xl hover:shadow-[hsl(var(--brand-primary))]/50 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
                    >
                        <span className="relative z-10">{APP_CONFIG.FORM.BUTTONS.TRY_AGAIN}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                </div>
            </div>
        </div>
    );
});

ErrorView.displayName = "ErrorView";
