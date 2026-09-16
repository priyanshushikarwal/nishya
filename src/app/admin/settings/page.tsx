"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Save,
  Loader2,
  Check,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
  Sparkles,
  Upload,
  Share2,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/services/cms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface StoreSettingsData {
  brand_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  announcement_text: string;
  announcement_active: boolean;
  contact_email: string;
  contact_phone: string;
  concierge_hours: string;
  address: string;
  instagram_url: string;
  pinterest_url: string;
  shipping_policy_text: string;
  return_policy_text: string;
  footer_tagline: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
}

const defaultSettings: StoreSettingsData = {
  brand_name: "NISHYA",
  tagline: "Haute Maroquinerie & Sculptural Handbag Creations",
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  announcement_text:
    "✦ COMPLIMENTARY INSURED PRIORITY DELIVERY ON ORDERS OVER ₹5,000 | ATELIER GUARANTEE ✦",
  announcement_active: true,
  contact_email: "concierge@nishya.luxury",
  contact_phone: "+91 98200 12345",
  concierge_hours: "Mon – Sat, 10:00 AM – 8:00 PM IST",
  address: "74 Taj Mansions, Colaba Heritage Quarter, Mumbai 400005, India",
  instagram_url: "https://instagram.com/nishya.luxury",
  pinterest_url: "https://pinterest.com/nishya",
  shipping_policy_text:
    "Every Nishya creation is packaged in our signature archival hard box with gilded dustbag and dispatched via temperature-controlled, insured priority express courier.",
  return_policy_text:
    "Complimentary 14-day white-glove inspection return and exchange service for pristine, unworn creations with intact security seals.",
  footer_tagline:
    "Nishya creates architectural handbag silhouettes sculpted in full-grain Italian leather with hand-polished 18k gold hardware.",
  seo_title: "Nishya — Luxe Handbags & Haute Maroquinerie",
  seo_description:
    "Explore luxury handcrafted leather handbags, totes, clutches, and architectural evening silhouettes engineered in full-grain Italian calfskin.",
  seo_og_image: "/images/nishya/carry_your_story_pink_arch.jpg",
};

