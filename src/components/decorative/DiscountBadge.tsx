import React from "react";
import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  text?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  variant?: "gold-circle" | "charcoal-burst" | "minimal-pill" | "amber-seal";
  className?: string;
}

export function DiscountBadge({
  text = "50%",
  subtext = "OFF",
  size = "md",
  variant = "gold-circle",
  className = "",
}: DiscountBadgeProps) {
  if (variant === "charcoal-burst") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center select-none",
          size === "sm" && "w-14 h-14",
          size === "md" && "w-18 h-18",
          size === "lg" && "w-22 h-22",
          className
        )}
      >
        {/* Decorative starburst SVG */}
        <svg
          className="absolute inset-0 w-full h-full text-luxury-charcoal animate-[spin_20s_linear_infinite]"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 0 L58 35 L93 20 L75 50 L98 68 L64 72 L60 100 L42 75 L15 90 L28 58 L2 45 L35 34 Z" />
        </svg>
        <div className="relative z-10 text-center font-serif text-luxury-ivory leading-none">
          <span className="block text-xs font-medium tracking-wider uppercase">{text}</span>
          {subtext && (
            <span className="block text-[10px] tracking-widest uppercase opacity-80 mt-0.5 font-sans">
              {subtext}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "amber-seal") {
    return (
      <div
        className={cn(
          "rounded-full border border-luxury-gold/40 bg-gradient-to-br from-[#E5A943] to-[#B87924] p-[3px] shadow-lg shadow-luxury-gold/20 flex items-center justify-center text-white",
          size === "sm" && "w-14 h-14",
          size === "md" && "w-20 h-20",
          size === "lg" && "w-24 h-24",
          className
        )}
      >
        <div className="w-full h-full rounded-full border border-dashed border-white/60 flex flex-col items-center justify-center text-center p-1">
          <span className="font-serif text-lg font-bold tracking-tight leading-none">{text}</span>
          {subtext && (
            <span className="font-sans text-[9px] uppercase tracking-widest font-semibold mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "minimal-pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-luxury-gold-soft text-luxury-gold border border-luxury-gold/30 shadow-xs",
          className
        )}
      >
        <span>{text}</span>
        {subtext && <span className="font-sans text-[10px]">{subtext}</span>}
      </span>
    );
  }

  // Default: gold-circle (as seen on reference hero)
  return (
    <div
      className={cn(
        "rounded-full bg-luxury-gold text-white flex flex-col items-center justify-center shadow-lg shadow-luxury-gold/30 select-none border-2 border-white/90 transform transition-transform hover:scale-105",
        size === "sm" && "w-14 h-14",
        size === "md" && "w-20 h-20",
        size === "lg" && "w-24 h-24",
        className
      )}
    >
      <span className="font-serif text-xl font-bold tracking-tight leading-none">{text}</span>
      {subtext && (
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-0.5 text-white/90">
          {subtext}
        </span>
      )}
    </div>
  );
}
