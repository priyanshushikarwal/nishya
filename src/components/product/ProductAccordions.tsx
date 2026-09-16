"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles, Shield, Box, RefreshCw } from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductAccordionsProps {
  product: Product;
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    story: true,
    specs: true,
    care: false,
    shipping: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const specsList = [
    { label: "Material", value: product.material || "Full-grain Italian calfskin" },
    { label: "Dimensions", value: product.dimensions || "38cm (W) x 28cm (H) x 4cm (D)" },
    { label: "Weight", value: product.weight || "480g (Ultralight poise)" },
    { label: "Interior", value: product.interior || "Padded tech sleeve & dual velvet-lined slip pockets" },
    { label: "Closure", value: product.closure || "Heavy-duty antiqued brass zipper with hide pulls" },
    { label: "Strap / Handles", value: product.strap || "Reinforced dual carry handles + adjustable crossbody strap" },
    { label: "Lining", value: product.lining || "Water-resistant micro-twill satin" },
    { label: "SKU", value: product.sku || `NIS-${product.id.toUpperCase()}` },
    { label: "Country of Origin", value: product.origin || "India" },
  ];

  const careItems = product.care || [
    "Clean gently with a soft, clean cotton or microfiber cloth.",
    "Store in the provided Nishya satin dustbag when not in use to prevent dust and scratches.",
    "Keep stuffed with tissue paper to preserve architectural geometry and form.",
    "Avoid direct contact with cosmetic liquids, oils, sanitizers, and prolonged harsh sunlight.",
  ];

  return (
    <div className="border-t border-luxury-border/80 divide-y divide-luxury-border/60">
      {/* 1. STORY & INSPIRATION */}
      <div className="py-4 sm:py-5">
        <button
          type="button"
          onClick={() => toggleSection("story")}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
          aria-expanded={openSections.story}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-luxury-gold shrink-0" />
            <span className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
              Story & Atelier Inspiration
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-luxury-muted transition-transform duration-300",
              openSections.story ? "rotate-180 text-luxury-charcoal" : ""
            )}
          />
        </button>

        {openSections.story && (
          <div className="pt-3.5 space-y-2.5 text-xs sm:text-sm text-luxury-muted leading-relaxed font-light font-sans animate-in fade-in duration-200">
            <p>
              {product.story ||
                product.description ||
                "Hand-sculpted in our atelier with painstaking precision. Each line celebrates harmonious proportion, effortless movement, and enduring elegance."}
            </p>
            {product.details && product.details.length > 0 && (
              <ul className="space-y-1.5 pt-1.5">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-luxury-gold font-bold">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 2. CRAFT & SPECIFICATIONS */}
      <div className="py-4 sm:py-5">
        <button
          type="button"
          onClick={() => toggleSection("specs")}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
          aria-expanded={openSections.specs}
        >
          <div className="flex items-center gap-2.5">
            <Box className="w-4 h-4 text-luxury-gold shrink-0" />
            <span className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
              Craft & Technical Specifications
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-luxury-muted transition-transform duration-300",
              openSections.specs ? "rotate-180 text-luxury-charcoal" : ""
            )}
          />
        </button>

        {openSections.specs && (
          <div className="pt-3.5 space-y-2 text-xs sm:text-sm animate-in fade-in duration-200">
            {specsList.map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col xs:flex-row xs:items-center justify-between py-1.5 border-b border-luxury-border/40 gap-1"
              >
                <span className="text-luxury-muted font-medium">{spec.label}</span>
                <span className="text-luxury-charcoal font-medium text-left xs:text-right max-w-xs">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MATERIAL & CARE */}
      <div className="py-4 sm:py-5">
        <button
          type="button"
          onClick={() => toggleSection("care")}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
          aria-expanded={openSections.care}
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-luxury-gold shrink-0" />
            <span className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
              Material Care & Longevity
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-luxury-muted transition-transform duration-300",
              openSections.care ? "rotate-180 text-luxury-charcoal" : ""
            )}
          />
        </button>

        {openSections.care && (
          <div className="pt-3.5 space-y-2 text-xs sm:text-sm text-luxury-muted leading-relaxed font-light animate-in fade-in duration-200">
            <ul className="space-y-1.5">
              {careItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-luxury-gold font-bold">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. SHIPPING & COMPLIMENTARY RETURNS */}
      <div className="py-4 sm:py-5">
        <button
          type="button"
          onClick={() => toggleSection("shipping")}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
          aria-expanded={openSections.shipping}
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-luxury-gold shrink-0" />
            <span className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
              Complimentary Delivery & Returns
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-luxury-muted transition-transform duration-300",
              openSections.shipping ? "rotate-180 text-luxury-charcoal" : ""
            )}
          />
        </button>

        {openSections.shipping && (
          <div className="pt-3.5 space-y-2.5 text-xs sm:text-sm text-luxury-muted leading-relaxed font-light animate-in fade-in duration-200">
            <p>
              <strong>Complimentary Insured Shipping:</strong> Dispatched within 24 hours via priority express courier with real-time end-to-end SMS & WhatsApp tracking.
            </p>
            <p>
              <strong>Estimated Arrival:</strong> 3–5 business days across all metropolitan cities in India.
            </p>
            <p>
              <strong>Keepsake Packaging:</strong> Every piece arrives inside a magnetic-closure rigid gift chest accompanied by an unbleached organic cotton dustbag.
            </p>
            <p>
              <strong>Hassle-Free 14-Day Returns:</strong> If you are not completely captivated, enjoy complimentary doorstep collection and prompt refund or exchange.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
