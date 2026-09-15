import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DiscountBadge } from "@/components/decorative/DiscountBadge";
import { HandwrittenLabel } from "@/components/decorative/HandwrittenLabel";

export function UniquenessSection() {
  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 bg-luxury-soft/30 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
        {/* LIFESTYLE IMAGE (Mobile: Top, Desktop: Right 7 cols) */}
        <div className="lg:col-span-7 relative w-full order-1 lg:order-2">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-luxury-border">
            <Image
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
              alt="High fashion model posing with Pursia luxury purse"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Decorative Gold Badge (safely positioned inside upper-left corner) */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:-top-4 lg:-left-2 z-20">
            <DiscountBadge
              variant="gold-circle"
              text="100%"
              subtext="ORIGINAL"
              size="md"
              className="scale-85 sm:scale-100"
            />
          </div>
        </div>

        {/* EDITORIAL NARRATIVE (Mobile: Stacks below, Desktop: Left 5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              Artisanal Individuality
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal leading-[1.15]">
            Designed for <br />
            <span className="italic font-normal text-luxury-gold">Uniqueness</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-luxury-muted font-sans font-light leading-relaxed max-w-lg mx-auto sm:mx-0">
            No two grain patterns are identical. In our Florentine workshop, each hide is hand-inspected,
            graded, and matched to accent the unique contours of the wearer.
          </p>

          <div className="pt-1">
            <HandwrittenLabel rotate="left" color="gold" className="text-base sm:text-lg lg:text-2xl">
              &ldquo;True luxury is having what nobody else possesses.&rdquo;
            </HandwrittenLabel>
          </div>

          <div className="pt-2 sm:pt-4 flex items-center justify-center sm:justify-start">
            <Link
              href="/products?category=Handbags"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-luxury-dark transition-all duration-300 shadow-md shadow-luxury-charcoal/15 min-h-[48px] group"
            >
              <span>View The Atelier</span>
              <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
