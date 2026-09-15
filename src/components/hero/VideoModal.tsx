"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-luxury-dark/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Video Container */}
      <div className="relative w-full max-w-4xl bg-luxury-dark rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 bg-luxury-charcoal/80 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">
              Behind the Atelier
            </span>
            <h3 className="font-serif text-lg text-white font-medium">
              Pursia Haute Maroquinerie Film
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close campaign video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1&rel=0"
            title="Pursia Luxury Fashion Film"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-4 bg-luxury-charcoal text-center text-xs text-white/60 font-serif italic">
          Filmed on location in Florence & Paris • Spring / Summer Haute Couture Edition
        </div>
      </div>
    </div>
  );
}
