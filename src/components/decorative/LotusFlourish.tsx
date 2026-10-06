import React from "react";

interface LotusFlourishProps {
  className?: string;
  color?: string;
}

export function LotusFlourish({ className = "w-8 h-8", color = "#C85A32" }: LotusFlourishProps) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Central Lotus Petal */}
      <path
        d="M50 8 C46 22 42 38 50 56 C58 38 54 22 50 8 Z"
        fill={color}
      />
      {/* Left Petal */}
      <path
        d="M48 24 C36 28 26 38 28 52 C35 54 44 48 48 42 Z"
        fill={color}
      />
      {/* Right Petal */}
      <path
        d="M52 24 C64 28 74 38 72 52 C65 54 56 48 52 42 Z"
        fill={color}
      />
      {/* Symmetrical Base Flourish Swirls */}
      <path
        d="M50 58 C38 58 24 64 22 72 C21 77 27 79 32 76 C39 71 44 62 50 62 C56 62 61 71 68 76 C73 79 79 77 78 72 C76 64 62 58 50 58 Z"
        fill={color}
      />
      {/* Small Central Seed Accent */}
      <circle cx="50" cy="52" r="2.5" fill="#FFE8A3" />
    </svg>
  );
}
