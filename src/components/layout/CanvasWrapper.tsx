import React from "react";
import { cn } from "@/lib/utils";

interface CanvasWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CanvasWrapper({ children, className = "" }: CanvasWrapperProps) {
  return (
    // Base is mobile-first: clean white canvas edge-to-edge, then enhanced on large screens with the luxury beige frame
    <div className="min-h-screen w-full overflow-x-clip bg-white lg:bg-[#E5B25D] lg:bg-gradient-to-b lg:from-[#E8B765] lg:via-[#DEAA58] lg:to-[#D9A44C] py-0 lg:py-8 px-0 lg:px-6 xl:px-8 flex justify-center selection:bg-luxury-charcoal selection:text-white">
      {/* Editorial Canvas: edge-to-edge on mobile, framed on desktop */}
      <div
        className={cn(
          "w-full max-w-full lg:max-w-[1420px] bg-white text-luxury-charcoal lg:shadow-2xl lg:shadow-black/15 overflow-x-clip transition-all duration-300 lg:rounded-3xl lg:border lg:border-white/50 relative flex flex-col min-h-screen",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
