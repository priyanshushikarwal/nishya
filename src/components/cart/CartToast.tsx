"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, X, ArrowRight } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function CartToast() {
  const { openCart, totalItems } = useCart();
  const [toastData, setToastData] = useState<{
    product: Product;
    color?: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleCartAdd = (e: any) => {
      const { product, color } = e.detail || {};
      if (!product) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      setToastData({ product, color });
      setIsVisible(true);

      // Auto dismiss after 4 seconds
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    window.addEventListener("nishya_cart_item_added", handleCartAdd);
    return () => {
      window.removeEventListener("nishya_cart_item_added", handleCartAdd);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isVisible || !toastData) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[380px] z-[99995] select-none animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#1E1D22] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-luxury-gold/40 flex items-center justify-between gap-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/15">
          <Image
            src={toastData.product.image}
            alt={toastData.product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Added to Bag</span>
          </div>
          <h4 className="font-serif text-xs font-bold text-white truncate mt-0.5">
            {toastData.product.name}
          </h4>
          <span className="text-[11px] text-luxury-gold font-serif font-bold">
            {formatPrice(toastData.product.price)}
          </span>
        </div>

        {/* Action Button: View Bag */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              openCart();
            }}
            className="py-2 px-3 rounded-full bg-luxury-gold hover:bg-luxury-gold-light active:scale-95 text-white text-[11px] uppercase tracking-wider font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1"
          >
            <span>Bag</span>
            <span className="bg-black/20 rounded-full px-1.5 py-0.2 text-[10px]">
              {totalItems}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
