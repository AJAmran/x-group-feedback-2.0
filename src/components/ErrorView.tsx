import React from "react";
import { AlertCircle } from "lucide-react";
import { APP_CONFIG } from "../lib/config";
import { motion } from "framer-motion";

interface ErrorViewProps {
    error?: string;
    onRetry: () => void;
    onBack: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = React.memo(({ error, onRetry, onBack }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="w-full max-w-[min(540px,100%)] glass-card p-8 sm:p-10 text-center relative border-red-500/10 rounded-[2rem]"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="h-24 w-24 bg-red-500/10 dark:bg-red-500/15 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-400/25">
                        <AlertCircle size={48} strokeWidth={2.2} aria-hidden="true" />
                    </div>
                </motion.div>

                <h2 className="text-title font-bold text-ios-foreground mb-4">
                    {APP_CONFIG.FEEDBACK.ERROR_TITLE}
                </h2>
                <p className="text-body text-ios-foreground-muted mb-10 leading-relaxed font-medium">
                    {error || APP_CONFIG.FEEDBACK.ERROR_DEFAULT}
                </p>

                <div className="flex flex-col gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onRetry}
                        className="btn-ios btn-ios-danger w-full py-4 text-label font-bold uppercase tracking-widest"
                    >
                        {APP_CONFIG.FORM.BUTTONS.TRY_AGAIN}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBack}
                        className="w-full py-4 rounded-2xl text-label font-bold uppercase tracking-widest border border-ios-border text-ios-foreground-muted hover:border-ios-border hover:text-ios-foreground transition-colors"
                    >
                        {APP_CONFIG.FORM.BUTTONS.BACK}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
});

ErrorView.displayName = "ErrorView";

