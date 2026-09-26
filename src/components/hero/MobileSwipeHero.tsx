"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { heroSlidesData } from "@/data/heroSlides";
import { SwipeHeroCard } from "@/components/hero/SwipeHeroCard";
import { SwipePagination } from "@/components/hero/SwipePagination";
import { HeroCampaign, getHeroCampaigns } from "@/lib/services/cms";

export interface MobileSwipeHeroProps {
  campaigns?: HeroCampaign[];
}

export function MobileSwipeHero({ campaigns: propCampaigns }: MobileSwipeHeroProps = {}) {
  const [activeCampaigns, setActiveCampaigns] = useState<HeroCampaign[]>(propCampaigns || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (propCampaigns) {
      const activeOnly = propCampaigns.filter((c) => c.is_active);
      setActiveCampaigns(activeOnly);
      return;
    }

    const loadCampaigns = () => {
      getHeroCampaigns().then((data) => {
        if (data) {
          const activeOnly = data.filter((c) => c.is_active);
          setActiveCampaigns(activeOnly);
        }
      });
    };

    loadCampaigns();
    window.addEventListener("nishya_cms_updated", loadCampaigns);
    window.addEventListener("focus", loadCampaigns);

    return () => {
      window.removeEventListener("nishya_cms_updated", loadCampaigns);
      window.removeEventListener("focus", loadCampaigns);
    };
  }, [propCampaigns]);

  const slides = activeCampaigns.length > 0
    ? activeCampaigns.map((c) => ({
        id: c.id,
        image: c.mobile_image || c.desktop_image,
        ctaText: c.cta_text || "SHOP NOW",
        ctaLink: c.cta_url || "/products",
      }))
    : heroSlidesData;

  const totalSlides = slides.length || 1;

  // Track viewport / card width dynamically
  const [cardWidth, setCardWidth] = useState(315);
  const gap = 14;
  const cardDistance = cardWidth + gap;

  useEffect(() => {
    const updateSize = () => {
      // Calculate responsive card width (~82% of viewport, bounded between 290 and 340)
      const w = Math.min(340, Math.max(290, window.innerWidth * 0.82));
      setCardWidth(w);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Motion value tracking the drag offset
  const dragX = useMotionValue(0);

  // Trigger smooth transition to the next slide
  const handleNext = useCallback(
    (targetIndex?: number) => {
      if (isAnimating) return;
      setIsAnimating(true);

      animate(dragX, -cardDistance, {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          setCurrentIndex((prev) =>
            targetIndex !== undefined ? targetIndex : (prev + 1) % totalSlides
          );
          dragX.set(0);
          setIsAnimating(false);
        },
      });
    },
    [cardDistance, dragX, isAnimating, totalSlides]
  );

  // Trigger smooth transition to the previous slide
  const handlePrev = useCallback(
    (targetIndex?: number) => {
      if (isAnimating) return;
      setIsAnimating(true);

      animate(dragX, cardDistance, {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          setCurrentIndex((prev) =>
            targetIndex !== undefined
              ? targetIndex
              : (prev - 1 + totalSlides) % totalSlides
          );
          dragX.set(0);
          setIsAnimating(false);
        },
      });
    },
    [cardDistance, dragX, isAnimating, totalSlides]
  );

  // Handle pointer / touch release
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return;

    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 260;

    if (offsetX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD) {
      handleNext();
    } else if (offsetX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) {
      handlePrev();
    } else {
      animate(dragX, 0, {
        type: "spring",
        stiffness: 420,
        damping: 28,
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Indices for the 3 visible slots
  const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  const nextIndex = (currentIndex + 1) % totalSlides;

  return (
    <section
      aria-label="High Fashion Mobile Hero Peek Stack"
      className="relative w-full overflow-hidden select-none bg-[#F7F4EF] pt-4 pb-6"
    >
      {/* AMBIENT SUNLIT LEAF SHADOW SILHOUETTES */}
      <div
        className="absolute -bottom-12 -left-12 w-52 h-52 pointer-events-none opacity-25 blur-xl z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full text-[#2E2823]">
          <path d="M20,180 Q80,100 160,70 Q110,120 70,190 Z" />
          <path d="M40,190 Q100,120 180,110 Q120,150 90,200 Z" />
          <path d="M10,160 Q60,90 140,40 Q90,100 50,170 Z" />
        </svg>
      </div>

      <div
        className="absolute -top-10 -right-10 w-44 h-44 pointer-events-none opacity-20 blur-xl z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full text-[#2E2823]">
          <path d="M180,20 Q100,80 70,160 Q120,110 190,70 Z" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 3D PEEKABLE CARD CAROUSEL STACK CONTAINER                 */}
      {/* ========================================================= */}
      <div className="relative w-full h-[550px] sm:h-[570px] flex items-center justify-center overflow-visible">
        {/* DRAGGABLE TRACK */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          dragDirectionLock={true}
          onDragEnd={handleDragEnd}
          style={{
            x: dragX,
            touchAction: "pan-y", // Preserves native vertical page scrolling
          }}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform z-10"
        >
          {/* 1. LEFT PEEKING CARD */}
          <SlotCard
            key={`prev-${prevIndex}`}
            slide={slides[prevIndex]}
            cardWidth={cardWidth}
            baseOffset={-cardDistance}
            dragX={dragX}
            cardDistance={cardDistance}
            onClick={handlePrev}
            totalSlides={totalSlides}
            slideIndex={prevIndex}
          />

          {/* 2. CENTER ACTIVE CARD */}
          <SlotCard
            key={`center-${currentIndex}`}
            slide={slides[currentIndex]}
            cardWidth={cardWidth}
            baseOffset={0}
            dragX={dragX}
            cardDistance={cardDistance}
            isCenter={true}
            totalSlides={totalSlides}
            slideIndex={currentIndex}
          />

          {/* 3. RIGHT PEEKING CARD */}
          <SlotCard
            key={`next-${nextIndex}`}
            slide={slides[nextIndex]}
            cardWidth={cardWidth}
            baseOffset={cardDistance}
            dragX={dragX}
            cardDistance={cardDistance}
            onClick={handleNext}
            totalSlides={totalSlides}
            slideIndex={nextIndex}
          />
        </motion.div>


      </div>

      {/* ========================================================= */}
      {/* BOTTOM PAGINATION DOTS & SWIPE PROMPT                     */}
      {/* ========================================================= */}
      <div className="mt-4 px-4 flex justify-center z-20 relative">
        <SwipePagination
          currentIndex={currentIndex}
          totalSlides={totalSlides}
          onSelectIndex={(targetIdx: number) => {
            if (targetIdx === currentIndex || isAnimating) return;
            if (targetIdx > currentIndex) {
              handleNext(targetIdx);
            } else {
              handlePrev(targetIdx);
            }
          }}
        />
      </div>
    </section>
  );
}

/**
 * SlotCard:
 * Handles dynamic position, scale, rotation, and opacity relative to the drag offset.
 */
function SlotCard({
  slide,
  cardWidth,
  baseOffset,
  dragX,
  cardDistance,
  isCenter = false,
  onClick,
  totalSlides,
  slideIndex,
}: {
  slide: { id: number | string; image: string; ctaText: string; ctaLink: string };
  cardWidth: number;
  baseOffset: number;
  dragX: any;
  cardDistance: number;
  isCenter?: boolean;
  onClick?: () => void;
  totalSlides: number;
  slideIndex?: number;
}) {
  // Compute continuous scale based on relative distance from center
  const scale = useTransform(
    dragX,
    [-cardDistance, 0, cardDistance],
    isCenter
      ? [0.93, 1.0, 0.93]
      : baseOffset < 0
      ? [0.86, 0.93, 1.0] // Left card becomes center when dragging right
      : [1.0, 0.93, 0.86] // Right card becomes center when dragging left
  );

  // Subtle 3D perspective rotation
  const rotate = useTransform(
    dragX,
    [-cardDistance, 0, cardDistance],
    isCenter
      ? [-3.5, 0, 3.5]
      : baseOffset < 0
      ? [-5, -3, 0]
      : [0, 3, 5]
  );

  // Opacity fade for background cards
  const opacity = useTransform(
    dragX,
    [-cardDistance, 0, cardDistance],
    isCenter
      ? [0.88, 1.0, 0.88]
      : baseOffset < 0
      ? [0.65, 0.9, 1.0]
      : [1.0, 0.9, 0.65]
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        height: 540,
        x: baseOffset,
        scale,
        rotate,
        opacity,
        zIndex: isCenter ? 20 : 10,
      }}
      onClick={!isCenter && onClick ? onClick : undefined}
      className={`absolute inset-y-0 flex items-center justify-center ${
        !isCenter ? "cursor-pointer" : ""
      }`}
    >
      <SwipeHeroCard
        slide={slide}
        isInteractive={isCenter}
        totalSlides={totalSlides}
        slideIndex={slideIndex}
      />
    </motion.div>
  );
}

// Export as MobileHeroCarousel as well
export { MobileSwipeHero as MobileHeroCarousel };
