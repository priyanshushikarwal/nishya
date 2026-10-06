"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { products as initialProducts } from "@/data/products";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function BestsellersShowcase() {
  const { addToCart } = useCart();

  // Initialize immediately with published products so it renders instantly on mobile & SSR
  const [bestsellers, setBestsellers] = useState<Product[]>(() => {
    const valid = initialProducts.filter(
      (p) =>
        p.slug !== "penguin-bucket-rope-bag" &&
        p.slug !== "bear-bucket-rope-bag" &&
        !p.slug.includes("penguin") &&
        !p.slug.includes("bear-bucket")
    );
    const featured = valid.filter((p) => p.featured);
    return featured.length > 0 ? featured : valid.slice(0, 6);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadBestsellers = () => {
      getProducts().then((all) => {
        if (all && all.length > 0) {
          const valid = all.filter(
            (p) =>
              p.slug !== "penguin-bucket-rope-bag" &&
              p.slug !== "bear-bucket-rope-bag" &&
              !p.slug.includes("penguin") &&
              !p.slug.includes("bear-bucket")
          );
          const featured = valid.filter((p) => p.featured);
          const list = featured.length > 0 ? featured : valid.slice(0, 6);
          if (list.length > 0) {
            setBestsellers(list);
          }
        }
      });
    };

    loadBestsellers();
    window.addEventListener("nishya_products_updated", loadBestsellers);
    return () => window.removeEventListener("nishya_products_updated", loadBestsellers);
  }, []);

  const currentItem = bestsellers[currentIndex] || bestsellers[0];
  if (!currentItem) return null;

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % bestsellers.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + bestsellers.length) % bestsellers.length);
  };

  const handleQuickAdd = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentItem) {
      addToCart(currentItem, 1);
      setAdded(true);
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate(35);
        } catch {}
      }
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <section className="relative w-full bg-white pt-6 pb-12 sm:pb-16 border-b border-luxury-border/60">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header: BESTSELLERS on Left, VIEW ALL PRODUCTS on Right */}
        <div className="flex items-baseline justify-between mb-4 sm:mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] uppercase">
            BESTSELLERS
          </h2>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-medium tracking-wider text-[#222222] hover:text-[#C45E35] underline underline-offset-4 uppercase transition-colors"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>

        {/* Big Featured Showcase Card */}
        <div className="relative w-full max-w-[640px] lg:max-w-[720px] mx-auto bg-[#FAF7F3] rounded-2xl sm:rounded-3xl overflow-hidden border border-luxury-border/70 shadow-xs">
          {/* Card Media Container (DIV container, NOT a Link!) */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden bg-white select-none">
            {/* The Image Link only covers the image */}
            <Link
              href={`/product/${currentItem.slug}`}
              className="group block relative w-full h-full cursor-pointer"
              aria-label={`View ${currentItem.name}`}
            >
              <Image
                src={currentItem.image}
                alt={currentItem.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </Link>

            {/* Floating Circular Terracotta Shopping Bag Button (Independent Sibling, NOT inside Link!) */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`absolute bottom-4 right-4 z-30 w-14 h-14 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer pointer-events-auto ${
                added
                  ? "bg-green-600 scale-105"
                  : "bg-[#C45E35] hover:bg-[#A94C27] hover:scale-110 active:scale-95"
              }`}
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              aria-label={`Add ${currentItem.name} to bag`}
              title="Add to Bag"
            >
              {added ? (
                <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              ) : (
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
              )}
            </button>

            {/* Side Navigation Arrows (< and >) */}
            {bestsellers.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-luxury-charcoal flex items-center justify-center shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100 active:scale-90 pointer-events-auto"
                  aria-label="Previous bestseller"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-luxury-charcoal flex items-center justify-center shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100 active:scale-90 pointer-events-auto"
                  aria-label="Next bestseller"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="p-4 sm:p-6 bg-white space-y-2.5">
            <Link href={`/product/${currentItem.slug}`}>
              <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#1F1E24] hover:text-[#C45E35] uppercase tracking-wide leading-snug transition-colors">
                {currentItem.name}
              </h3>
            </Link>

            <div className="flex items-baseline gap-2.5 pt-0.5">
              {currentItem.originalPrice && (
                <span className="text-xs sm:text-sm text-neutral-400 line-through font-sans">
                  {formatPrice(currentItem.originalPrice)}
                </span>
              )}
              <span className="text-base sm:text-lg font-bold text-[#1F1E24] font-serif">
                {formatPrice(currentItem.price)}
              </span>
            </div>

            {/* Full-width Add to Bag Button for 100% reliable 1-tap on all mobile phones */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full mt-2 py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-white transition-all duration-300 shadow-md cursor-pointer min-h-[48px] ${
                added
                  ? "bg-green-600 scale-[1.01]"
                  : "bg-[#1E1D22] hover:bg-[#C45E35] active:scale-[0.99]"
              }`}
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • {formatPrice(currentItem.price)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
