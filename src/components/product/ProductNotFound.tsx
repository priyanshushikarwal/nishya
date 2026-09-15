"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function ProductNotFound() {
  return (
    <CanvasWrapper>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-soft border border-luxury-border">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-muted">
              Haute Archive
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-luxury-charcoal leading-tight">
            Piece Not Found
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-luxury-muted font-light leading-relaxed max-w-md mx-auto">
            The creation you are seeking may belong to an archived season, a private salon showcase, or the URL might have changed.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-luxury-gold transition-colors duration-300 shadow-lg min-h-[48px]"
            >
              <span>Explore Current Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-luxury-charcoal/30 hover:border-luxury-charcoal text-luxury-charcoal text-xs uppercase tracking-[0.18em] font-semibold transition-colors min-h-[48px]"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </CanvasWrapper>
  );
}
