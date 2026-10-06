import React from "react";
import { LotusFlourish } from "@/components/decorative/LotusFlourish";

export default function Loading() {
  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/25 backdrop-blur-[2px] transition-all duration-200 select-none animate-in fade-in"
    >
      {/* Centered Circular Loading Animation */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-[#E7DDD0] flex items-center justify-center">
        {/* Subtle circular track */}
        <div className="absolute inset-2 sm:inset-2.5 rounded-full border-[3px] border-[#EADCC9]/50" />
        
        {/* Circular spinning luxury terracotta & gold ring */}
        <div className="absolute inset-2 sm:inset-2.5 rounded-full border-[3px] border-transparent border-t-[#C45E35] border-r-[#D9A44C] animate-spin" />
        
        {/* Center lotus blossom emblem */}
        <LotusFlourish className="w-8 h-8 sm:w-9 sm:h-9 text-[#C45E35] animate-pulse" color="#C45E35" />
      </div>
    </div>
  );
}
