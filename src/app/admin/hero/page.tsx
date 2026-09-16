"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  GripVertical,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Smartphone,
  Monitor,
  Upload,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  Layers,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  HeroCampaign,
  getHeroCampaigns,
  saveHeroCampaign,
  saveHeroCampaignsOrder,
  deleteHeroCampaign,
  uploadMediaFile,
} from "@/lib/services/cms";
import { MobileSwipeHero } from "@/components/hero/MobileSwipeHero";
import { HeroProduct } from "@/components/hero/HeroProduct";
import { products } from "@/data/products";

export default function AdminHeroManager() {
  const [campaigns, setCampaigns] = useState<HeroCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active view tab: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Modal / Form state for edit / new campaign
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<HeroCampaign | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load campaigns on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getHeroCampaigns();
        setCampaigns(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Reorder campaigns
  const moveCampaign = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= campaigns.length) return;

    const updated = [...campaigns];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((c, idx) => ({ ...c, sort_order: idx + 1 }));
    setCampaigns(renumbered);
  };

  // Toggle active status
  const toggleActive = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  // Open modal for new campaign
  const handleOpenNew = () => {
    setEditingCampaign({
      id: `hero-${Date.now()}`,
      title: "New Season Icon",
      subtitle: "Haute Maroquinerie",
      description: "Handcrafted in full-grain Italian calfskin with hand-polished gold accents.",
      cta_text: "SHOP NOW",
      cta_url: "/product/safari-quilted-laptop-bag",
      desktop_image: "/images/nishya/carry_your_story_pink_arch.jpg",
      mobile_image: "/images/nishya/carry_your_story_pink_arch.jpg",
      sort_order: campaigns.length + 1,
      is_active: true,
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (campaign: HeroCampaign) => {
    setEditingCampaign({ ...campaign });
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Delete campaign
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you wish to delete this hero campaign?")) return;
    const updated = campaigns.filter((c) => c.id !== id);
    setCampaigns(updated);
    await deleteHeroCampaign(id);
  };

  // Handle image upload from file input
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "desktop" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const res = await uploadMediaFile(file, "cms-media");
      if (res.error) {
        setUploadError(res.error);
      } else if (res.url) {
        if (target === "desktop") {
          setEditingCampaign({
            ...editingCampaign,
            desktop_image: res.url,
            mobile_image: editingCampaign.mobile_image || res.url,
          });
        } else {
          setEditingCampaign({
            ...editingCampaign,
            mobile_image: res.url,
          });
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save campaign from modal
  const handleSaveModal = async () => {
    if (!editingCampaign) return;
    const existingIndex = campaigns.findIndex((c) => c.id === editingCampaign.id);
    let updated: HeroCampaign[];
    if (existingIndex >= 0) {
      updated = [...campaigns];
      updated[existingIndex] = editingCampaign;
    } else {
      updated = [...campaigns, editingCampaign];
    }
    setCampaigns(updated);
    setIsModalOpen(false);
    await saveHeroCampaign(editingCampaign);
  };

  // Publish all changes
  const handlePublishAll = async () => {
    try {
      setSaving(true);
      await saveHeroCampaignsOrder(campaigns);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-3" />
        <p className="font-serif text-sm text-luxury-muted">Retrieving Hero Campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Visual Hero CMS
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Storefront Hero Synchronization</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Hero & High-Fashion Campaigns
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Directly control the mobile 3D swipe cards and desktop asymmetric hero without modifying code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch Tab: Editor vs Live Preview */}
          <div className="flex items-center p-1 bg-black/5 rounded-full border border-luxury-border">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-white text-luxury-charcoal shadow-sm font-semibold"
                  : "text-luxury-muted hover:text-luxury-charcoal"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Campaigns ({campaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "preview"
                  ? "bg-white text-luxury-charcoal shadow-sm font-semibold"
                  : "text-luxury-muted hover:text-luxury-charcoal"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Live Dual Preview</span>
            </button>
          </div>

          <button
            onClick={handlePublishAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-luxury-gold" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4 text-luxury-gold" />
            )}
            <span>{saveSuccess ? "Published Live!" : "Publish to Storefront"}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: EDITOR */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-luxury-muted">
              Drag or use arrows to change the <strong>mobile card swipe order</strong>. The first active slide will also anchor the desktop showcase.
            </p>
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold/10 text-luxury-charcoal hover:bg-luxury-gold/20 border border-luxury-gold/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-luxury-gold" />
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Campaign Cards List */}
          <div className="space-y-3">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border bg-white transition-all shadow-sm ${
                  campaign.is_active ? "border-luxury-border" : "border-dashed border-gray-300 opacity-60"
                }`}
              >
                {/* Left: Drag Handle, Index, Thumbnail, Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1 text-luxury-muted">
                    <button
                      onClick={() => moveCampaign(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:text-luxury-charcoal disabled:opacity-25"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-luxury-charcoal">
                      0{index + 1}
                    </span>
                    <button
                      onClick={() => moveCampaign(index, "down")}
                      disabled={index === campaigns.length - 1}
                      className="p-1 hover:text-luxury-charcoal disabled:opacity-25"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-luxury-soft border border-black/5 shrink-0 shadow-sm">
                    <Image
                      src={campaign.desktop_image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 text-white rounded text-[8px] font-mono">
                      SLIDE {index + 1}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-luxury-charcoal">
                        {campaign.title}
                      </h3>
                      {campaign.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    {campaign.subtitle && (
                      <p className="text-xs font-serif italic text-luxury-gold">
                        &ldquo;{campaign.subtitle}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-luxury-muted line-clamp-1 max-w-md font-sans">
                      {campaign.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-luxury-muted">
                      <span>CTA: <strong className="text-luxury-charcoal font-semibold">{campaign.cta_text}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono text-[10px] text-luxury-charcoal">{campaign.cta_url}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-luxury-border">
                  <button
                    onClick={() => toggleActive(campaign.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      campaign.is_active
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {campaign.is_active ? "Visible" : "Hidden"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(campaign)}
                    className="p-2 rounded-lg text-luxury-charcoal hover:bg-black/5 transition-colors"
                    title="Edit Campaign Content"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: LIVE DUAL PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-luxury-border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-luxury-charcoal uppercase tracking-wider">
                Preview Mode:
              </span>
              <div className="flex items-center p-1 bg-black/5 rounded-full">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    previewDevice === "mobile"
                      ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                      : "text-luxury-muted"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile 3D Swipe Frame</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    previewDevice === "desktop"
                      ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                      : "text-luxury-muted"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop Atelier Layout</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-luxury-muted">
              Live preview rendered with actual production components.
            </div>
          </div>

          {/* DEVICE CONTAINER */}
          {previewDevice === "mobile" ? (
            /* Luxury Smartphone Mockup View */
            <div className="flex justify-center py-6 bg-[#EBE7DF] rounded-2xl border border-luxury-border/60">
              <div className="w-[375px] h-[780px] bg-[#F7F4EF] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-[#1F1E24] overflow-hidden flex flex-col relative">
                {/* Phone Speaker / Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1F1E24] rounded-full z-50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#111] mr-3" />
                  <div className="w-2 h-2 rounded-full bg-blue-950/80" />
                </div>

                {/* Simulated Storefront Header */}
                <div className="pt-7 px-4 pb-2 bg-[#F7F4EF] border-b border-black/5 flex items-center justify-between shrink-0 z-40">
                  <span className="font-serif text-base font-bold tracking-widest text-[#1F1E24]">
                    NISHYA
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-black/5 text-[#1F1E24]">
                    ATELIER
                  </span>
                </div>

                {/* The ACTUAL MobileSwipeHero component passing active campaigns */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  <MobileSwipeHero campaigns={campaigns} />

                  <div className="p-4 text-center">
                    <p className="font-serif text-sm font-bold text-luxury-charcoal">
                      Swipe cards horizontally to test physics & gesture snap
                    </p>
                    <p className="text-[11px] text-luxury-muted mt-1">
                      Cards automatically reflect your order and titles above.
                    </p>
                  </div>
                </div>

                {/* Phone Home Bar */}
                <div className="h-4 bg-[#F7F4EF] flex items-center justify-center shrink-0">
                  <div className="w-28 h-1 bg-black/30 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout Preview */
            <div className="p-8 bg-[#FDFBF7] rounded-2xl border border-luxury-border shadow-sm">
              <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-soft border border-luxury-border">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-luxury-muted">
                      {campaigns[0]?.subtitle || "Haute Maroquinerie Edition"}
                    </span>
                  </div>
                  <h2 className="font-serif text-4xl font-bold text-luxury-charcoal leading-tight">
                    {campaigns[0]?.title || "Your Ultimate Destination for Luxe Handbags"}
                  </h2>
                  <p className="text-sm text-luxury-muted font-light leading-relaxed">
                    {campaigns[0]?.description ||
                      "Crafted for elegance, designed for confidence. Architectural creations sculpted in full-grain Italian leather."}
                  </p>
                  <div className="pt-2">
                    <button className="px-8 py-3.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] font-semibold">
                      {campaigns[0]?.cta_text || "Shop Now"}
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6 flex justify-center">
                  <HeroProduct
                    product={products[0]}
                    currentIndex={0}
                    onSelectIndex={() => {}}
                    totalIndices={4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL: EDIT / CREATE HERO CAMPAIGN */}
      {isModalOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-luxury-border overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal">
                  {campaigns.some((c) => c.id === editingCampaign.id) ? "Edit Hero Campaign" : "Add New Hero Campaign"}
                </h3>
                <p className="font-sans text-xs text-luxury-muted">
                  Configure visual assets, editorial typography, and navigation links.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-charcoal hover:bg-black/5 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Image Manager Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-luxury-charcoal uppercase tracking-wider">
                  Campaign Photograph / Visual (Desktop & Mobile)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desktop Image */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-luxury-muted">Primary High-Res Image:</span>
                    <div className="relative h-44 rounded-xl border border-luxury-border bg-luxury-soft overflow-hidden flex items-center justify-center group">
                      {editingCampaign.desktop_image ? (
                        <Image
                          src={editingCampaign.desktop_image}
                          alt="Campaign visual"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs text-luxury-muted">No Image Selected</span>
                      )}

                      {/* Hover Upload Overlay */}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Upload New Photograph</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e, "desktop")}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={editingCampaign.desktop_image}
                      onChange={(e) =>
                        setEditingCampaign({ ...editingCampaign, desktop_image: e.target.value })
                      }
                      placeholder="Paste image URL directly or upload"
                      className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                    />
                  </div>

                  {/* Mobile Preview / Optional Override */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-luxury-muted">Mobile Vertical Crop:</span>
                    <div className="relative h-44 rounded-xl border border-luxury-border bg-luxury-soft overflow-hidden flex items-center justify-center group">
                      <Image
                        src={editingCampaign.mobile_image || editingCampaign.desktop_image}
                        alt="Mobile crop visual"
                        fill
                        className="object-cover"
                      />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Upload Mobile Crop</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e, "mobile")}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={editingCampaign.mobile_image || ""}
                      onChange={(e) =>
                        setEditingCampaign({ ...editingCampaign, mobile_image: e.target.value })
                      }
                      placeholder="Optional separate mobile image URL"
                      className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                    />
                  </div>
                </div>

                {uploadingImage && (
                  <div className="flex items-center gap-2 text-xs text-luxury-gold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading asset directly to Supabase Storage...</span>
                  </div>
                )}
                {uploadError && (
                  <p className="text-xs text-red-500 font-sans">{uploadError}</p>
                )}
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Campaign Heading / Title
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.title}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-luxury-border text-sm text-luxury-charcoal focus:border-luxury-gold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Subtitle / Eyebrow Tag
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.subtitle || ""}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, subtitle: e.target.value })
                    }
                    placeholder="e.g. Carry Your Story"
                    className="w-full px-3.5 py-2 rounded-xl border border-luxury-border text-sm text-luxury-charcoal focus:border-luxury-gold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-luxury-charcoal">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={editingCampaign.description || ""}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-luxury-border text-sm text-luxury-charcoal focus:border-luxury-gold focus:outline-hidden"
                />
              </div>

              {/* CTA Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Button Text (CTA)
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.cta_text}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, cta_text: e.target.value })
                    }
                    placeholder="SHOP NOW"
                    className="w-full px-3.5 py-2 rounded-xl border border-luxury-border text-sm text-luxury-charcoal focus:border-luxury-gold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Destination URL
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.cta_url}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, cta_url: e.target.value })
                    }
                    placeholder="/product/safari-quilted-laptop-bag"
                    className="w-full px-3.5 py-2 rounded-xl border border-luxury-border text-sm text-luxury-charcoal focus:border-luxury-gold focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-luxury-soft border border-luxury-border">
                <div>
                  <span className="block text-xs font-semibold text-luxury-charcoal">
                    Active on Storefront
                  </span>
                  <span className="text-[11px] text-luxury-muted">
                    If disabled, this card will not appear in the mobile swipe carousel or desktop hero.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editingCampaign.is_active}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, is_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-luxury-gold"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-luxury-border flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-6 py-2 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
