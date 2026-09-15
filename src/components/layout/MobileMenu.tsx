"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Phone, Mail, Sparkles } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent background scrolling while mobile menu is open
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

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-luxury-dark/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl z-10 flex flex-col justify-between p-6 border-r border-luxury-border animate-in slide-in-from-left duration-300 overflow-y-auto"
        aria-label="Mobile Navigation"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-luxury-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-luxury-charcoal text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
                P
              </span>
              <span className="font-serif text-2xl font-bold tracking-[0.18em] uppercase text-luxury-charcoal">
                Pursia
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with generous touch height */}
          <nav className="space-y-1 divide-y divide-luxury-border/50">
            <div className="py-2 space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <span>Home</span>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Shop All Pieces</span>
                  <span className="text-[10px] bg-luxury-gold text-white px-2 py-0.5 rounded-full font-sans uppercase tracking-wider font-bold">
                    12 Items
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
              <Link
                href="/products?category=Handbags"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <span>Handbags</span>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
              <Link
                href="/products?category=Clutches"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <span>Clutches</span>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
              <Link
                href="/products?category=Totes"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <span>Everyday Totes</span>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
              <Link
                href="/products?category=Wallets"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
              >
                <span>Wallets & SLGs</span>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
            </div>

            <div className="py-3 space-y-1">
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 px-3 text-sm text-luxury-charcoal hover:text-luxury-gold font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                <span>New Arrivals Capsule</span>
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 text-sm text-luxury-charcoal hover:text-luxury-gold font-medium"
              >
                <span>Shopping Bag</span>
                <span className="text-xs text-luxury-gold font-semibold">View Bag</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer info in mobile drawer */}
        <div className="pt-6 border-t border-luxury-border space-y-4">
          <div className="space-y-1.5 text-xs text-luxury-muted">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>concierge@pursia.luxury</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>+91 1800 290 888</span>
            </div>
          </div>
          <p className="text-xs text-luxury-muted/80 italic font-serif leading-relaxed">
            &ldquo;Crafted for elegance, designed for confidence.&rdquo;
          </p>
        </div>
      </aside>
    </div>
  );
}
