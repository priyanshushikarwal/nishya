"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/discovery/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductAccordions } from "@/components/product/ProductAccordions";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

import { getProductBySlug } from "@/lib/services/products";

interface ProductDetailPageClientProps {
  product: Product;
  related: Product[];
}

export function ProductDetailPageClient({
  product,
  related,
}: ProductDetailPageClientProps) {
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);
  const [isAddedMobile, setIsAddedMobile] = useState(false);

  // Sync with CMS updates if available
  useEffect(() => {
    setCurrentProduct(product);
    getProductBySlug(product.slug).then((fresh) => {
      if (fresh) setCurrentProduct(fresh);
    });
    const handleUpdate = () => {
      getProductBySlug(product.slug).then((fresh) => {
        if (fresh) setCurrentProduct(fresh);
      });
    };
    window.addEventListener("nishya_products_updated", handleUpdate);
    return () => window.removeEventListener("nishya_products_updated", handleUpdate);
  }, [product, product.slug]);

  // Initialize wishlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nishya_wishlist");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsWishlisted(list.includes(currentProduct.id));
      }
    } catch {
      // Storage unavailable
    }
  }, [currentProduct.id]);

  // Wishlist toggle handler
  const handleToggleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem("nishya_wishlist");
        let list: string[] = stored ? JSON.parse(stored) : [];
        if (next) {
          if (!list.includes(product.id)) list.push(product.id);
        } else {
          list = list.filter((id) => id !== product.id);
        }
        localStorage.setItem("nishya_wishlist", JSON.stringify(list));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Show floating mobile bottom bar when scrolled past 400px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowMobileBottomBar(true);
      } else {
        setShowMobileBottomBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileAddToCart = () => {
    addToCart(currentProduct, 1);
    setIsAddedMobile(true);
    setTimeout(() => setIsAddedMobile(false), 2000);
  };

  const galleryImages =
    currentProduct.gallery && currentProduct.gallery.length > 0
      ? currentProduct.gallery
      : [currentProduct.image, currentProduct.secondaryImage].filter(Boolean) as string[];

  return (
    <CanvasWrapper>
      <Header />
      <CartDrawer />

      <main className="px-4 sm:px-6 md:px-8 lg:px-14 py-6 sm:py-8 lg:py-14 overflow-x-clip">
        {/* ======================================================== */}
        {/* 1. EDITORIAL BREADCRUMBS                                 */}
        {/* ======================================================== */}
        <nav
          className="flex items-center gap-2 text-xs text-luxury-muted mb-6 sm:mb-8 max-w-[1360px] mx-auto font-medium"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-luxury-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-muted/70" />
          <Link href="/products" className="hover:text-luxury-charcoal transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-muted/70" />
          <Link
            href={`/products?category=${encodeURIComponent(currentProduct.category)}`}
            className="hover:text-luxury-charcoal transition-colors hidden sm:inline"
          >
            {currentProduct.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-muted/70 hidden sm:inline" />
          <span className="text-luxury-charcoal font-semibold truncate max-w-[180px] sm:max-w-none">
            {currentProduct.name}
          </span>
        </nav>

        {/* ======================================================== */}
        {/* 2. MAIN 2-COLUMN PDP LAYOUT                              */}
        {/* ======================================================== */}
        <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-start">
          {/* LEFT: 7 COLS (~58% WIDTH) — EDITORIAL PHOTO GALLERY */}
          <div className="lg:col-span-7 w-full">
            <ProductGallery
              images={galleryImages}
              productName={currentProduct.name}
              badge={currentProduct.badge}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>

          {/* RIGHT: 5 COLS (~42% WIDTH) — STICKY PRODUCT INFORMATION & CTAS */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-28 space-y-6 sm:space-y-8">
            {/* Product Information, Rating, Price, Color Swatches, CTAs */}
            <ProductInfo product={currentProduct} />

            {/* Accordions: Story, Specifications, Material & Care, Shipping */}
            <ProductAccordions product={currentProduct} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. RELATED PIECES (4-Column Grid)                        */}
        {/* ======================================================== */}
        {related.length > 0 && (
          <section className="w-full max-w-[1360px] mx-auto mt-16 sm:mt-24 pt-10 sm:pt-16 border-t border-luxury-border space-y-6 sm:space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold block">
                  Complete Your Ensemble
                </span>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-luxury-charcoal mt-1">
                  You May Also Admire
                </h3>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider text-luxury-charcoal font-semibold hover:text-luxury-gold transition-colors"
              >
                <span>View Full Atelier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 4. RECENTLY VIEWED PRODUCTS (LocalStorage Persistence)   */}
        {/* ======================================================== */}
        <div className="w-full max-w-[1360px] mx-auto">
          <RecentlyViewed currentSlug={currentProduct.slug} />
        </div>
      </main>

      {/* ======================================================== */}
      {/* 5. MOBILE FLOATING STICKY BOTTOM ACTION BAR              */}
      {/* ======================================================== */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-luxury-border p-3 px-4 transition-transform duration-300 shadow-2xl flex items-center justify-between gap-3 ${
          showMobileBottomBar ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-luxury-soft shrink-0 border border-luxury-border">
            <Image
              src={currentProduct.image}
              alt={currentProduct.name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif text-xs font-bold text-luxury-charcoal truncate">
              {currentProduct.name}
            </h4>
            <span className="font-serif text-xs font-bold text-luxury-gold">
              {formatPrice(currentProduct.price)}
            </span>
          </div>
        </div>

        <button
          onClick={handleMobileAddToCart}
          disabled={isAddedMobile}
          className="py-2.5 px-5 rounded-full bg-luxury-charcoal active:scale-95 text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer min-h-[42px]"
        >
          {isAddedMobile ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>

      <Footer />
    </CanvasWrapper>
  );
}
