"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

export function PromoBanner() {
  const [promoProduct, setPromoProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then((all) => {
      if (all && all.length > 0) {
        setPromoProduct(all[1] || all[0]);
      }
    });
  }, []);

  if (!promoProduct) return null;

  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-10 sm:py-14 lg:py-20 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto">
        {/* Dark Charcoal Container with Rounded Corners */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#1E1D22] text-white p-6 sm:p-10 lg:p-16 overflow-hidden shadow-2xl border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Subtle Decorative Linework */}
          <div className="hidden sm:block absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
          <div className="hidden sm:block absolute right-10 -bottom-20 w-72 h-72 rounded-full border border-dashed border-luxury-gold/15 pointer-events-none" />

          {/* EDITORIAL CONTENT */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <Sparkles className="w-3 h-3 text-luxury-gold shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-luxury-gold-light">
                Capsule Collection
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              New Arrivals <br />
              <span className="italic font-normal font-serif text-luxury-gold-light">
                Autumn / Winter Release
              </span>
            </h3>

            <p className="text-xs sm:text-sm md:text-base text-white/70 font-sans font-light max-w-lg mx-auto sm:mx-0 leading-relaxed">
              Discover our latest collection, crafted for modern elegance. Imbued with sculptural
              contours, whisper-soft calfskin, and hand-finished gilded brass hardware.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 max-w-md mx-auto sm:mx-0">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-lg shadow-luxury-gold/25 cursor-pointer min-h-[48px] group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/product/${promoProduct.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full border border-white/20 hover:border-white text-white/90 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors min-h-[48px]"
              >
                <span>View Spotlight</span>
              </Link>
            </div>
          </div>

          {/* LARGE PROMINENT HANDBAG IMAGE */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-2 sm:pt-4 lg:pt-0">
            {/* Ambient gold glow */}
            <div className="absolute w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-luxury-gold/10 blur-2xl pointer-events-none" />

            <Link
              href={`/product/${promoProduct.slug}`}
              className="relative w-[220px] sm:w-[300px] md:w-[360px] lg:w-[420px] h-[220px] sm:h-[300px] md:h-[360px] lg:h-[400px] transition-transform duration-700 hover:scale-105 mx-auto block cursor-pointer group"
              aria-label={`View ${promoProduct.name}`}
            >
              <Image
                src={promoProduct.image}
                alt={promoProduct.name}
                fill
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 360px, 420px"
                className="object-contain drop-shadow-2xl"
              />

              {/* Small spotlight tag */}
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15 text-right group-hover:border-luxury-gold transition-colors">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/70 block">
                  {promoProduct.name}
                </span>
                <span className="text-xs font-bold text-luxury-gold-light">
                  {formatPrice(promoProduct.price)}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
