"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    clearCart,
    freeShippingThreshold,
    isFreeShipping,
    freeShippingRemaining,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "LUXE50" || promoCode.trim().toUpperCase() === "NISHYA" || promoCode.trim().toUpperCase() === "PURSIA") {
      setDiscountApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try LUXE50 for promotional preview.");
    }
  };

  const promoDiscount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const shippingFee = isFreeShipping ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

  return (
    <CanvasWrapper>
      <Header />

      <main className="px-4 sm:px-6 md:px-8 lg:px-14 py-6 sm:py-10 lg:py-16 overflow-x-clip">
        <div className="w-full max-w-[1360px] mx-auto">
          {/* Header */}
          <div className="border-b border-luxury-border pb-4 sm:pb-6 mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              Your Bag
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-charcoal mt-1">
              Shopping Bag & Order Summary
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="py-16 sm:py-24 text-center max-w-md mx-auto space-y-4 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-luxury-soft mx-auto flex items-center justify-center text-luxury-muted">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 opacity-40" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-luxury-charcoal">
                Your luxury bag is empty
              </h2>
              <p className="text-xs text-luxury-muted font-light leading-relaxed">
                Explore our current haute collection of handcrafted Florentine leather handbags and accessories.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-widest font-semibold hover:bg-luxury-dark transition-all min-h-[48px]"
                >
                  <span>Explore Handbags</span>
                  <ArrowRight className="w-4 h-4 text-luxury-gold" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Items List (8 cols on lg:) */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                {/* Shipping Progress Banner */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-luxury-soft border border-luxury-border text-xs">
                  <div className="flex justify-between font-medium text-luxury-charcoal mb-1.5">
                    <span className="truncate pr-2">
                      {isFreeShipping ? (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Free White-Glove Express Delivery Unlocked!
                        </span>
                      ) : (
                        <>
                          Add <strong className="text-luxury-gold">{formatPrice(freeShippingRemaining)}</strong> more for free delivery
                        </>
                      )}
                    </span>
                    <span className="font-bold">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
                  </div>
                  <div className="w-full bg-luxury-border h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-luxury-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-luxury-border border-b border-luxury-border">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}`}
                      className="py-4 sm:py-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-3 sm:gap-6 items-center w-full sm:w-auto">
                        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-luxury-soft shrink-0 border border-luxury-border">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-luxury-gold font-bold">
                            {item.product.category}
                          </span>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal hover:text-luxury-gold transition-colors block line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-luxury-muted">
                            Color: {item.selectedColor || "Signature"}
                          </p>
                          <span className="text-xs font-bold text-luxury-charcoal sm:hidden block pt-0.5">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-none border-luxury-border/60">
                        {/* Touch Quantity Counter */}
                        <div className="flex items-center border border-luxury-border rounded-full overflow-hidden bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-luxury-soft text-luxury-muted cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-luxury-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-luxury-soft text-luxury-muted cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[70px]">
                          <span className="font-serif text-xs sm:text-sm font-bold text-luxury-charcoal">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="w-9 h-9 flex items-center justify-center text-luxury-muted hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Link
                    href="/products"
                    className="text-xs uppercase tracking-wider text-luxury-muted hover:text-luxury-charcoal font-semibold transition-colors py-1"
                  >
                    ← Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-xs text-luxury-muted hover:text-red-600 transition-colors cursor-pointer py-1"
                  >
                    Empty Bag
                  </button>
                </div>
              </div>

              {/* Order Summary Sidebar (4 cols on lg:, full width on mobile) */}
              <div className="lg:col-span-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-luxury-soft/60 border border-luxury-border space-y-5 sm:space-y-6">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-luxury-charcoal border-b border-luxury-border pb-3 sm:pb-4">
                  Summary
                </h3>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-xs text-luxury-muted font-semibold uppercase tracking-wider block">
                    Promotional Atelier Code
                  </label>
                  <div className="flex rounded-full overflow-hidden border border-luxury-border bg-white focus-within:border-luxury-gold">
                    <input
                      type="text"
                      placeholder="Try LUXE50"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs uppercase text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0 min-h-[44px]"
                    >
                      Apply
                    </button>
                  </div>
                  {discountApplied && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✓ VIP Code applied: 10% privilege discount
                    </p>
                  )}
                  {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
                </form>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 text-xs pt-2 border-t border-luxury-border">
                  <div className="flex justify-between text-luxury-muted">
                    <span>Subtotal</span>
                    <span className="font-bold text-luxury-charcoal">{formatPrice(subtotal)}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Privilege Discount</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-luxury-muted">
                    <span>Estimated Shipping</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="text-emerald-700 font-semibold">Complimentary</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-luxury-border flex justify-between text-sm sm:text-base font-serif font-bold text-luxury-charcoal">
                    <span>Estimated Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg shadow-luxury-charcoal/20 min-h-[48px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-luxury-gold" />
                </Link>

                <div className="text-center flex items-center justify-center gap-2 text-[11px] text-luxury-muted pt-1">
                  <ShieldCheck className="w-4 h-4 text-luxury-gold" />
                  <span>256-Bit SSL Encrypted Luxury Checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </CanvasWrapper>
  );
}
