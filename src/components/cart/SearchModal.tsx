"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [productsList, setProductsList] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      getProducts().then((all) => setProductsList(all));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  if (!isOpen) return null;

  const filtered = query.trim()
    ? productsList.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : productsList.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-luxury-dark/70 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-luxury-border overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-4 sm:p-6 border-b border-luxury-border flex items-center gap-3">
          <Search className="w-5 h-5 text-luxury-gold shrink-0" />
          <input
            type="text"
            placeholder="Search luxury handbags, clutches, totes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-base sm:text-lg font-serif text-luxury-charcoal placeholder:font-sans placeholder:text-sm placeholder:text-luxury-muted focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-luxury-muted hover:text-luxury-charcoal p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-11 h-11 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-muted hover:text-luxury-charcoal cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          <div className="text-[11px] uppercase tracking-widest text-luxury-muted font-semibold mb-3">
            {query.trim() ? `Search Results (${filtered.length})` : "Curated Highlights"}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-luxury-muted text-sm font-serif">
              No handbags found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleClose}
                  className="group flex gap-3.5 p-2.5 rounded-xl hover:bg-luxury-soft transition-colors border border-transparent hover:border-luxury-border"
                >
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-luxury-soft shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium">
                      {product.category}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-luxury-charcoal group-hover:text-luxury-gold transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="text-xs font-bold text-luxury-charcoal mt-1">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Link Footer */}
        <div className="p-4 bg-luxury-soft/60 border-t border-luxury-border flex justify-between items-center text-xs">
          <span className="text-luxury-muted">Looking for our full catalog?</span>
          <Link
            href="/products"
            onClick={handleClose}
            className="text-luxury-gold font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Explore All Handbags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
