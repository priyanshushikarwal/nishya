import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/discovery/ProductGrid";
import { products } from "@/data/products";

export function ProductDiscovery() {
  const discoveryProducts = products.slice(4, 8);

  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-luxury-border">
          <div className="max-w-2xl space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-gold">
                Curated Selection
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal leading-[1.15]">
              Discover the finest bags that combine <br className="hidden sm:inline" />
              <span className="italic font-normal text-luxury-gold">style, elegance</span> and perfection.
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-luxury-charcoal hover:text-luxury-gold transition-colors shrink-0 group py-1"
          >
            <span>Explore All 12 Pieces</span>
            <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Product Grid (2 on mobile, 4 on desktop) */}
        <ProductGrid products={discoveryProducts} columns={4} />
      </div>
    </section>
  );
}
