import React from "react";

interface DecorativeArrowProps {
  className?: string;
  direction?: "up-right" | "down-right" | "curve-left" | "curve-right" | "straight-down";
  strokeColor?: string;
}

export function DecorativeArrow({
  className = "",
  direction = "curve-right",
  strokeColor = "#B87924",
}: DecorativeArrowProps) {
  if (direction === "curve-right") {
    return (
      <svg
        className={className}
        width="68"
        height="48"
        viewBox="0 0 68 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 8C20 4 48 10 56 36M56 36L46 34M56 36L60 26"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  if (direction === "curve-left") {
    return (
      <svg
        className={className}
        width="68"
        height="48"
        viewBox="0 0 68 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M64 8C48 4 20 10 12 36M12 36L22 34M12 36L8 26"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  if (direction === "down-right") {
    return (
      <svg
        className={className}
        width="48"
        height="56"
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M8 6C12 28 26 44 42 48M42 48L32 46M42 48L40 38"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width="40"
      height="60"
      viewBox="0 0 40 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 4V52M20 52L14 44M20 52L26 44"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
