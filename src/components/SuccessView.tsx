import React from "react";
import { CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "../lib/config";
import { motion, type Variants } from "framer-motion";

interface SuccessViewProps {
  branchName: string;
  feedbackId: string;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Lightweight confetti — pure framer-motion,
// no extra packages. Particles are memo-stable.
// ─────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#3b82f6", "#f43f5e",
];

const seededValue = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

const particles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: 8 + seededValue(i + 1) * 84,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 5 + seededValue(i + 29) * 7,
  delay: seededValue(i + 57) * 0.55,
  duration: 1.8 + seededValue(i + 85) * 1.4,
  rotate:
    (seededValue(i + 113) > 0.5 ? 1 : -1) *
    (80 + seededValue(i + 141) * 200),
  isCircle: seededValue(i + 169) > 0.5,
}));

function Confetti() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: -16,
            width: p.size,
            height: p.isCircle ? p.size : p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
          initial={{ y: -16, opacity: 1, rotate: 0 }}
          animate={{
            y: 640,
            opacity: [1, 1, 0.9, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.2, 0.82, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}

// Stagger helpers
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.28 },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.3 } },
};

export const SuccessView: React.FC<SuccessViewProps> = React.memo(
  ({ branchName, feedbackId, onClose }) => {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="w-full max-w-[min(520px,100%)] glass-card p-8 sm:p-10 text-center relative rounded-4xl overflow-hidden"
        >
          {/* Confetti */}
          <Confetti />

          {/* Ambient glow */}
          <div className="absolute inset-0 bg-emerald-500/8 blur-[80px] rounded-full pointer-events-none -z-10" />

          {/* Success icon + pulse rings */}
          <motion.div
            initial={{ scale: 0, rotate: -28 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.16 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="h-24 w-24 bg-emerald-500 rounded-[28%] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/35">
                <CheckCircle2 size={50} strokeWidth={2.5} aria-hidden="true" />
                {/* Apple-style inner gloss */}
                <div className="absolute inset-0 bg-white/12 rounded-[28%] pointer-events-none" />
              </div>

              {/* Pulse ring 1 */}
              <motion.div
                className="absolute inset-0 rounded-[28%] border-2 border-emerald-500/40"
                animate={{ scale: [1, 1.4, 1.75], opacity: [0.6, 0.25, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
              />
              {/* Pulse ring 2 — offset */}
              <motion.div
                className="absolute inset-0 rounded-[28%] border-2 border-emerald-500/25"
                animate={{ scale: [1, 1.6, 2.1], opacity: [0.4, 0.15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  delay: 0.45,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>

          {/* Staggered text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-0"
          >
            <motion.h2
              variants={item}
              className="text-title font-bold text-ios-foreground mb-3 tracking-tight"
            >
              {APP_CONFIG.FEEDBACK.SUCCESS_TITLE}
            </motion.h2>

            <motion.p
              variants={item}
              className="text-body text-ios-foreground-muted mb-8 leading-relaxed font-medium px-4"
            >
              {APP_CONFIG.FEEDBACK.SUCCESS_MESSAGE}{" "}
              <span className="text-ios-primary font-bold">{branchName}</span>.
            </motion.p>

            {/* Ref card */}
            <motion.div
              variants={item}
              className="liquid-glass rounded-3xl p-5 mb-8"
            >
              <p className="text-micro uppercase tracking-[0.24em] text-ios-foreground-subtle font-bold mb-2.5">
                Confirmation Reference
              </p>
              <p className="text-title font-mono font-black text-ios-foreground tracking-widest">
                #{feedbackId}
              </p>
              <p className="text-micro text-ios-foreground-faint font-medium mt-1.5 tracking-wide">
                Keep this for your records
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={item}>
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="btn-ios w-full h-14 text-label font-bold uppercase tracking-[0.15em] shadow-xl"
              >
                {APP_CONFIG.FORM.BUTTONS.CLOSE}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

SuccessView.displayName = "SuccessView";
