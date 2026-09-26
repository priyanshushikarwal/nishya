"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { getProducts, getCategories } from "@/lib/services/products";
import { Product } from "@/types/product";
import { categories as initialCategories, Category } from "@/data/categories";
import { ProductCard } from "@/components/discovery/ProductCard";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { formatPrice, cn } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadData = () => {
    getProducts().then((data) => {
      setAllProducts(data);
    });
  };

  const loadCategories = () => {
    getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategoriesList(data.filter((c) => c.slug !== "all"));
      }
    });
  };

  useEffect(() => {
    loadData();
    loadCategories();
    const handleUpdate = () => loadData();
    const handleCatUpdate = () => loadCategories();
    window.addEventListener("nishya_products_updated", handleUpdate);
    window.addEventListener("nishya_categories_updated", handleCatUpdate);
    return () => {
      window.removeEventListener("nishya_products_updated", handleUpdate);
      window.removeEventListener("nishya_categories_updated", handleCatUpdate);
    };
  }, []);

  // Sync category when URL search parameters change (e.g. from mobile menu)
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || "All");
  }, [searchParams]);

  // Filter & Sort computation
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        if (selectedCategory !== "All" && product.category !== selectedCategory) {
          return false;
        }
        if (product.price > maxPrice) {
          return false;
        }
        if (inStockOnly && !product.inStock) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // "featured"
      });
  }, [selectedCategory, sortBy, maxPrice, inStockOnly]);

  const hasActiveFilters = selectedCategory !== "All" || maxPrice < 4000 || inStockOnly;

  const resetFilters = () => {
    setSelectedCategory("All");
    setMaxPrice(4000);
    setInStockOnly(false);
  };

  return (
    <CanvasWrapper>
      <Header />
      <CartDrawer />

      <main className="px-4 sm:px-6 md:px-8 lg:px-14 py-6 sm:py-10 lg:py-16 overflow-x-clip">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-6 sm:mb-10 lg:mb-14">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-luxury-gold">
            Haute Maroquinerie
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal">
            Luxury Handbags & Purses
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-light leading-relaxed">
            Discover timeless handbags, sculpted minaudières, and architectural totes crafted in
            Florentine calfskin.
          </p>
        </div>

        {/* Category Pill Tabs (Mobile: Horizontal scroll) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[38px]",
              selectedCategory === "All"
                ? "bg-luxury-charcoal text-white shadow-xs"
                : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal hover:bg-luxury-border/60"
            )}
          >
            All Pieces ({allProducts.length})
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[38px]",
                selectedCategory === cat.name
                  ? "bg-luxury-charcoal text-white shadow-xs"
                  : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal hover:bg-luxury-border/60"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4 border-y border-luxury-border mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filter Trigger Button (min 44px height) */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-luxury-soft cursor-pointer min-h-[40px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && "•"}</span>
            </button>

            <span className="text-xs text-luxury-muted font-medium">
              Showing <strong className="text-luxury-charcoal">{filteredProducts.length}</strong> pieces
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-luxury-gold hover:underline font-medium cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown (Touch-friendly 40px height) */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-luxury-muted" />
            <span className="hidden sm:inline text-luxury-muted uppercase tracking-wider font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-luxury-border rounded-full px-3 py-2 text-luxury-charcoal font-medium focus:outline-none focus:border-luxury-charcoal cursor-pointer min-h-[40px]"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Content Layout with Desktop Sidebar & Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols on lg:) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 pr-4 sticky top-28">
            <div className="p-6 rounded-2xl bg-luxury-soft/50 border border-luxury-border space-y-6">
              <div className="flex items-center justify-between border-b border-luxury-border pb-3">
                <h3 className="font-serif text-base font-bold text-luxury-charcoal">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-luxury-gold hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-luxury-muted">
                    Max Price
                  </span>
                  <span className="font-bold text-luxury-charcoal">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1800"
                  max="4000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-luxury-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-luxury-muted">
                  <span>₹1,800</span>
                  <span>₹4,000</span>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="pt-2 border-t border-luxury-border">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded accent-luxury-gold w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-luxury-charcoal font-medium">
                    In-Stock Pieces Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (9 cols on lg:, full width on mobile) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="py-16 sm:py-20 text-center rounded-2xl bg-luxury-soft/30 border border-luxury-border space-y-4 px-4">
                <h3 className="font-serif text-xl font-medium text-luxury-charcoal">
                  No Handbags Found
                </h3>
                <p className="text-xs text-luxury-muted max-w-sm mx-auto">
                  Try adjusting your price range or category filter to view our other handcrafted pieces.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-luxury-dark transition-colors min-h-[44px]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal / Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-luxury-dark/70 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-luxury-border pb-4">
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal">Filter Catalog</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-luxury-soft flex items-center justify-center text-luxury-muted cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-luxury-muted">
                    Max Price
                  </span>
                  <span className="font-bold text-luxury-charcoal">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1800"
                  max="4000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-luxury-gold cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-luxury-muted">
                  <span>₹1,800</span>
                  <span>₹4,000</span>
                </div>
              </div>

              {/* Stock Filter */}
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded accent-luxury-gold w-5 h-5 cursor-pointer"
                />
                <span className="text-sm text-luxury-charcoal font-medium">In Stock Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-luxury-border space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-wider font-semibold cursor-pointer min-h-[48px]"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 text-xs text-luxury-muted hover:text-luxury-charcoal font-semibold cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </CanvasWrapper>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E5B25D] flex items-center justify-center text-luxury-charcoal font-serif">
          Loading Catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
