"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Heart } from "lucide-react";
import { FullscreenImageViewer } from "@/components/product/FullscreenImageViewer";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export function ProductGallery({
  images,
  productName,
  badge,
  isWishlisted,
  onToggleWishlist,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const displayImages = images.length > 0 ? images : ["/images/nishya/carry_your_story_pink_arch.jpg"];

  // Scroll mobile carousel to index
  const scrollToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const width = container.clientWidth;
    isScrollingRef.current = true;
    container.scrollTo({
      left: index * width,
      behavior: "smooth",
    });
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 400);
  }, []);

  // Sync active index when user swipes on mobile
  const handleScroll = () => {
    if (isScrollingRef.current || !mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex >= 0 && newIndex < displayImages.length && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const handlePrev = () => {
    const prev = (activeIndex - 1 + displayImages.length) % displayImages.length;
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeIndex + 1) % displayImages.length;
    scrollToIndex(next);
  };

  return (
    <div className="w-full select-none">
      {/* ======================================================== */}
      {/* 1. DESKTOP GALLERY (>= 1024px)                          */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-col gap-4 w-full">
        {/* Main Editorial Hero Stage */}
        <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] border border-luxury-border shadow-lg group">
          {/* Floating Badge (e.g. Bestseller, Limited Edition) */}
          {badge && (
            <div className="absolute top-6 left-6 z-20">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-luxury-charcoal text-white shadow-md">
                {badge}
              </span>
            </div>
          )}

          {/* Desktop Wishlist Button */}
          <button
            onClick={onToggleWishlist}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/85 hover:bg-white active:scale-95 text-luxury-charcoal flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-md cursor-pointer border border-black/5"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isWishlisted ? "fill-red-600 text-red-600 scale-110" : "text-luxury-charcoal group-hover:text-luxury-gold"
              )}
            />
          </button>

          {/* Click to expand hover hint */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute bottom-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white text-luxury-charcoal text-xs font-semibold uppercase tracking-wider backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md cursor-pointer border border-black/5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-luxury-gold" />
            <span>Fullscreen View</span>
          </button>

          {/* Active Image Counter */}
          <div className="absolute bottom-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs tracking-widest font-semibold shadow-md">
            {String(activeIndex + 1).padStart(2, "0")} / {String(displayImages.length).padStart(2, "0")}
          </div>

          {/* Main Photo Clickable Area */}
          <div
            onClick={() => setIsFullscreenOpen(true)}
            className="relative w-full h-full p-8 sm:p-12 flex items-center justify-center cursor-zoom-in"
          >
            <Image
              src={displayImages[activeIndex]}
              alt={`${productName} photograph ${activeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1280px) 55vw, 700px"
              className="object-contain p-6 transition-all duration-700 ease-out group-hover:scale-[1.04] drop-shadow-[0_20px_45px_rgba(0,0,0,0.15)]"
            />
          </div>

          {/* Desktop Left / Right Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 text-luxury-charcoal flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 -ml-0.5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 text-luxury-charcoal flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 -mr-0.5" />
              </button>
            </>
          )}
        </div>

        {/* Desktop Thumbnails Strip */}
        {displayImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none">
            {displayImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={cn(
                  "relative w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF7F2] border-2 shrink-0 transition-all duration-300 cursor-pointer p-1",
                  activeIndex === idx
                    ? "border-luxury-gold shadow-md scale-105"
                    : "border-luxury-border/80 hover:border-luxury-gold/50 opacity-70 hover:opacity-100"
                )}
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE GALLERY (< 1024px)                            */}
      {/* ======================================================== */}
      <div className="block lg:hidden w-full -mx-4 sm:-mx-6 md:-mx-8">
        <div className="relative w-full aspect-square bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE4] border-y border-luxury-border overflow-hidden">
          {/* Badge */}
          {badge && (
            <div className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-luxury-charcoal text-white shadow-sm">
                {badge}
              </span>
            </div>
          )}

          {/* Mobile Wishlist Button */}
          <button
            onClick={onToggleWishlist}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 active:scale-95 text-luxury-charcoal flex items-center justify-center backdrop-blur-md shadow-md border border-black/5 cursor-pointer"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isWishlisted ? "fill-red-600 text-red-600 scale-110" : "text-luxury-charcoal"
              )}
            />
          </button>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute bottom-4 left-4 z-20 w-9 h-9 rounded-full bg-white/90 active:scale-95 text-luxury-charcoal flex items-center justify-center backdrop-blur-md shadow-md border border-black/5 cursor-pointer"
            aria-label="Expand image"
          >
            <Maximize2 className="w-4 h-4 text-luxury-gold" />
          </button>

          {/* Counter Badge */}
          <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[11px] tracking-wider font-semibold">
            {activeIndex + 1} / {displayImages.length}
          </div>

          {/* Touch-Swipeable Gallery Track */}
          <div
            ref={mobileScrollRef}
            onScroll={handleScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
          >
            {displayImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setIsFullscreenOpen(true)}
                className="relative w-full min-w-full h-full shrink-0 snap-center flex items-center justify-center p-6 cursor-pointer"
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} view ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-contain p-4 drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        {displayImages.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  activeIndex === idx
                    ? "w-6 bg-luxury-charcoal"
                    : "w-1.5 bg-luxury-charcoal/25 hover:bg-luxury-charcoal/40"
                )}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      <FullscreenImageViewer
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        images={displayImages}
        currentIndex={activeIndex}
        onSelectIndex={setActiveIndex}
        productName={productName}
      />
    </div>
  );
}
