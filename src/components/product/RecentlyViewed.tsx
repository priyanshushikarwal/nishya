"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { products } from "@/data/products";
import { ProductCard } from "@/components/discovery/ProductCard";

interface RecentlyViewedProps {
  currentSlug: string;
}

const STORAGE_KEY = "pursia_recently_viewed_slugs";

export function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      // 1. Read existing recent slugs from storage
      const raw = localStorage.getItem(STORAGE_KEY);
      let slugs: string[] = raw ? JSON.parse(raw) : [];

      // 2. Filter out currentSlug to show other recently viewed pieces
      const otherSlugs = slugs.filter((s) => s !== currentSlug);

      // 3. Resolve to actual products
      const resolved = otherSlugs
        .map((s) => products.find((p) => p.slug === s))
        .filter(Boolean) as Product[];

      setRecentProducts(resolved.slice(0, 4));

      // 4. Update storage with currentSlug at the beginning (up to 8 items)
      const updated = [currentSlug, ...slugs.filter((s) => s !== currentSlug)].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable or disabled
    }
  }, [currentSlug]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24 pt-10 sm:pt-16 border-t border-luxury-border space-y-6 sm:space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold block">
            Your Private Salon
          </span>
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-luxury-charcoal mt-1">
            Recently Viewed
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {recentProducts.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
