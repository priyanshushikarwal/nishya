"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { HeroProduct } from "@/components/hero/HeroProduct";
import { VideoModal } from "@/components/hero/VideoModal";
import { MobileSwipeHero } from "@/components/hero/MobileSwipeHero";

export function HeroSection() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [heroBags, setHeroBags] = useState<Product[]>([]);

  useEffect(() => {
    const fetchBags = () => {
      getProducts().then((all) => {
        setHeroBags(all.slice(0, 4));
      });
    };
    fetchBags();
    window.addEventListener("nishya_products_updated", fetchBags);
    return () => window.removeEventListener("nishya_products_updated", fetchBags);
  }, []);

  const currentBag = heroBags[heroIndex] || heroBags[0];

  return (
    <>
      {/* Mobile High-Fashion Editorial Hero Swipe Stack (< lg) */}
      <div className="block lg:hidden w-full">
        <MobileSwipeHero />
      </div>

      {/* Desktop Asymmetric Editorial Hero (>= lg) */}
      <section className="hidden lg:block relative px-4 sm:px-6 md:px-8 lg:px-14 pt-6 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 lg:pb-24 overflow-x-clip">
        <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
        {/* EDITORIAL CONTENT (Mobile: Top, Desktop: Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8 z-10 text-center sm:text-left">
          {/* 1. Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-soft border border-luxury-border">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-muted">
              Haute Maroquinerie Edition
            </span>
          </div>

          {/* 2. Hero Heading (Responsive fluid sizing) */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[60px] xl:text-[64px] font-bold text-luxury-charcoal leading-[1.12] sm:leading-[1.1] tracking-tight">
              Your Ultimate Destination <br className="hidden xs:inline sm:inline" />
              for <span className="italic font-normal font-serif text-luxury-gold">Luxe Handbags</span>
            </h1>
          </div>

          {/* 3. Supporting Description */}
          <p className="text-xs sm:text-sm md:text-base text-luxury-muted font-sans font-light max-w-lg mx-auto sm:mx-0 leading-relaxed">
            Crafted for elegance, designed for confidence. Immerse yourself in our architectural
            handbag creations, hand-sculpted in full-grain Italian leather with hand-polished 18k gold hardware.
          </p>

          {/* 4. CTA Buttons (Mobile: full width or inline stack, min 48px touch targets) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2 max-w-md mx-auto sm:mx-0">
            {/* Primary CTA */}
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-luxury-dark transition-all duration-300 shadow-lg shadow-luxury-charcoal/20 hover:shadow-xl cursor-pointer group min-h-[48px]"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary CTA: Watch Video with Circular Play Icon */}
            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 sm:py-3.5 rounded-full border border-luxury-charcoal/25 hover:border-luxury-charcoal bg-white/90 hover:bg-white text-luxury-charcoal text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-200 cursor-pointer group min-h-[48px]"
              aria-label="Watch campaign film"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-luxury-soft group-hover:bg-luxury-gold group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Watch Video</span>
            </button>
          </div>

          {/* 5. Editorial Specs / Trust Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-luxury-border/80 max-w-md mx-auto sm:mx-0 text-center sm:text-left">
            <div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-luxury-charcoal">100%</div>
              <div className="text-[10px] sm:text-[11px] text-luxury-muted uppercase tracking-wider mt-0.5">
                Italian Calfskin
              </div>
            </div>
            <div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-luxury-charcoal">18K</div>
              <div className="text-[10px] sm:text-[11px] text-luxury-muted uppercase tracking-wider mt-0.5">
                Gold Hardware
              </div>
            </div>
            <div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-luxury-charcoal">Lifetime</div>
              <div className="text-[10px] sm:text-[11px] text-luxury-muted uppercase tracking-wider mt-0.5">
                Craft Guarantee
              </div>
            </div>
          </div>
        </div>

        {/* 6. HERO PRODUCT SHOWCASE (Mobile: Below content, Desktop: Right 6 cols) */}
        <div className="lg:col-span-6 relative w-full flex justify-center">
          {currentBag ? (
            <HeroProduct
              product={currentBag}
              currentIndex={heroIndex}
              onSelectIndex={setHeroIndex}
              totalIndices={heroBags.length}
            />
          ) : (
            <div className="relative w-full max-w-[480px] rounded-3xl bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] p-8 border border-luxury-border shadow-xl flex flex-col items-center text-center space-y-5">
              <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/nishya/carry_your_story_pink_arch.jpg"
                  alt="Nishya Atelier Campaign"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                  <span className="text-white text-xs uppercase tracking-[0.2em] font-semibold">
                    Atelier Collection 2026
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-luxury-gold">
                  Exclusive Release
                </span>
                <h3 className="font-serif text-xl font-bold text-luxury-charcoal">
                  Artisanal Creations Coming Soon
                </h3>
                <p className="text-xs text-luxury-muted font-light max-w-xs">
                  New seasonal silhouettes are being hand-sculpted in our Jaipur and Florence ateliers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      </section>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </>
  );
}
