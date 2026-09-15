"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SearchModal } from "@/components/cart/SearchModal";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  const { totalItems, openCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-luxury-border/60 transition-all duration-300">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12 h-14 sm:h-16 md:h-20 flex items-center justify-between">
          {/* ========================================================= */}
          {/* MOBILE NAVBAR (< md): ☰ SEARCH | PURSIA | ♡ 🛍 👤        */}
          {/* ========================================================= */}
          <div className="flex md:hidden w-full items-center justify-between">
            {/* Left: Hamburger & Search (Thin line icons, no boxes) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Center: PURSIA wordmark */}
            <div className="flex items-center justify-center">
              <Link href="/" className="group">
                <span className="font-serif text-2xl font-bold tracking-[0.22em] uppercase text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
                  PURSIA
                </span>
              </Link>
            </div>

            {/* Right: Wishlist, Shopping Bag, Account (Thin line icons, no boxes) */}
            <div className="flex items-center gap-0.5">
              <Link
                href="/products"
                className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
              </Link>

              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                aria-label={`Shopping bag, ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-luxury-gold text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                href="/products"
                className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP NAVBAR (>= md): PRESERVED ORIGINAL STRUCTURE      */}
          {/* ========================================================= */}
          <div className="hidden md:flex w-full items-center justify-between">
            {/* Desktop Left: Menu toggle & Brand */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 rounded-full border border-luxury-border/80 flex items-center justify-center text-luxury-charcoal hover:border-luxury-charcoal hover:bg-luxury-soft transition-all duration-200 cursor-pointer shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <Link href="/" className="group flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-luxury-charcoal group-hover:text-luxury-gold transition-colors duration-300">
                  PURSIA
                </span>
              </Link>
            </div>

            {/* Desktop Center: Editorial Links */}
            <nav className="flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-[0.2em] font-medium text-luxury-muted">
              <Link
                href="/products"
                className="hover:text-luxury-charcoal transition-colors hover:border-b hover:border-luxury-charcoal pb-0.5"
              >
                Collection
              </Link>
              <Link
                href="/products?category=Handbags"
                className="hover:text-luxury-charcoal transition-colors hover:border-b hover:border-luxury-charcoal pb-0.5"
              >
                Handbags
              </Link>
              <Link
                href="/products?category=Clutches"
                className="hover:text-luxury-charcoal transition-colors hover:border-b hover:border-luxury-charcoal pb-0.5"
              >
                Clutches
              </Link>
              <Link
                href="/products?category=Totes"
                className="hover:text-luxury-charcoal transition-colors hover:border-b hover:border-luxury-charcoal pb-0.5"
              >
                Totes
              </Link>
            </nav>

            {/* Desktop Right: Search, Account & Cart */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer shrink-0"
                aria-label="Search collection"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                href="/products"
                className="w-10 h-10 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors shrink-0"
                aria-label="Account / Concierge"
                title="Luxury Concierge"
              >
                <User className="w-4 h-4" />
              </Link>

              <button
                onClick={openCart}
                className="relative w-10 h-10 rounded-full bg-luxury-soft hover:bg-luxury-charcoal hover:text-white flex items-center justify-center text-luxury-charcoal transition-all duration-200 cursor-pointer shrink-0"
                aria-label={`Shopping Bag, ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-luxury-gold text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
