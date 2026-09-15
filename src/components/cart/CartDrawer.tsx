"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
    freeShippingThreshold,
    freeShippingRemaining,
    isFreeShipping,
  } = useCart();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-luxury-dark/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over panel (Mobile: 100% full-screen width, Desktop sm: max-w-md) */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex pl-0 sm:pl-6">
        <aside
          className="w-full bg-white shadow-2xl flex flex-col justify-between border-l border-luxury-border animate-in slide-in-from-right duration-300 h-full overflow-hidden"
          aria-label="Shopping Bag"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-luxury-border flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-luxury-charcoal">
                Your Shopping Bag
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-luxury-soft text-luxury-muted">
                {totalItems}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="w-11 h-11 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-luxury-soft border-b border-luxury-border shrink-0">
            <div className="flex justify-between items-center text-xs text-luxury-charcoal font-medium mb-1.5">
              <span className="truncate pr-2">
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-semibold text-[11px] sm:text-xs">
                    ✓ Compliments of Pursia: Free Delivery Unlocked!
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs">
                    Add <strong className="text-luxury-gold">{formatPrice(freeShippingRemaining)}</strong> for free delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] text-luxury-muted font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-luxury-border h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-luxury-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-luxury-border overscroll-contain">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-luxury-soft flex items-center justify-center mb-4 text-luxury-muted">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif text-lg text-luxury-charcoal font-medium mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-luxury-muted max-w-xs mb-6">
                  Discover our curated collection of architectural leather bags and timeless silhouettes.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-widest font-semibold hover:bg-luxury-dark transition-all cursor-pointer min-h-[44px]"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}`} className="py-3.5 sm:py-4 flex gap-3 sm:gap-4">
                  <div className="relative w-18 sm:w-20 h-22 sm:h-24 rounded-xl bg-luxury-soft overflow-hidden shrink-0 border border-luxury-border">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-xs sm:text-sm font-semibold text-luxury-charcoal hover:text-luxury-gold transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="text-luxury-muted hover:text-red-500 p-1.5 transition-colors cursor-pointer -mr-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-luxury-muted mt-0.5">
                        Color: {item.selectedColor || "Signature"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Touch-Friendly Quantity Toggles (min 40px target) */}
                      <div className="flex items-center border border-luxury-border rounded-full overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-luxury-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-luxury-charcoal">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* STICKY BOTTOM CHECKOUT FOOTER (Always visible without scrolling) */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-luxury-border bg-white shadow-lg space-y-3 shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-luxury-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-luxury-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-luxury-muted">
                  <span>Shipping</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-medium">Free</span>
                    ) : (
                      formatPrice(250)
                    )}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-luxury-border flex justify-between text-sm font-bold text-luxury-charcoal">
                  <span>Total</span>
                  <span>{formatPrice(subtotal + (isFreeShipping ? 0 : 250))}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-md shadow-luxury-charcoal/20 cursor-pointer min-h-[48px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-luxury-gold" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full block text-center py-2 text-xs uppercase tracking-wider font-semibold text-luxury-muted hover:text-luxury-charcoal transition-colors"
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
