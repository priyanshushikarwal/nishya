"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HandwrittenLabel } from "@/components/decorative/HandwrittenLabel";
import { InstagramIcon } from "@/components/decorative/SocialIcons";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";

export function InstagramGallery() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then((all) => {
      setProducts(all.slice(0, 6));
    });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-semibold text-luxury-gold">
            #NISHYA BAGS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal">
            Unbox Your <span className="italic font-normal text-luxury-gold">New Favourite</span>
          </h2>
          <div className="pt-1">
            <HandwrittenLabel rotate="left" color="gold" className="text-sm sm:text-base lg:text-xl">
              Tag @nishya.luxury to be featured in our seasonal lookbook
            </HandwrittenLabel>
          </div>
        </div>

        {/* Gallery with Real Products */}
        <div className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/product/${prod.slug}`}
              className="group relative aspect-[3/4] w-[190px] sm:w-[220px] lg:w-auto shrink-0 snap-start rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-luxury-border shadow-xs block cursor-pointer"
            >
              <Image
                src={prod.image}
                alt={`Nishya ${prod.name}`}
                fill
                sizes="(max-width: 640px) 190px, (max-width: 1024px) 220px, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-luxury-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
                <div className="self-end">
                  <InstagramIcon className="w-5 h-5 text-white/90" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">{prod.name}</span>
                  <span className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                    {prod.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
