import React from "react";

const brandLabels = [
  { name: "LUXE", style: "font-serif tracking-[0.35em] font-light text-sm sm:text-base lg:text-lg" },
  { name: "ATELIER", style: "font-sans tracking-[0.35em] font-bold text-[11px] sm:text-xs lg:text-sm" },
  { name: "MAISON", style: "font-serif italic tracking-[0.25em] font-normal text-sm sm:text-base lg:text-lg" },
  { name: "ÉLAN", style: "font-serif tracking-[0.3em] font-bold text-xs sm:text-sm lg:text-base" },
  { name: "NOIR", style: "font-sans tracking-[0.3em] font-extrabold text-[11px] sm:text-xs lg:text-sm" },
  { name: "BELLA", style: "font-serif tracking-[0.28em] font-medium text-sm sm:text-base lg:text-lg" },
];

export function BrandStrip() {
  return (
    <section className="relative py-8 sm:py-10 lg:py-14 border-y border-luxury-border/70 bg-luxury-soft/30 overflow-x-clip select-none">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-luxury-muted font-medium">
            Featured In Global Fashion Ateliers & Editorials
          </span>
        </div>

        {/* Brand Logos (Mobile: 3-column balanced grid, Desktop: Single horizontal spread) */}
        <div className="grid grid-cols-3 md:flex md:items-center md:justify-between gap-y-4 gap-x-2 sm:gap-6 opacity-75 hover:opacity-95 transition-opacity duration-300 text-center">
          {brandLabels.map((brand) => (
            <div
              key={brand.name}
              className={`${brand.style} text-luxury-charcoal hover:text-luxury-gold transition-colors duration-200 cursor-default py-1 px-1 sm:px-2 flex items-center justify-center`}
            >
              {brand.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
