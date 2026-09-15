import React from "react";

interface SwipePaginationProps {
  currentIndex: number;
  totalSlides: number;
  onSelectIndex: (index: number) => void;
}

export function SwipePagination({
  currentIndex,
  totalSlides,
  onSelectIndex,
}: SwipePaginationProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full select-none pointer-events-auto">
      {/* 1. PAGINATION DOTS (● ○ ○ ○) */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Slide dots">
        {Array.from({ length: totalSlides }).map((_, dotIdx) => {
          const isActive = dotIdx === currentIndex;
          return (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${dotIdx + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectIndex(dotIdx);
              }}
              className="p-1 cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#1F1E24] shadow-xs"
                    : "w-2 h-2 bg-[#C4BEB7] hover:bg-[#9B958F]"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* 2. HAND SWIPE ICON & "SWIPE TO EXPLORE" */}
      <div className="flex flex-col items-center gap-1 text-[#7A7571] pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold leading-none text-[#7A7571]">←</span>
          {/* Detailed Hand Swipe Icon */}
          <svg
            className="w-5 h-5 text-[#3A3532]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span className="text-xs font-bold leading-none text-[#7A7571]">→</span>
        </div>
        <span className="text-[9px] tracking-[0.26em] uppercase font-semibold text-[#7A7571]">
          SWIPE TO EXPLORE
        </span>
      </div>
    </div>
  );
}
