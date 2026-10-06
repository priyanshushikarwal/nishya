"use client";

import React from "react";
import { ArtisanHeroBanner } from "@/components/hero/ArtisanHeroBanner";
import { OurCategoriesSection } from "@/components/discovery/OurCategoriesSection";
import { BestsellersShowcase } from "@/components/discovery/BestsellersShowcase";

export function HeroSection() {
  return (
    <div className="w-full">
      {/* 1. First Fold: Artisan Hero Banner matching reference Image 4 */}
      <ArtisanHeroBanner />

      {/* 2. OUR CATEGORIES Section with Lotus Emblem & Circular Cards (Image 4) */}
      <OurCategoriesSection />

      {/* 3. BESTSELLERS Showcase with Floating Cart Button & Price (Image 1) */}
      <BestsellersShowcase />
    </div>
  );
}
