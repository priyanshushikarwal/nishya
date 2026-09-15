"use client";

import React, { useEffect, useState } from "react";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeroSection } from "@/components/hero/HeroSection";
import { WhatsNewSection } from "@/components/discovery/WhatsNewSection";
import { BrandStrip } from "@/components/brand/BrandStrip";
import { CircularFeature } from "@/components/showcase/CircularFeature";
import { PromoBanner } from "@/components/promo/PromoBanner";
import { LifestyleModel } from "@/components/lifestyle/LifestyleModel";
import { ProductDiscovery } from "@/components/discovery/ProductDiscovery";
import { EverydaySection } from "@/components/lifestyle/EverydaySection";
import { UniquenessSection } from "@/components/lifestyle/UniquenessSection";
import { InstagramGallery } from "@/components/brand/InstagramGallery";
import { HomepageSection, getHomepageSections } from "@/lib/services/cms";

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getHomepageSections().then((data) => {
      if (isMounted) {
        const sorted = [...data].sort((a, b) => a.sort_order - b.sort_order);
        setSections(sorted);
        setLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isSectionVisible = (id: string) => {
    if (!loaded) return true; // Default visible while hydrating
    const found = sections.find((s) => s.id === id);
    return found ? found.is_visible : true;
  };

  // Render a specific section by its CMS identifier
  const renderSection = (id: string) => {
    switch (id) {
      case "hero":
        return <HeroSection key="hero" />;
      case "whats_new":
        return <WhatsNewSection key="whats_new" />;
      case "brand_strip":
        return <BrandStrip key="brand_strip" />;
      case "circular_showcase":
        return <CircularFeature key="circular_showcase" />;
      case "product_discovery":
        return <ProductDiscovery key="product_discovery" />;
      case "promo_banner":
        return <PromoBanner key="promo_banner" />;
      case "lifestyle_model":
        return <LifestyleModel key="lifestyle_model" />;
      case "everyday_section":
        return <EverydaySection key="everyday_section" />;
      case "uniqueness_section":
        return <UniquenessSection key="uniqueness_section" />;
      case "instagram_gallery":
        return <InstagramGallery key="instagram_gallery" />;
      default:
        return null;
    }
  };

  // Main body sections ordered dynamically by CMS
  const mainSections = loaded
    ? sections
        .filter((s) => s.id !== "announcement" && s.id !== "footer" && s.is_visible)
        .map((s) => renderSection(s.id))
    : [
        <HeroSection key="hero" />,
        <WhatsNewSection key="whats_new" />,
        <BrandStrip key="brand_strip" />,
        <CircularFeature key="circular_showcase" />,
        <ProductDiscovery key="product_discovery" />,
        <PromoBanner key="promo_banner" />,
        <LifestyleModel key="lifestyle_model" />,
        <EverydaySection key="everyday_section" />,
        <UniquenessSection key="uniqueness_section" />,
        <InstagramGallery key="instagram_gallery" />,
      ];

  return (
    <CanvasWrapper>
      {/* 0. Official Announcement Strip (CMS Controlled) */}
      {isSectionVisible("announcement") && <AnnouncementBar />}

      {/* Editorial Navigation */}
      <Header />

      {/* Global Interactive Cart Drawer */}
      <CartDrawer />

      {/* Main Dynamic Sections Container */}
      <main className="space-y-0 lg:space-y-12">
        {mainSections}
      </main>

      {/* 10. Minimalist Luxury Multi-Column Footer & Newsletter (CMS Controlled) */}
      {isSectionVisible("footer") && <Footer />}
    </CanvasWrapper>
  );
}
