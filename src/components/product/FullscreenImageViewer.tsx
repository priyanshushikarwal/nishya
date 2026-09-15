"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface FullscreenImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

export function FullscreenImageViewer({
  isOpen,
  onClose,
  images,
  currentIndex,
  onSelectIndex,
  productName,
}: FullscreenImageViewerProps) {
  // Handle keyboard navigation (Escape to close, left/right arrows to slide)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onSelectIndex((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        onSelectIndex((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body background scroll while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, images.length, onClose, onSelectIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} fullscreen gallery`}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none"
      onClick={onClose}
    >
      {/* Top Bar: Title, Counter, Close button */}
      <div
        className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold block">
            Campaign Inspection
          </span>
          <h2 className="font-serif text-sm sm:text-lg font-medium text-white/90 truncate max-w-[200px] sm:max-w-md">
            {productName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs sm:text-sm tracking-widest text-white/70">
            {String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>

          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            aria-label="Close fullscreen view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full max-w-6xl mx-auto my-3 sm:my-6 flex items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-h-[78vh] flex items-center justify-center">
          <Image
            src={currentImage}
            alt={`${productName} high resolution angle ${currentIndex + 1}`}
            fill
            sizes="100vw"
            priority
            className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer border border-white/20 shadow-lg"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer border border-white/20 shadow-lg"
              aria-label="Next photograph"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto py-2 px-2 scrollbar-none z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? "border-luxury-gold scale-110 shadow-lg opacity-100"
                  : "border-white/20 opacity-50 hover:opacity-85 hover:border-white/40"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
