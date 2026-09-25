import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DecorativeArrow } from "@/components/decorative/DecorativeArrow";
import { HandwrittenLabel } from "@/components/decorative/HandwrittenLabel";

export function LifestyleModel() {
  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* PORTRAIT EDITORIAL PHOTO (Mobile: Top, Desktop: Left 6 cols) */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
          {/* Handwritten Annotation on Top Left */}
          <div className="flex items-center gap-2 mb-3 lg:mb-0 lg:absolute lg:-top-6 lg:left-0 z-20 pointer-events-none">
            <HandwrittenLabel rotate="left" color="gold" className="text-sm sm:text-base lg:text-xl">
              Designed for every occasion
            </HandwrittenLabel>
            <DecorativeArrow direction="curve-right" className="hidden lg:block ml-4 -mt-1" strokeColor="#B87924" />
          </div>

          <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-luxury-border">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
              alt="Fashion editorial model with Nishya evening clutch"
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-cover object-top hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Editorial Tag */}
          <Link
            href="/products"
            className="mt-3 lg:mt-0 lg:absolute lg:-bottom-4 lg:right-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-luxury-border hover:border-luxury-gold shadow-lg z-20 w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[220px] transition-colors group cursor-pointer block"
          >
            <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-bold block">
              Atelier Editorial
            </span>
            <h4 className="font-serif text-xs sm:text-sm font-bold text-luxury-charcoal group-hover:text-luxury-gold mt-0.5 transition-colors">
              Evening Elegance
            </h4>
            <span className="text-xs font-semibold text-luxury-gold block mt-0.5">Explore Series &rarr;</span>
          </Link>
        </div>

        {/* EDITORIAL STORY (Mobile: Stacks below, Desktop: Right 6 cols) */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:pl-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-[1px] bg-luxury-gold" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              Editorial Showcase
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal leading-[1.15]">
            Effortless Grace for <br />
            <span className="italic font-normal text-luxury-gold">Every Occasion</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-luxury-muted font-sans font-light leading-relaxed max-w-lg mx-auto sm:mx-0">
            From sunrise boardrooms to midnight galas, Nishya handbags balance sculptural drama with
            practical weightlessness. Hand-stitched seams and buttery lambskin linings deliver a tactile
            experience second to none.
          </p>

          <div className="pt-2 sm:pt-4 flex items-center justify-center sm:justify-start">
            <Link
              href="/products?category=Clutches"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-luxury-dark transition-all duration-300 shadow-md shadow-luxury-charcoal/15 min-h-[48px] group"
            >
              <span>Discover Clutches</span>
              <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
