import React from "react";

interface PeacockArchBorderProps {
  className?: string;
}

export function PeacockArchBorder({ className = "" }: PeacockArchBorderProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-14 md:h-16"
        fill="currentColor"
      >
        <defs>
          <pattern
            id="peacock-pattern"
            width="120"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Scalloped Base Floral Arch */}
            <path
              d="M0,60 Q30,20 60,60 Q90,20 120,60"
              fill="#0F5B5D"
            />
            {/* Outer Gold Band */}
            <path
              d="M0,60 Q30,20 60,60 Q90,20 120,60"
              fill="none"
              stroke="#F6C343"
              strokeWidth="3"
            />
            {/* Little decorative peacock crown feathers on top */}
            <circle cx="30" cy="18" r="4" fill="#E05B2D" />
            <circle cx="30" cy="18" r="2" fill="#F6C343" />
            <circle cx="90" cy="18" r="4" fill="#E05B2D" />
            <circle cx="90" cy="18" r="2" fill="#F6C343" />

            {/* Floral Lotus Garland inside the arch */}
            <path
              d="M30,30 Q25,40 30,48 Q35,40 30,30 Z"
              fill="#E05B2D"
            />
            <path
              d="M90,30 Q85,40 90,48 Q95,40 90,30 Z"
              fill="#E05B2D"
            />
            {/* Small yellow decorative dots */}
            <circle cx="15" cy="40" r="2" fill="#F6C343" />
            <circle cx="45" cy="40" r="2" fill="#F6C343" />
            <circle cx="75" cy="40" r="2" fill="#F6C343" />
            <circle cx="105" cy="40" r="2" fill="#F6C343" />

            {/* Bottom Trim Line */}
            <line x1="0" y1="59" x2="120" y2="59" stroke="#F6C343" strokeWidth="2" strokeDasharray="3,3" />
          </pattern>
        </defs>
        <rect width="1200" height="60" fill="url(#peacock-pattern)" />
      </svg>
    </div>
  );
}
