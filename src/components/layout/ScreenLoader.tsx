"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LotusFlourish } from "@/components/decorative/LotusFlourish";

export function ScreenLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showLoader = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(true);

    // Fail-safe auto dismiss after 2s so user is never locked out
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const hideLoader = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => {
      setIsLoading(false);
    }, 120);
  };

  // Dismiss loader on route change
  useEffect(() => {
    hideLoader();
  }, [pathname, searchParams]);

  // Intercept navigation link clicks & custom events
  useEffect(() => {
    const handleNavigationTrigger = (targetEl: HTMLElement | null) => {
      if (!targetEl) return;
      const link = targetEl.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Only internal routes (ignore hash anchor links, new tabs, downloads, external URLs)
      if (
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        link.getAttribute("target") !== "_blank" &&
        !link.hasAttribute("download")
      ) {
        try {
          const currentUrl = new URL(window.location.href);
          const nextUrl = new URL(link.href, window.location.href);
          if (
            nextUrl.pathname === currentUrl.pathname &&
            nextUrl.search === currentUrl.search
          ) {
            return;
          }
        } catch {
          // ignore parsing error
        }
        showLoader();
      }
    };

    const handleClick = (e: MouseEvent) => {
      handleNavigationTrigger(e.target as HTMLElement);
    };

    document.addEventListener("click", handleClick, { passive: true });

    const handleCustomStart = () => showLoader();
    const handleCustomStop = () => hideLoader();

    window.addEventListener("nishya_start_loading", handleCustomStart);
    window.addEventListener("nishya_stop_loading", handleCustomStop);
    window.addEventListener("nishya_screen_load_start", handleCustomStart);
    window.addEventListener("nishya_screen_load_stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("nishya_start_loading", handleCustomStart);
      window.removeEventListener("nishya_stop_loading", handleCustomStop);
      window.removeEventListener("nishya_screen_load_start", handleCustomStart);
      window.removeEventListener("nishya_screen_load_stop", handleCustomStop);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isLoading) return null;

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
