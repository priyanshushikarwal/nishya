"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { DiscountBadge } from "@/components/decorative/DiscountBadge";
import { HandwrittenLabel } from "@/components/decorative/HandwrittenLabel";
import { DecorativeArrow } from "@/components/decorative/DecorativeArrow";
import { formatPrice } from "@/lib/utils";

interface HeroProductProps {
  product: Product;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  totalIndices?: number;
}

export function HeroProduct({
  product,
  currentIndex,
  onSelectIndex,
  totalIndices = 4,
}: HeroProductProps) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none pt-4 sm:pt-6 lg:pt-0">
      {/* Product Display Canvas */}
      <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] flex items-center justify-center min-h-[300px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[500px]">
        {/* Soft Ambient Glow */}
        <div className="absolute w-[240px] sm:w-[340px] lg:w-[460px] h-[240px] sm:h-[340px] lg:h-[460px] rounded-full bg-gradient-to-tr from-luxury-beige-soft/50 via-luxury-soft/80 to-transparent -z-10 blur-xl pointer-events-none" />

        {/* Circular 50% OFF Badge (safely positioned within mobile container) */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-4 lg:right-6 z-20">
          <DiscountBadge text="50%" subtext="OFF" size="md" className="scale-90 sm:scale-100" />
        </div>

        {/* Handwritten annotation - visible on all screens, positioned safely */}
        <div className="absolute top-0 left-1 sm:left-4 z-20 flex flex-col items-start pointer-events-none">
          <HandwrittenLabel rotate="left" color="gold" className="text-base sm:text-lg lg:text-2xl">
            Italian Handcrafted
          </HandwrittenLabel>
          <DecorativeArrow
            direction="curve-right"
            className="hidden sm:block ml-6 -mt-1 scale-75 sm:scale-90 lg:scale-100 origin-top-left"
            strokeColor="#B87924"
          />
        </div>

        {/* Hero Handbag (object-contain, prominent sizing on mobile, clickable to PDP) */}
        <Link
          href={`/product/${product.slug}`}
          className="relative w-[250px] sm:w-[340px] md:w-[400px] lg:w-[480px] h-[260px] sm:h-[340px] md:h-[400px] lg:h-[480px] transition-transform duration-500 hover:scale-105 cursor-pointer block"
          aria-label={`View details for ${product.name}`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 480px"
            className="object-contain drop-shadow-2xl"
          />
        </Link>

        {/* Small floating product detail tag bottom-left on desktop */}
        <Link
          href={`/product/${product.slug}`}
          className="hidden sm:block absolute bottom-2 left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-luxury-border shadow-md hover:border-luxury-gold transition-colors group"
        >
          <div className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold">
            {product.category}
          </div>
          <div className="font-serif text-xs sm:text-sm font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
            {product.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-luxury-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-luxury-muted line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Vertical Pagination Slide Indicator (Desktop lg: only) */}
        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3">
          {Array.from({ length: totalIndices }).map((_, idx) => {
            const formatted = `0${idx + 1}`;
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectIndex(idx)}
                className={`flex items-center gap-2 transition-all duration-300 group cursor-pointer text-right ${
                  isActive
                    ? "text-luxury-charcoal font-bold scale-110"
                    : "text-luxury-muted/70 hover:text-luxury-charcoal"
                }`}
                aria-label={`Select showcase bag ${formatted}`}
              >
                <span className="text-xs font-serif tracking-widest">{formatted}</span>
                <span
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "h-6 bg-luxury-gold" : "h-1.5 bg-luxury-border group-hover:bg-luxury-muted"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile-Friendly Slide Indicators (< lg: horizontal bar below handbag) */}
      <div className="flex lg:hidden items-center justify-center gap-3 mt-4">
        {Array.from({ length: totalIndices }).map((_, idx) => {
          const formatted = `0${idx + 1}`;
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                isActive
                  ? "bg-luxury-charcoal text-white font-bold shadow-xs"
                  : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal border border-luxury-border/60"
              }`}
            >
              <span>{formatted}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
