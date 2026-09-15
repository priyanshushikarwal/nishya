"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState<string>(
    product.color || product.colors?.[0]?.name || "Signature Edition"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Header: Brand, Category, Share Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-luxury-gold">
              PURSIA ATELIER
            </span>
            <span className="text-luxury-border">•</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-luxury-muted">
              {product.category}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-soft/80 hover:bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal text-xs font-medium transition-colors cursor-pointer border border-luxury-border/60"
            aria-label="Share this creation"
          >
            <Share2 className="w-3.5 h-3.5 text-luxury-gold" />
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Product Title */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold text-luxury-charcoal leading-[1.12] tracking-tight">
          {product.name}
        </h1>

        {/* Rating & Collector Reviews */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="flex items-center text-luxury-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-xs font-semibold text-luxury-charcoal">
            {product.rating || 4.9}
          </span>
          <span className="text-xs text-luxury-muted">
            ({product.reviewCount || 128} verified collector reviews)
          </span>
        </div>
      </div>

      {/* 2. Price Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-luxury-soft via-luxury-soft/60 to-white border border-luxury-border/80 flex items-baseline justify-between shadow-xs">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-luxury-charcoal tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm sm:text-base text-luxury-muted line-through font-light">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {discount > 0 && (
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full shadow-xs">
            Save {discount}%
          </span>
        )}
      </div>

      {/* 3. Short Editorial Excerpt */}
      {product.tagline && (
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-luxury-gold">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>&ldquo;{product.tagline}&rdquo;</span>
        </div>
      )}

      {/* 4. Color Swatches (Interactive Variants) */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-luxury-muted uppercase tracking-wider font-semibold">
              Selected Finish:
            </span>
            <span className="font-serif font-bold text-luxury-charcoal tracking-wide">
              {selectedColor}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all cursor-pointer p-0.5",
                  selectedColor === c.name
                    ? "border-luxury-charcoal scale-110 shadow-md"
                    : "border-transparent hover:scale-105 opacity-85 hover:opacity-100"
                )}
                title={c.name}
                aria-label={`Select color ${c.name}`}
              >
                <span
                  className="block w-full h-full rounded-full border border-black/15 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Quantity Selector & CTAs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-luxury-border rounded-full bg-white px-1 shadow-xs shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-11 flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal active:scale-95 transition-transform cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-bold text-luxury-charcoal min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-11 flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal active:scale-95 transition-transform cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary CTA: ADD TO BAG */}
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={cn(
              "flex-1 py-4 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer min-h-[50px] shadow-lg",
              isAdded
                ? "bg-emerald-700 text-white shadow-emerald-700/25"
                : "bg-luxury-charcoal hover:bg-luxury-dark active:scale-[0.99] text-white shadow-luxury-charcoal/20"
            )}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-luxury-gold" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary CTA: BUY IT NOW */}
        <button
          onClick={handleBuyNow}
          className="w-full py-4 px-6 rounded-full bg-luxury-gold hover:bg-luxury-gold-light active:scale-[0.99] text-white text-xs uppercase tracking-[0.22em] font-semibold shadow-md shadow-luxury-gold/25 transition-all duration-300 cursor-pointer min-h-[50px]"
        >
          Instant Buy Now
        </button>
      </div>

      {/* 6. Luxury Guarantees Strip */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-luxury-border/80 text-center text-[10px] sm:text-[11px] text-luxury-muted">
        <div className="flex flex-col items-center gap-1.5 p-1">
          <Truck className="w-4 h-4 text-luxury-gold" />
          <span className="font-medium text-luxury-charcoal">Express Courier</span>
          <span className="text-[9px] text-luxury-muted">Insured & Tracked</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-1 border-x border-luxury-border/60">
          <ShieldCheck className="w-4 h-4 text-luxury-gold" />
          <span className="font-medium text-luxury-charcoal">100% Authentic</span>
          <span className="text-[9px] text-luxury-muted">Atelier Certificate</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-1">
          <RefreshCw className="w-4 h-4 text-luxury-gold" />
          <span className="font-medium text-luxury-charcoal">14-Day Returns</span>
          <span className="text-[9px] text-luxury-muted">Complimentary</span>
        </div>
      </div>
    </div>
  );
}
