import React from "react";

interface HeroDecorationsProps {
  arcColor: string;
  secondaryArcColor: string;
  accentColor?: string;
  isDark?: boolean;
}

/**
 * HeroDecorations:
 * Renders pure CSS/SVG architectural background geometry:
 * - Oversized half-circles extending beyond the right viewport
 * - Architectural crescent rings
 * - Organic quarter-circles in corners
 * - Radial ambient highlights
 * Completely responsive and crisp on all retina screens.
 */
export function HeroDecorations({
  arcColor,
  secondaryArcColor,
  accentColor = "#D4AF37",
  isDark = false,
}: HeroDecorationsProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Oversized Half-Circle extending from right edge */}
      <div
        className="absolute -right-24 top-[14%] w-[370px] h-[370px] rounded-full transition-colors duration-700 ease-out"
        style={{
          backgroundColor: arcColor,
          opacity: isDark ? 0.35 : 0.45,
        }}
      />

      {/* 2. Architectural Crescent Ring */}
      <div
        className="absolute -right-28 top-[11%] w-[395px] h-[395px] rounded-full border-[28px] transition-colors duration-700 ease-out"
        style={{
          borderColor: secondaryArcColor,
          opacity: isDark ? 0.25 : 0.35,
        }}
      />

      {/* 3. Organic Quarter-Circle from bottom-left corner */}
      <div
        className="absolute -left-16 -bottom-16 w-[240px] h-[240px] rounded-full border-[22px] transition-colors duration-700 ease-out"
        style={{
          borderColor: arcColor,
          opacity: isDark ? 0.2 : 0.25,
        }}
      />

      {/* 4. Subtle Top-Left Ambient Geometry */}
      <div
        className="absolute -left-10 -top-10 w-[160px] h-[160px] rounded-full blur-2xl transition-colors duration-700"
        style={{
          backgroundColor: secondaryArcColor,
          opacity: isDark ? 0.15 : 0.3,
        }}
      />

      {/* 5. Center Ambient Glow */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-radial from-white/[0.08] via-transparent to-black/30"
            : "bg-radial from-white/40 via-transparent to-black/[0.04]"
        }`}
      />
    </div>
  );
}
