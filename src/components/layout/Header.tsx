"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu, Heart, Package, LogOut, LogIn, UserPlus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { SearchModal } from "@/components/cart/SearchModal";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  const { totalItems, openCart } = useCart();
  const { user, profile, isAuthenticated, signOut } = useCustomerAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-luxury-border/60 transition-all duration-300">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12 h-14 sm:h-16 md:h-20 flex items-center justify-between">
          {/* ========================================================= */}
          {/* MOBILE NAVBAR (< md): ☰ SEARCH | NISHYA | ♡ 🛍 👤        */}
          {/* ========================================================= */}
          <div className="flex md:hidden w-full items-center justify-between">
            {/* Left: Hamburger & Search */}
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

            {/* Center: NISHYA brand logo */}
            <div className="flex items-center justify-center">
              <Link href="/" className="group flex items-center justify-center py-1">
                <Image
                  src="/images/nishya/nishya-logo.png"
                  alt="Nishya — Bags For Your Story"
                  width={130}
                  height={35}
                  priority
                  className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </Link>
            </div>

            {/* Right: Wishlist, Shopping Bag, Account */}
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
                href={isAuthenticated ? "/orders" : "/login"}
                className={`w-10 h-10 flex items-center justify-center transition-colors ${
                  isAuthenticated ? "text-luxury-gold" : "text-luxury-charcoal hover:text-luxury-gold"
                }`}
                aria-label={isAuthenticated ? "My Orders" : "Sign In"}
                title={isAuthenticated ? "My Orders" : "Sign In"}
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP NAVBAR (>= md)                                   */}
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

              <Link href="/" className="group flex items-center py-1">
                <Image
                  src="/images/nishya/nishya-logo.png"
                  alt="Nishya — Bags For Your Story"
                  width={160}
                  height={43}
                  priority
                  className="h-9 md:h-10 lg:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
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

              {/* User Account Menu with Luxury Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isAuthenticated
                      ? "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 hover:bg-luxury-gold/20"
                      : "hover:bg-luxury-soft text-luxury-charcoal hover:text-luxury-gold"
                  }`}
                  aria-label="Client Account"
                  title={isAuthenticated ? `Client: ${profile?.full_name || user?.email}` : "Client Portal"}
                >
                  <User className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-luxury-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {isAuthenticated ? (
                      <div className="space-y-1">
                        <div className="px-3 py-2.5 border-b border-luxury-border/60">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-gold block">
                            Privé Client
                          </span>
                          <p className="text-xs font-serif font-bold text-luxury-charcoal truncate">
                            {profile?.full_name || "Nishya Patron"}
                          </p>
                          <p className="text-[11px] text-luxury-muted truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
                        >
                          <Package className="w-4 h-4 text-luxury-gold" />
                          <span>My Orders & Tracking</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="px-3 py-2 border-b border-luxury-border/60">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-gold block">
                            Nishya Privé
                          </span>
                          <p className="text-xs text-luxury-muted">
                            Sign in to track bespoke orders and manage your collection.
                          </p>
                        </div>

                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-luxury-gold" />
                          <span>Sign In</span>
                        </Link>

                        <Link
                          href="/signup"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors"
                        >
                          <UserPlus className="w-4 h-4 text-luxury-gold" />
                          <span>Create Account</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Bag Button */}
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
