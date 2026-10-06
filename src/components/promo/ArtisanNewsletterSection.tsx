"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export function ArtisanNewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="relative w-full bg-white py-12 sm:py-16 border-b border-luxury-border/60">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 text-center space-y-4">
        {/* Headings matching reference Image 3 */}
        <div className="space-y-1.5">
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.12em] text-[#1E1E1E] uppercase">
            SUBSCRIBE TO OUR NEWSLETTER
          </h2>
          <p className="text-xs sm:text-sm font-sans tracking-[0.18em] text-[#555555] uppercase">
            TO GET OFFER, PRODUCT UPDATES
          </p>
        </div>

        {/* Clean Boxed Form matching reference */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto pt-2 space-y-3">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 sm:py-3.5 border border-[#222222] bg-white text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-[#C45E35] focus:border-[#C45E35] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 border border-[#222222] bg-[#222222] hover:bg-[#C45E35] hover:border-[#C45E35] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {subscribed ? (
              <>
                <Check className="w-4 h-4" />
                <span>THANK YOU FOR SUBSCRIBING</span>
              </>
            ) : (
              <span>SUBSCRIBE NOW</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
