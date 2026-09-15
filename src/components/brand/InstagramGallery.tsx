import React from "react";
import Image from "next/image";
import { HandwrittenLabel } from "@/components/decorative/HandwrittenLabel";
import { InstagramIcon } from "@/components/decorative/SocialIcons";

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
    handle: "@elena.vogue",
    caption: "Golden Pyramid in morning light",
  },
  {
    url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=85",
    handle: "@claire.haute",
    caption: "Midnight Shoulder Bag in Paris",
  },
  {
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
    handle: "@camille.couture",
    caption: "Unboxing the pyramid icon",
  },
  {
    url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85",
    handle: "@sophia.style",
    caption: "Alabaster Ivory tote day",
  },
  {
    url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=85",
    handle: "@marina.florence",
    caption: "Evening companion in Tuscany",
  },
  {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
    handle: "@aurora.milan",
    caption: "Sculptural simplicity with Pursia",
  },
];

export function InstagramGallery() {
  return (
    <section className="relative px-4 sm:px-6 md:px-8 lg:px-14 py-12 sm:py-16 lg:py-24 overflow-x-clip">
      <div className="w-full max-w-[1360px] mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-semibold text-luxury-gold">
            #PURSIA BAGS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-charcoal">
            Unbox Your <span className="italic font-normal text-luxury-gold">New Favourite</span>
          </h2>
          <div className="pt-1">
            <HandwrittenLabel rotate="left" color="gold" className="text-sm sm:text-base lg:text-xl">
              Tag @pursia.luxury to be featured in our seasonal lookbook
            </HandwrittenLabel>
          </div>
        </div>

        {/* Gallery (Mobile: Snap horizontal scroll, Desktop lg: 6 columns) */}
        <div className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {galleryImages.map((img, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[3/4] w-[190px] sm:w-[220px] lg:w-auto shrink-0 snap-start rounded-xl sm:rounded-2xl overflow-hidden bg-luxury-soft border border-luxury-border shadow-xs block"
            >
              <Image
                src={img.url}
                alt={`Pursia Bag Instagram showcase by ${img.handle}`}
                fill
                sizes="(max-width: 640px) 190px, (max-width: 1024px) 220px, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-luxury-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
                <div className="self-end">
                  <InstagramIcon className="w-5 h-5 text-white/90" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">{img.handle}</span>
                  <span className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                    {img.caption}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
