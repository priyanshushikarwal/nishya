import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SwipeHeroControlsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export function SwipeHeroControls({
  onPrev,
  onNext,
  disabled = false,
}: SwipeHeroControlsProps) {
  return (
    <>
      {/* Left Arrow Button: Placed over the left edge of the center card */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrev();
        }}
        disabled={disabled}
        aria-label="Previous card"
        className="absolute left-4 top-[48%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-[#1F1E24] hover:bg-white/90 shadow-[0_8px_25px_rgba(0,0,0,0.15)] border border-black/5 flex items-center justify-center transition-transform active:scale-90 cursor-pointer pointer-events-auto disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
      </button>

      {/* Right Arrow Button: Placed over the right edge of the center card */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNext();
        }}
        disabled={disabled}
        aria-label="Next card"
        className="absolute right-4 top-[48%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-[#1F1E24] hover:bg-white/90 shadow-[0_8px_25px_rgba(0,0,0,0.15)] border border-black/5 flex items-center justify-center transition-transform active:scale-90 cursor-pointer pointer-events-auto disabled:opacity-50"
      >
        <ArrowRight className="w-4 h-4 stroke-[1.8]" />
      </button>
    </>
  );
}
