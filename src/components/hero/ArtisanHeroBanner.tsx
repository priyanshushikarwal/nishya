"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianGarlandBorder } from "@/components/decorative/IndianGarlandBorder";
import { HeroCampaign } from "@/lib/services/cms";

interface ArtisanHeroBannerProps {
  campaign?: HeroCampaign | null;
  headingTop?: string;
  headingAccent?: string;
  tagline?: string;
}

export function ArtisanHeroBanner({
  campaign,
  headingTop = "CARRY YOUR STORY WHEREVER YOU",
  headingAccent = "go.",
  tagline = "Bags that move with you.",
}: ArtisanHeroBannerProps) {
  // Use campaign data if active, otherwise use reference artisan banner
  const imageSrc = campaign?.desktop_image || "/images/nishya/nishya_hero_artisan_banner.jpg";
  const ctaLink = campaign?.cta_url || "/products";

  return (
    <section className="relative w-full overflow-hidden bg-[#0A484A]">
      <Link href={ctaLink} className="group block relative w-full select-none cursor-pointer">
        {/* Aspect Ratio Container: 16:9 on mobile, ultra-wide editorial on desktop */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] max-h-[580px] overflow-hidden">
          {/* Background Image */}
          <Image
            src={imageSrc}
            alt="Nishya — Handcrafted Bags For Your Story"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Subtle Ambient Vignette / Contrast Overlay for perfect legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A484A]/35 via-black/10 to-[#0A484A]/40 pointer-events-none" />

          {/* Top Traditional Indian Ornamental Garland Border */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <IndianGarlandBorder />
          </div>

          {/* Center Editorial Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 space-y-1.5 sm:space-y-2.5 md:space-y-3">
            <span className="text-[11px] sm:text-sm md:text-base lg:text-lg uppercase tracking-[0.28em] sm:tracking-[0.32em] text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {headingTop}
            </span>

            <h1 className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FFE5B4] font-normal leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              {headingAccent}
            </h1>

            <div className="pt-1 sm:pt-2">
              <span className="inline-block px-3 sm:px-5 py-1 sm:py-1.5 rounded bg-[#C45E35] text-white text-[10px] sm:text-xs md:text-sm font-medium tracking-wide shadow-md transition-transform duration-200 group-hover:scale-105">
                {tagline}
              </span>
            </div>
          </div>

          {/* Bottom Traditional Indian Ornamental Garland Border */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <IndianGarlandBorder flip />
          </div>
        </div>
      </Link>
    </section>
  );
}
