"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LotusFlourish } from "@/components/decorative/LotusFlourish";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  slug: string;
}

const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: "totes",
    name: "Totes",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098740381_WhatsApp_Image_2026-10-04_at_1_2dgeea.jpeg",
    slug: "Totes",
  },
  {
    id: "laptop-bags",
    name: "Laptop Bags",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098685062_WhatsApp_Image_2026-10-04_at_1_hm6mbq.jpeg",
    slug: "Laptop Bags",
  },
  {
    id: "backpacks",
    name: "Backpacks",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098829627_WhatsApp_Image_2026-10-04_at_1_2s5n4a.jpeg",
    slug: "Backpacks",
  },
  {
    id: "sling-bags",
    name: "Sling Bags",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098811847_WhatsApp_Image_2026-10-04_at_1_or0dxz.jpeg",
    slug: "Sling Bags",
  },
  {
    id: "pouch-bags",
    name: "Pouch Bags",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098843530_WhatsApp_Image_2026-10-04_at_1_3bd3k6.jpeg",
    slug: "Pouch Bags",
  },
  {
    id: "yoga-gym-bags",
    name: "Yoga & Gym Bags",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098899769_WhatsApp_Image_2026-10-04_at_1_m7zb7r.jpeg",
    slug: "Yoga & Gym Bags",
  },
  {
    id: "hats-headwear",
    name: "Hats & Headwear",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098920003_WhatsApp_Image_2026-10-04_at_1_vh2zfr.jpeg",
    slug: "Hats & Headwear",
  },
  {
    id: "bucket-rope-bag",
    name: "Bucket rope bag",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1791098452653_WhatsApp_Image_2026-10-01_at_8_6xs15e.jpeg",
    slug: "Bucket rope bag",
  },
];

export function OurCategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(DEFAULT_CATEGORY_ITEMS);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartPos, setScrollStartPos] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped: CategoryItem[] = data.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            image:
              c.image ||
              DEFAULT_CATEGORY_ITEMS.find(
                (d) => d.name.toLowerCase() === c.name.toLowerCase()
              )?.image ||
              DEFAULT_CATEGORY_ITEMS[0].image,
            slug: c.name,
          }));
          setCategoriesList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Mouse drag-to-scroll handlers for desktop & trackpad
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStartPos(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollStartPos - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  return (
    <section className="relative w-full bg-white pt-8 pb-10 sm:py-12 border-b border-luxury-border/60 select-none">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Emblem & Title matching reference Image 4 */}
        <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 space-y-2">
          <LotusFlourish className="w-9 h-7 sm:w-10 sm:h-8 text-[#C45E35]" color="#C45E35" />
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium tracking-[0.22em] text-[#1E1E1E] uppercase">
            OUR CATEGORIES
          </h2>
        </div>

        {/* Carousel / Scrollable Row Container with Mobile & Desktop Controls */}
        <div className="relative group/carousel">
          {/* Left Arrow Button (Visible on mobile & desktop when scrollable) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-[#E7DDD0] shadow-md flex items-center justify-center text-luxury-charcoal hover:bg-[#C45E35] hover:text-white transition-all cursor-pointer"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Categories Horizontal Scroll Strip */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 -mx-1 ${
              isMouseDown ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y",
              scrollSnapType: "x proximity",
            }}
          >
            {categoriesList.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                  }
                }}
                className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                style={{
                  width: "105px",
                  minWidth: "105px",
                  scrollSnapAlign: "start",
                }}
              >
                {/* Circular Image Container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-[#E7DDD0] p-1 bg-[#FAF7F2] transition-all duration-300 group-hover:border-[#C45E35] group-hover:shadow-md">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Category Label */}
                <span className="mt-2 text-xs sm:text-sm font-medium text-center text-[#2D2A26] group-hover:text-[#C45E35] transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Arrow Button (Visible on mobile & desktop when scrollable) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-[#E7DDD0] shadow-md flex items-center justify-center text-luxury-charcoal hover:bg-[#C45E35] hover:text-white transition-all cursor-pointer"
              aria-label="Next categories"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
