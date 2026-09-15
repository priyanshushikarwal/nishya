"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "editorial";
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  className = "",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      className={cn(
        "group flex flex-col justify-between transition-all duration-300 select-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div
        className={cn(
          "relative w-full rounded-xl sm:rounded-2xl bg-[#FAF7F2] overflow-hidden border border-luxury-border/60 transition-all duration-500 group-hover:border-luxury-gold/30 group-hover:shadow-md",
          variant === "compact" ? "aspect-square" : "aspect-[3/4]"
        )}
      >
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span
              className={cn(
                "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs",
                product.badge.includes("50%")
                  ? "bg-luxury-gold text-white"
                  : product.badge === "Bestseller"
                  ? "bg-luxury-charcoal text-white"
                  : "bg-white/90 text-luxury-charcoal border border-luxury-border"
              )}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Button (Min 44px tap target area) */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs",
            isWishlisted
              ? "text-red-600 fill-red-600"
              : "text-luxury-muted hover:text-luxury-charcoal hover:scale-105"
          )}
          aria-label={`Wishlist ${product.name}`}
        >
          <Heart
            className={cn("w-4 h-4", isWishlisted && "fill-current text-red-600")}
          />
        </button>

        {/* Product Images (Primary & Secondary Hover) */}
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              isHovered && product.secondaryImage ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
            )}
          />

          {product.secondaryImage && (
            <Image
              src={product.secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-700 ease-out absolute inset-0",
                isHovered ? "opacity-100 scale-105" : "opacity-0 pointer-events-none"
              )}
            />
          )}
        </Link>

        {/* Quick Add Overlay on Hover (Desktop md:) */}
        <div className="hidden md:block absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAdd}
            disabled={isAdded}
            className="w-full py-2.5 px-4 rounded-full bg-luxury-charcoal/95 hover:bg-luxury-charcoal text-white text-[11px] uppercase tracking-wider font-medium flex items-center justify-center gap-2 shadow-lg backdrop-blur-xs cursor-pointer transition-colors"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="pt-2.5 sm:pt-3.5 pb-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-luxury-gold">
            {product.category}
          </span>
          {product.rating && (
            <span className="text-[10px] sm:text-[11px] text-luxury-muted">★ {product.rating}</span>
          )}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="font-serif text-xs sm:text-sm md:text-base font-semibold text-luxury-charcoal hover:text-luxury-gold transition-colors block line-clamp-1"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-xs sm:text-sm font-bold text-luxury-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-[11px] text-luxury-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Mobile-only Touch-Friendly Add to Cart Bar (< md:) */}
        <div className="md:hidden pt-1.5">
          <button
            onClick={handleAdd}
            disabled={isAdded}
            className="w-full py-2 px-2.5 rounded-lg bg-luxury-soft active:bg-luxury-charcoal active:text-white text-luxury-charcoal text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-luxury-border/80 min-h-[38px]"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
