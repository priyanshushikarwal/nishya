"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ShoppingBag } from "lucide-react";

interface ReelItem {
  id: string;
  image: string;
  subtitle: string;
  productName: string;
  productPrice: string;
  productThumb: string;
  productLink: string;
}

const REELS_DATA: ReelItem[] = [
  {
    id: "reel-1",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    subtitle: "your comfort contribution.",
    productName: "Candles Set Vanilla",
    productPrice: "₹1,250",
    productThumb: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80",
    productLink: "/products",
  },
  {
    id: "reel-2",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    subtitle: "Handcrafted pure woven touch.",
    productName: "Earthline - Woven Cushion Cover Set Of 2",
    productPrice: "₹1,850",
    productThumb: "/images/nishya/terracotta_artisan_bestseller.jpg",
    productLink: "/products",
  },
  {
    id: "reel-3",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    subtitle: "Warm sunlit living spaces.",
    productName: "Yellow Cover & Clutch",
    productPrice: "₹950",
    productThumb: "/images/products/tropical-palm-vanity-clutch/1.webp",
    productLink: "/products",
  },
];

export function WatchAndBuySection() {
  return (
    <section className="relative w-full bg-white py-10 sm:py-14 border-b border-luxury-border/60">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#1A1A1A]">
            Watch and Buy
          </h2>
        </div>

        {/* 3 Vertical Reel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {REELS_DATA.map((reel) => (
            <div
              key={reel.id}
              className="group relative aspect-[9/16] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-neutral-900 border border-neutral-200/50"
            >
              {/* Media Image */}
              <Image
                src={reel.image}
                alt={reel.productName}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrims for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35 pointer-events-none" />

              {/* Play Badge Icon on Top-Right */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>

              {/* Subtitle Text in middle/top */}
              <div className="absolute top-12 left-4 right-4">
                <p className="text-white text-xs sm:text-sm font-sans font-light drop-shadow-sm leading-relaxed">
                  {reel.subtitle}
                </p>
              </div>

              {/* Pinned Product Card at Bottom */}
              <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/40 flex items-center gap-2.5">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                  <Image
                    src={reel.productThumb}
                    alt={reel.productName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-medium text-neutral-900 truncate">
                    {reel.productName}
                  </h4>
                  <span className="text-[11px] font-bold text-[#C45E35]">
                    {reel.productPrice}
                  </span>
                </div>

                <Link
                  href={reel.productLink}
                  className="w-8 h-8 rounded-full bg-[#C45E35] text-white flex items-center justify-center shrink-0 hover:bg-[#A94C27] transition-colors"
                  aria-label={`Buy ${reel.productName}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
