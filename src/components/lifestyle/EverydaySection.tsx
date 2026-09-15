import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DiscountBadge } from "@/components/decorative/DiscountBadge";

export function EverydaySection() {
  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
        {/* LIFESTYLE IMAGE (Mobile: Top, Desktop: Left 7 cols) */}
        <div className="lg:col-span-7 relative w-full">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-luxury-border">
            <Image
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1400&q=85"
              alt="Model carrying Pursia everyday leather tote"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
            {/* Soft gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Circular Gold/Orange Decorative Seal (safely placed inside bottom-right corner) */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:-bottom-6 lg:right-6 z-20">
            <DiscountBadge
              variant="amber-seal"
              text="ATELIER"
              subtext="GENUINE LEATHER"
              size="md"
              className="scale-85 sm:scale-100 lg:scale-110"
            />
          </div>
        </div>

        {/* EDITORIAL NARRATIVE (Mobile: Stacks below, Desktop: Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:pl-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-[1px] bg-luxury-gold" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              Daily Essentials
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal leading-[1.15]">
            For your everyday <br />
            <span className="italic font-normal text-luxury-gold">Belongings</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-luxury-muted font-sans font-light leading-relaxed max-w-lg mx-auto sm:mx-0">
            Spacious, architectural, and effortlessly refined. Every Pursia tote and shoulder piece is
            engineered to accommodate your digital life, cosmetics, and treasured mementos while
            preserving razor-sharp poise throughout your day.
          </p>

          {/* High-fashion bullet highlights */}
          <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-luxury-charcoal text-left max-w-md mx-auto sm:mx-0">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>Dedicated compartments for 13&rdquo; tech and essentials</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>Weight-distributing dual comfort straps</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>Hidden water-resistant micro-suede inner lining</span>
            </div>
          </div>

          <div className="pt-2 sm:pt-4">
            <Link
              href="/products?category=Totes"
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-luxury-charcoal/20 hover:border-luxury-charcoal text-xs uppercase tracking-[0.2em] font-semibold text-luxury-charcoal hover:text-luxury-gold transition-colors group min-h-[48px]"
            >
              <span>Explore Everyday Totes</span>
              <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