const LOCAL_SETTINGS_KEY = "nishya_store_settings_v1";

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "seo">("general");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("store_settings")
            .select("*")
            .eq("id", "default")
            .single();
          if (!error && data && data.settings) {
            setSettings({ ...defaultSettings, ...(data.settings as any) });
            return;
          }
        }

        const cached = localStorage.getItem(LOCAL_SETTINGS_KEY);
        if (cached) {
          setSettings(JSON.parse(cached));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
      } catch {}

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase.from("store_settings").upsert({
            id: "default",
            settings: settings as any,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file, "cms-media");
    if (res.url) {
      setSettings({ ...settings, seo_og_image: res.url });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-3" />
        <p className="font-serif text-sm text-luxury-muted">Reading Atelier Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Settings &amp; Meta
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Global Store Parameters</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Storefront Settings &amp; SEO
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Configure brand name, announcement bar, concierge contacts, shipping terms, and global search meta tags.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-luxury-gold" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4 text-luxury-gold" />
          )}
          <span>{saveSuccess ? "Saved Settings!" : "Save Configuration"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-black/5 rounded-full w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === "general"
              ? "bg-white text-luxury-charcoal font-semibold shadow-xs"
              : "text-luxury-muted hover:text-luxury-charcoal"
          }`}
        >
          Brand &amp; Concierge
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === "policies"
              ? "bg-white text-luxury-charcoal font-semibold shadow-xs"
              : "text-luxury-muted hover:text-luxury-charcoal"
          }`}
        >
          Announcement &amp; Policies
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === "seo"
              ? "bg-white text-luxury-charcoal font-semibold shadow-xs"
              : "text-luxury-muted hover:text-luxury-charcoal"
          }`}
        >
          Global SEO &amp; Social Graph
        </button>
      </div>

      {/* Tab: General */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Identity */}
          <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-4 shadow-xs">
            <h3 className="font-serif text-base font-bold text-luxury-charcoal">
              Brand Identity
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Brand Name
              </label>
              <input
                type="text"
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Footer Editorial Blurb
              </label>
              <textarea
                rows={3}
                value={settings.footer_tagline}
                onChange={(e) =>
                  setSettings({ ...settings, footer_tagline: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>
          </div>

          {/* Concierge & Contact */}
          <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-4 shadow-xs">
            <h3 className="font-serif text-base font-bold text-luxury-charcoal">
              Concierge &amp; Atelier Contacts
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Concierge Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({ ...settings, contact_email: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Concierge Phone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) =>
                  setSettings({ ...settings, contact_phone: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Hours of Operation
              </label>
              <input
                type="text"
                value={settings.concierge_hours}
                onChange={(e) =>
                  setSettings({ ...settings, concierge_hours: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-luxury-charcoal">
                Atelier Showroom Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Policies */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          {/* Announcement Bar */}
          <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-charcoal">
                  Official Announcement Bar (Top Marquee)
                </h3>
                <p className="text-xs text-luxury-muted">
                  Displays at the absolute pinnacle of the storefront.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-luxury-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcement_active}
                  onChange={(e) =>
                    setSettings({ ...settings, announcement_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-luxury-gold"
                />
                <span>Active</span>
              </label>
            </div>

            <textarea
              rows={2}
              value={settings.announcement_text}
              onChange={(e) =>
                setSettings({ ...settings, announcement_text: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
            />
          </div>

          {/* Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-luxury-gold" />
                <h3 className="font-serif text-base font-bold text-luxury-charcoal">
                  Insured Delivery Policy
                </h3>
              </div>
              <textarea
                rows={4}
                value={settings.shipping_policy_text}
                onChange={(e) =>
                  setSettings({ ...settings, shipping_policy_text: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal leading-relaxed"
              />
            </div>

            <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-luxury-gold" />
                <h3 className="font-serif text-base font-bold text-luxury-charcoal">
                  Returns &amp; Atelier Inspection Guarantee
                </h3>
              </div>
              <textarea
                rows={4}
                value={settings.return_policy_text}
                onChange={(e) =>
                  setSettings({ ...settings, return_policy_text: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: SEO */}
      {activeTab === "seo" && (
        <div className="p-6 rounded-xl border border-luxury-border bg-white space-y-6 shadow-xs max-w-3xl">
          <div>
            <h3 className="font-serif text-base font-bold text-luxury-charcoal">
              Global Homepage SEO &amp; Social Metadata
            </h3>
            <p className="text-xs text-luxury-muted">
              Controls search engine presentation on Google and link previews on WhatsApp, iMessage, and Twitter.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-luxury-charcoal">
              SEO Title Tag (&lt;title&gt;)
            </label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
            />
            <span className="text-[10px] text-luxury-muted">
              Recommended: 50-60 characters. Current: {settings.seo_title.length} chars.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-luxury-charcoal">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={settings.seo_description}
              onChange={(e) =>
                setSettings({ ...settings, seo_description: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal leading-relaxed"
            />
            <span className="text-[10px] text-luxury-muted">
              Recommended: 120-160 characters. Current: {settings.seo_description.length} chars.
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-luxury-charcoal">
              Open Graph (OG) Share Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 rounded-lg bg-luxury-soft border border-luxury-border overflow-hidden shrink-0">
                {settings.seo_og_image ? (
                  <Image
                    src={settings.seo_og_image}
                    alt="OG Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luxury-muted text-xs">
                    No OG
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-black/5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Upload Share Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleOgUpload}
                  />
                </label>
                <input
                  type="text"
                  value={settings.seo_og_image}
                  onChange={(e) =>
                    setSettings({ ...settings, seo_og_image: e.target.value })
                  }
                  placeholder="Or paste public image URL"
                  className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
