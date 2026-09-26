"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, Phone, Mail, Sparkles, Package, LogOut, LogIn, UserPlus } from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { categories as initialCategories, Category } from "@/data/categories";
import { getCategories } from "@/lib/services/products";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialCats = initialCategories.filter((c) => c.slug !== "all");

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, profile, isAuthenticated, signOut } = useCustomerAuth();
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCats);

  useEffect(() => {
    let isMounted = true;
    getCategories().then((data) => {
      if (isMounted && data && data.length > 0) {
        setCategoriesList(data.filter((c) => c.slug !== "all"));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
            <Link href="/" onClick={onClose} className="flex items-center py-1">
              <Image
                src="/images/nishya/nishya-logo.png"
                alt="Nishya — Bags For Your Story"
                width={130}
                height={35}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Client Account Section */}
          <div className="p-3.5 rounded-2xl bg-luxury-soft border border-luxury-border">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-gold block">
                    Signed In As
                  </span>
                  <div className="font-serif text-sm font-bold text-luxury-charcoal truncate">
                    {profile?.full_name || "Nishya Patron"}
                  </div>
                  <div className="text-[11px] text-luxury-muted truncate">
                    {user?.email}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-luxury-border/60">
                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-luxury-charcoal text-white text-xs font-semibold hover:bg-luxury-dark transition-colors"
                  >
                    <Package className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      onClose();
                      signOut();
                    }}
                    className="flex items-center justify-center p-2 rounded-xl border border-luxury-border hover:bg-red-50 text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-gold block">
                  Nishya Privé Client
                </span>
                <p className="text-xs text-luxury-muted leading-tight">
                  Sign in to track orders or create your account for checkout.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-luxury-charcoal text-white text-xs font-semibold hover:bg-luxury-dark transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-luxury-border text-luxury-charcoal text-xs font-semibold hover:bg-luxury-soft transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
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
                    Capsule
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-luxury-muted" />
              </Link>
            </div>

            {/* 2. All Categories Directory */}
            <div className="py-3 space-y-1">
              <div className="px-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-luxury-gold">
                  Categories
                </span>
                <span className="text-[10px] font-sans font-medium text-luxury-muted">
                  {categoriesList.length} Collections
                </span>
              </div>

              <div className="space-y-0.5">
                {categoriesList.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-serif font-semibold text-luxury-charcoal hover:bg-luxury-soft hover:text-luxury-gold transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    <ArrowRight className="w-4 h-4 text-luxury-muted group-hover:text-luxury-gold group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="py-3 space-y-1">
              <Link
                href="/orders"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 text-sm text-luxury-charcoal hover:text-luxury-gold font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-luxury-gold" />
                  <span>Track My Orders</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-luxury-muted" />
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
              <span>concierge@nishya.luxury</span>
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
