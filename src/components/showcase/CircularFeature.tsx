"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Check, Star } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface CircularFeatureProps {
  content?: Record<string, any>;
}

export function CircularFeature({ content }: CircularFeatureProps = {}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [bag, setBag] = useState<Product | null>(null);

  const loadData = () => {
    getProducts().then((all) => {
      setBag(all[0] || null);
    });
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nishya_products_updated", handleUpdate);
    return () => window.removeEventListener("nishya_products_updated", handleUpdate);
  }, []);

  const pyramidBag = bag;

  const handleAdd = () => {
    if (!pyramidBag) return;
    addToCart(pyramidBag, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!pyramidBag) return null;

  const tagline = content?.tagline || "The Signature Safari";
  const subtitle = content?.subtitle || "Where artisanal craftsmanship meets everyday elegance";

  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-14 sm:py-20 lg:py-28 bg-[#F9F6F1] overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-bl from-[#E8D5C0]/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-[#D4C4B0]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1360px] mx-auto">
        {/* ====== SECTION HEADER ====== */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16 relative z-10">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] font-semibold text-[#B08D57] block mb-3">
            ✦ Featured Collection ✦
          </span>
          <h2 className="font-serif text-[26px] sm:text-[34px] md:text-[42px] lg:text-5xl font-normal text-[#1F1E24] leading-tight">
            {tagline}
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8178] mt-3 max-w-md mx-auto leading-relaxed font-light">
            {subtitle}
          </p>
          <div className="w-12 h-[1.5px] bg-[#B08D57]/50 mx-auto mt-4" />
        </div>

        {/* ====== MAIN CONTENT GRID ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 items-center">

          {/* ====== PRODUCT SHOWCASE (Left side) ====== */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            {/* Warm ambient glow behind product */}
            <div className="absolute w-[280px] sm:w-[380px] lg:w-[460px] h-[280px] sm:h-[380px] lg:h-[460px] rounded-full bg-gradient-to-br from-[#F0E4D4] via-[#EDE0D0]/60 to-transparent pointer-events-none" />

            {/* Decorative arch frame */}
            <div className="relative w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[520px] mx-auto">
              {/* Arch background shape */}
              <div className="absolute inset-x-4 top-0 bottom-8 rounded-t-[200px] sm:rounded-t-[240px] bg-gradient-to-b from-[#EDE3D5] via-[#F3EBE0] to-[#F9F6F1] border border-[#D9CDBC]/40" />

              {/* Product image */}
              <Link
                href={`/product/${pyramidBag.slug}`}
                className="relative z-10 w-full aspect-[3/4] flex items-center justify-center p-6 sm:p-8 cursor-pointer block"
                aria-label={`View ${pyramidBag.name}`}
              >
                <div className="relative w-full h-full transition-transform duration-700 hover:scale-[1.04]">
                  <Image
                    src="/images/nishya/product_pink_safari_isolated.png"
                    alt={pyramidBag.name}
                    fill
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 440px, 520px"
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                    priority
                  />
                </div>
              </Link>

              {/* Floating badge — Bestseller */}
              <div className="absolute top-6 sm:top-10 right-4 sm:right-6 z-20 bg-[#1F1E24] text-white px-3.5 py-1.5 rounded-full shadow-lg">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold">
                  ★ Bestseller
                </span>
              </div>

              {/* Floating badge — Save 50% */}
              <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-[#E8DFD2] shadow-md">
                <span className="text-[9px] uppercase tracking-[0.15em] text-[#8A8178] font-semibold block">Save</span>
                <span className="text-lg sm:text-xl font-serif font-bold text-[#B08D57]">50%</span>
              </div>
            </div>
          </div>

          {/* ====== PRODUCT DETAILS (Right side) ====== */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 text-center lg:text-left relative z-10">
            {/* Category + Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-semibold text-[#B08D57]">
                {pyramidBag.category}
              </span>
              <span className="text-[#D9CDBC]">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#B08D57] text-[#B08D57]" />
                <span className="text-[11px] font-semibold text-[#1F1E24]">{pyramidBag.rating}</span>
                <span className="text-[10px] text-[#8A8178]">({pyramidBag.reviewCount})</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="font-serif text-[28px] sm:text-[34px] md:text-[38px] font-normal text-[#1F1E24] leading-[1.15] tracking-tight">
              {pyramidBag.tagline || pyramidBag.name}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-[15px] text-[#8A8178] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              {pyramidBag.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline justify-center lg:justify-start gap-3 pt-1">
              <span className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1F1E24]">
                {formatPrice(pyramidBag.price)}
              </span>
              {pyramidBag.originalPrice && (
                <span className="text-sm text-[#B5AEA5] line-through">
                  {formatPrice(pyramidBag.originalPrice)}
                </span>
              )}
            </div>

            {/* Key Details — Clean Minimal */}
            <div className="space-y-2.5 py-4 border-y border-[#E8DFD2] max-w-lg mx-auto lg:mx-0">
              {[
                { label: "Material", value: pyramidBag.material },
                { label: "Dimensions", value: pyramidBag.dimensions },
                { label: "Color", value: pyramidBag.color },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-[#8A8178] font-medium">{spec.label}</span>
                  <span className="text-[#1F1E24] font-medium text-right max-w-[60%]">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <button
                onClick={handleAdd}
                disabled={added}
                className="w-full sm:flex-1 flex items-center justify-center gap-2.5 py-4 px-8 rounded-full bg-[#1F1E24] text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#B08D57] transition-all duration-300 shadow-lg shadow-[#1F1E24]/15 hover:shadow-xl cursor-pointer min-h-[52px] group"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#B08D57] group-hover:text-white transition-colors" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <Link
                href={`/product/${pyramidBag.slug}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-full border border-[#D9CDBC] hover:border-[#1F1E24] text-[#1F1E24] text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#1F1E24] hover:text-white transition-all duration-300 cursor-pointer min-h-[52px] group"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
