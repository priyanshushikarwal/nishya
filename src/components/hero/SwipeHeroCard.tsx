import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlideData } from "@/data/heroSlides";

interface SwipeHeroCardProps {
  slide: {
    id: number | string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
  isInteractive: boolean;
  totalSlides: number;
}

/**
 * SwipeHeroCard:
 * Full-bleed editorial photo card — the entire card IS the photo.
 * Matches the reference design: rounded card with photo filling the entire space,
 * a subtle bottom gradient overlay, SHOP NOW pill button, and slide counter.
 * No separate product image or text overlays — the photo itself contains everything.
 */
export function SwipeHeroCard({
  slide,
  isInteractive,
  totalSlides,
}: SwipeHeroCardProps) {
  return (
    <div className="relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_20px_45px_-10px_rgba(0,0,0,0.22)] border border-black/5 select-none transition-transform duration-300">
      {/* FULL-BLEED EDITORIAL PHOTO */}
      <Link
        href={slide.ctaLink}
        className={`absolute inset-0 block ${isInteractive ? "cursor-pointer" : "pointer-events-none"}`}
        aria-label={`View collection item ${slide.id}`}
        tabIndex={isInteractive ? 0 : -1}
      >
        <Image
          src={slide.image}
          alt={`Nishya Collection ${slide.id}`}
          fill
          sizes="(max-width: 768px) 85vw, 360px"
          priority
          className="object-cover object-center"
        />
      </Link>

      {/* SUBTLE BOTTOM GRADIENT FOR CTA READABILITY */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

      {/* BOTTOM SECTION: WHITE PILL CTA BUTTON + SLIDE COUNTER */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-5 pb-5">
        {/* White Pill Button: SHOP NOW → */}
        <div className={isInteractive ? "pointer-events-auto" : "pointer-events-none"}>
          <Link
            href={slide.ctaLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1F1E24] hover:bg-white/90 active:scale-95 text-[11px] font-bold tracking-wider uppercase shadow-md transition-all duration-200 cursor-pointer"
          >
            <span>{slide.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>

        {/* Slide Counter: 01 / 04 with Progress Line */}
        <div className="text-right select-none pb-0.5">
          <span className="text-[11px] font-mono tracking-widest font-semibold text-white/90">
            {typeof slide.id === "number" ? `0${slide.id}` : "01"} / 0{totalSlides}
          </span>
          {/* Progress Underline */}
          <div className="w-12 h-[2px] mt-1 ml-auto flex rounded-full overflow-hidden bg-white/20">
            <div
              className="h-full bg-white"
              style={{
                width: `${Math.min(100, ((Number(slide.id) || 1) / totalSlides) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
