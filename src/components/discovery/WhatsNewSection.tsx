"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Check } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface WhatsNewSectionProps {
  content?: Record<string, any>;
}

export function WhatsNewSection({ content }: WhatsNewSectionProps = {}) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([]);

  const loadData = () => {
    getProducts().then((all) => {
      setItems(all);
    });
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nishya_products_updated", handleUpdate);
    return () => window.removeEventListener("nishya_products_updated", handleUpdate);
  }, []);

  // Featured hero new arrival
  const featuredProduct = items[0];
  // Secondary new arrivals for 2-column grid
  const secondaryProducts = [items[1], items[2]].filter(Boolean);

  if (!featuredProduct) return null;

  const headingText = content?.heading || "What's New";
  const seasonText = content?.season || "Autumn / Winter 2026 Collection";

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <section className="block lg:hidden w-full bg-white px-4 sm:px-6 pt-10 sm:pt-14 pb-12 sm:pb-16 border-b border-luxury-border/60">
      <div className="w-full max-w-[600px] mx-auto space-y-8">
        {/* ========================================================= */}
        {/* 1. "WHAT'S NEW" HEADING (28–32px, Centered, Letter Spacing) */}
        {/* ========================================================= */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.28em] text-luxury-gold font-semibold block">
            {seasonText}
          </span>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-normal text-luxury-charcoal uppercase tracking-[0.16em]">
            {headingText}
          </h2>
          <div className="w-10 h-[1px] bg-luxury-gold/50 mx-auto mt-2" />
        </div>

        {/* ========================================================= */}
        {/* 2. FEATURED PRODUCT: LARGE EDITORIAL PRESENTATION         */}
        {/* ========================================================= */}
        <div className="w-full bg-[#FAF8F5] rounded-2xl p-4 sm:p-6 border border-luxury-border/80 shadow-xs space-y-4">
          <Link
            href={`/product/${featuredProduct.slug}`}
            className="block relative w-full aspect-square sm:aspect-4/3 rounded-xl overflow-hidden bg-white group cursor-pointer"
          >
            <Image
              src={featuredProduct.image}
              alt={featuredProduct.name}
              fill
              sizes="(max-width: 768px) 90vw, 500px"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {featuredProduct.badge && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-luxury-charcoal text-white text-[9px] uppercase tracking-[0.15em] font-semibold">
                {featuredProduct.badge}
              </span>
            )}
          </Link>

          {/* Product Details */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Link href={`/product/${featuredProduct.slug}`} className="group">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
                  {featuredProduct.name}
                </h3>
              </Link>
              <div className="text-right shrink-0">
                <span className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                  {formatPrice(featuredProduct.price)}
                </span>
                {featuredProduct.originalPrice && (
                  <span className="text-xs text-luxury-muted line-through ml-1.5">
                    {formatPrice(featuredProduct.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-luxury-muted leading-relaxed line-clamp-2">
              {featuredProduct.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                onClick={() => handleAddToCart(featuredProduct)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-luxury-gold transition-colors duration-200 cursor-pointer min-h-[44px]"
              >
                {addedId === featuredProduct.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <Link
                href={`/product/${featuredProduct.slug}`}
                className="inline-flex items-center justify-center py-3 px-4 rounded-full border border-luxury-charcoal/25 text-luxury-charcoal text-xs uppercase tracking-[0.15em] font-semibold hover:border-luxury-charcoal transition-colors min-h-[44px]"
              >
                Details
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. TWO-COLUMN COMPACT EDITORIAL GRID                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {secondaryProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#FAF8F5] rounded-xl p-3.5 border border-luxury-border/70 flex flex-col justify-between"
            >
              <Link
                href={`/product/${prod.slug}`}
                className="block relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-white mb-3 group cursor-pointer"
              >
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  sizes="45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.18em] text-luxury-gold font-semibold block truncate">
                  {prod.category}
                </span>
                <Link href={`/product/${prod.slug}`}>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal hover:text-luxury-gold transition-colors truncate">
                    {prod.name}
                  </h4>
                </Link>
                <div className="font-serif text-xs font-bold text-luxury-charcoal pt-0.5">
                  {formatPrice(prod.price)}
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(prod)}
                className="mt-3 w-full py-2 rounded-full border border-luxury-charcoal/30 hover:bg-luxury-charcoal hover:text-white text-luxury-charcoal text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors min-h-[38px] flex items-center justify-center cursor-pointer"
              >
                {addedId === prod.id ? "Added" : "+ Add"}
              </button>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 4. EXPLORE ALL LINK                                       */}
        {/* ========================================================= */}
        <div className="text-center pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-luxury-charcoal hover:text-luxury-gold transition-colors group"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5 text-luxury-gold group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
