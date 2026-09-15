import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SwipeHintProps {
  visible: boolean;
  isDark?: boolean;
}

/**
 * SwipeHint:
 * Subtle pill hint encouraging users to drag or swipe the card.
 * Disappears permanently after the user's first gesture.
 */
export function SwipeHint({ visible, isDark = false }: SwipeHintProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className={`text-[9px] tracking-[0.25em] uppercase font-semibold px-3.5 py-1 rounded-full shadow-xs border transition-colors select-none ${
            isDark
              ? "bg-black/60 backdrop-blur-xs text-white/90 border-white/15"
              : "bg-white/80 backdrop-blur-xs text-luxury-charcoal/85 border-luxury-charcoal/10"
          }`}
        >
          <span className="inline-block animate-pulse">← Drag or Swipe Hero →</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
