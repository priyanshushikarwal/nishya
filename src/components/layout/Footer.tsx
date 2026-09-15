"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, RefreshCw, Truck, ChevronDown } from "lucide-react";
import { InstagramIcon, FacebookIcon, PinterestIcon } from "@/components/decorative/SocialIcons";
import { cn } from "@/lib/utils";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    shop: false,
    help: false,
    company: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative bg-[#1A191E] text-white border-t border-white/10 pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-14 overflow-x-clip">
      {/* Luxury Value Strip Above Footer Links */}
      <div className="w-full max-w-[1360px] mx-auto pb-8 sm:pb-12 mb-8 sm:mb-12 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-semibold text-white">White-Glove Delivery</h4>
            <p className="text-xs text-white/60 mt-0.5">Free express on orders over ₹5,000</p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-semibold text-white">Lifetime Craft Guarantee</h4>
            <p className="text-xs text-white/60 mt-0.5">Full-grain Florentine calfskin & 18K hardware</p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-semibold text-white">Concierge Returns</h4>
            <p className="text-xs text-white/60 mt-0.5">Complimentary 14-day home pick-up</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-14 border-b border-white/10">
        {/* Brand Column (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 text-center sm:text-left">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-white hover:text-luxury-gold transition-colors">
              Pursia
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-white/65 font-sans font-light leading-relaxed max-w-sm mx-auto sm:mx-0">
            Pursia redefines the modern purse through architectural poise, master-tanned Italian
            leathers, and understated gilded hardware. Designed for confidence.
          </p>

          {/* Social Icons (Min 44px tap targets) */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-luxury-gold flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Pursia on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-luxury-gold flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Pursia on Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-luxury-gold flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Pursia on Pinterest"
            >
              <PinterestIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* MOBILE ACCORDION / DESKTOP EXPANDED COLUMNS (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Shop Column / Accordion */}
          <div className="border-b border-white/10 lg:border-none pb-2 lg:pb-0">
            <button
              onClick={() => toggleSection("shop")}
              className="w-full flex items-center justify-between py-3 lg:py-0 text-left font-semibold text-luxury-gold text-xs uppercase tracking-[0.25em] cursor-pointer lg:cursor-default"
            >
              <span>Shop</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-white/60 transition-transform lg:hidden",
                  openSections.shop && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 lg:!block lg:!max-h-none lg:pt-3",
                openSections.shop ? "max-h-60 pb-3" : "max-h-0 lg:max-h-none"
              )}
            >
              <ul className="space-y-2.5 text-xs text-white/70">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Handbags" className="hover:text-white transition-colors block py-0.5">
                    Handbags
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Clutches" className="hover:text-white transition-colors block py-0.5">
                    Clutches
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Totes" className="hover:text-white transition-colors block py-0.5">
                    Totes
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Shoulder Bags" className="hover:text-white transition-colors block py-0.5">
                    Shoulder Bags
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Client Service Column / Accordion */}
          <div className="border-b border-white/10 lg:border-none pb-2 lg:pb-0">
            <button
              onClick={() => toggleSection("help")}
              className="w-full flex items-center justify-between py-3 lg:py-0 text-left font-semibold text-luxury-gold text-xs uppercase tracking-[0.25em] cursor-pointer lg:cursor-default"
            >
              <span>Client Service</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-white/60 transition-transform lg:hidden",
                  openSections.help && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 lg:!block lg:!max-h-none lg:pt-3",
                openSections.help ? "max-h-60 pb-3" : "max-h-0 lg:max-h-none"
              )}
            >
              <ul className="space-y-2.5 text-xs text-white/70">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    Contact Concierge
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    Shipping & Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    Leather Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors block py-0.5">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-3 pt-2 lg:pt-0">
          <h5 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-luxury-gold">
            The Pursia Gazette
          </h5>
          <p className="text-xs text-white/70 font-light leading-relaxed">
            Join our world of timeless elegance. Receive private invitations to capsule previews
            and private sales.
          </p>

          <form onSubmit={handleSubmit} className="pt-1">
            <div className="flex w-full rounded-full overflow-hidden border border-white/20 focus-within:border-luxury-gold bg-white/5 transition-colors">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs bg-transparent text-white placeholder:text-white/40 focus:outline-none min-h-[44px]"
              />
              <button
                type="submit"
                className="px-5 bg-luxury-gold hover:bg-luxury-gold-light text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center shrink-0 cursor-pointer min-h-[44px]"
              >
                {subscribed ? <Check className="w-4 h-4 text-white" /> : "Subscribe"}
              </button>
            </div>
          </form>

          {subscribed && (
            <p className="text-[11px] text-emerald-400 mt-1">
              ✓ Welcome to Pursia. An invitation has been dispatched to your inbox.
            </p>
          )}
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="w-full max-w-[1360px] mx-auto pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50 text-center sm:text-left">
        <div>
          © {new Date().getFullYear()} Pursia Haute Maroquinerie. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span className="hover:text-white/80 cursor-pointer transition-colors py-1">Privacy Policy</span>
          <span className="hover:text-white/80 cursor-pointer transition-colors py-1">Terms of Service</span>
          <span className="hover:text-white/80 cursor-pointer transition-colors py-1">Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
