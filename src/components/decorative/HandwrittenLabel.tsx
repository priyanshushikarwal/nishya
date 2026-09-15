import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenLabelProps {
  children: React.ReactNode;
  className?: string;
  rotate?: "left" | "right" | "none";
  color?: "gold" | "charcoal" | "muted";
}

export function HandwrittenLabel({
  children,
  className = "",
  rotate = "left",
  color = "gold",
}: HandwrittenLabelProps) {
  const rotateClass =
    rotate === "left"
      ? "-rotate-6"
      : rotate === "right"
      ? "rotate-6"
      : "rotate-0";

  const colorClass =
    color === "gold"
      ? "text-luxury-gold"
      : color === "charcoal"
      ? "text-luxury-charcoal"
      : "text-luxury-muted";

  return (
    <span
      className={cn(
        "font-script-annot text-xl lg:text-2xl tracking-wide select-none inline-block transform transition-transform hover:scale-105",
        rotateClass,
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}
