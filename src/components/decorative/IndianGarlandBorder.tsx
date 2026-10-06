import React from "react";

interface IndianGarlandBorderProps {
  className?: string;
  flip?: boolean;
}

export function IndianGarlandBorder({ className = "", flip = false }: IndianGarlandBorderProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${
        flip ? "rotate-180" : ""
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="w-full h-4 sm:h-5 md:h-6 text-[#F6C343]"
        fill="currentColor"
      >
        <defs>
          <pattern
            id="garland-pattern"
            width="60"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            {/* Top base band */}
            <rect x="0" y="0" width="60" height="3" fill="#F6C343" />
            <circle cx="15" cy="5" r="1.5" fill="#FFE8A3" />
            <circle cx="30" cy="5" r="1.5" fill="#FFE8A3" />
            <circle cx="45" cy="5" r="1.5" fill="#FFE8A3" />
            <circle cx="60" cy="5" r="1.5" fill="#FFE8A3" />

            {/* Scalloped Arch with Floral Motif */}
            <path
              d="M0,3 Q15,18 30,3 Q45,18 60,3"
              fill="none"
              stroke="#F6C343"
              strokeWidth="2"
            />
            {/* Inner secondary arch */}
            <path
              d="M5,3 Q15,13 25,3 M35,3 Q45,13 55,3"
              fill="none"
              stroke="#FFE8A3"
              strokeWidth="1.2"
              strokeDasharray="2,2"
            />
            {/* Hanging Teardrop / Bell / Lotus bud */}
            <path
              d="M15,15 Q13,20 15,22 Q17,20 15,15 Z M45,15 Q43,20 45,22 Q47,20 45,15 Z"
              fill="#E05B2D"
            />
            <circle cx="15" cy="23" r="1" fill="#F6C343" />
            <circle cx="45" cy="23" r="1" fill="#F6C343" />
            {/* Little center floral diamond */}
            <polygon points="30,7 32,10 30,13 28,10" fill="#E05B2D" />
          </pattern>
        </defs>
        <rect width="1200" height="24" fill="url(#garland-pattern)" />
      </svg>
    </div>
  );
}
