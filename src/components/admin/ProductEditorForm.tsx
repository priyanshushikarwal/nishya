"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Star,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Product } from "@/types/product";
import { adminSaveProduct, getCategories } from "@/lib/services/products";
import { categories as defaultCategories } from "@/data/categories";
import { uploadMediaFile } from "@/lib/services/cms";
import { calculateDiscount, formatPrice } from "@/lib/utils";

interface ProductEditorFormProps {
  initialProduct?: Product;
}

export function ProductEditorForm({ initialProduct }: ProductEditorFormProps) {
  const router = useRouter();

  const [product, setProduct] = useState<Product>(
    initialProduct || {
      id: `nishya-${Date.now()}`,
      name: "",
      slug: "",
      tagline: "",
      price: 2999,
      originalPrice: 5999,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
      secondaryImage: "/images/nishya/carry_your_story_pink_float.jpg",
      gallery: [
        "/images/nishya/carry_your_story_pink_arch.jpg",
        "/images/nishya/carry_your_story_pink_float.jpg",
      ],
      category: "Handbags",
      badge: "New Arrival",
      description: "",
      story: "",
      details: ["Handcrafted full-grain calfskin", "Padded interior with magnetic lock"],
      care: ["Clean with a soft dry cloth", "Store in Nishya dustbag"],
      material: "100% Full-grain Italian calfskin",
      dimensions: "28cm (W) x 20cm (H) x 8cm (D)",
      weight: "450g",
      closure: "Magnetic snap with brass emblem",
      interior: "Main compartment with zippered pocket",
      strap: "Adjustable leather shoulder strap",
      lining: "Satin micro-fiber lining",
      sku: `NIS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      origin: "Handcrafted in Florence, Italy",
      color: "Warm Cognac",
      colors: [
        { name: "Warm Cognac", hex: "#B87924" },
        { name: "Onyx Black", hex: "#1A1A1A" },
      ],
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      featured: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDetailText, setNewDetailText] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#B87924");

  // Dynamic available categories from database with local fallback
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    return defaultCategories
      .filter((c) => c.slug !== "all")
      .map((c) => c.name);
  });

  useEffect(() => {
    getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        const names = cats.filter((c) => c.slug !== "all").map((c) => c.name);
        setAvailableCategories(names);
      }
    });
  }, []);

  // Auto-generate slug from name if creating new
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setProduct((prev) => ({
      ...prev,
      name,
      slug: initialProduct ? prev.slug : slug,
    }));
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newGallery = [...(product.gallery || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await uploadMediaFile(file, "product-media");
      if (res.url) {
        newGallery.push(res.url);
      }
    }

    setProduct((prev) => ({
      ...prev,
      gallery: newGallery,
      image: prev.image || newGallery[0] || "",
    }));
    setUploading(false);
  };

  // Set Primary Image (★)
  const setPrimaryImage = (imgUrl: string) => {
    setProduct((prev) => {
      const gallery = prev.gallery || [];
      const filtered = gallery.filter((img) => img !== imgUrl);
      return {
        ...prev,
        image: imgUrl,
        gallery: [imgUrl, ...filtered],
      };
    });
  };

  // Delete Image
  const deleteImage = (imgUrl: string) => {
    setProduct((prev) => {
      const gallery = (prev.gallery || []).filter((img) => img !== imgUrl);
      return {
        ...prev,
        gallery,
        image: prev.image === imgUrl ? gallery[0] || "" : prev.image,
      };
    });
  };

  // Move image index
  const moveImage = (index: number, direction: "left" | "right") => {
    const gallery = [...(product.gallery || [])];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const temp = gallery[index];
    gallery[index] = gallery[targetIndex];
    gallery[targetIndex] = temp;

    setProduct((prev) => ({
      ...prev,
      gallery,
      image: targetIndex === 0 ? gallery[0] : prev.image,
    }));
  };

  // Add detail bullet
  const handleAddDetail = () => {
    if (!newDetailText.trim()) return;
    setProduct((prev) => ({
      ...prev,
      details: [...(prev.details || []), newDetailText.trim()],
    }));
    setNewDetailText("");
  };

  const handleRemoveDetail = (idx: number) => {
    setProduct((prev) => ({
      ...prev,
      details: (prev.details || []).filter((_, i) => i !== idx),
    }));
  };

  // Add color variant
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setProduct((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: newColorName.trim(), hex: newColorHex }],
      color: prev.color || newColorName.trim(),
    }));
    setNewColorName("");
  };

  const handleRemoveColor = (name: string) => {
    setProduct((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((c) => c.name !== name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminSaveProduct(product);
    setSaving(false);
    router.push("/admin/products");
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#F8F6F2]/95 backdrop-blur-md py-3 border-b border-luxury-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-9 h-9 rounded-full bg-white border border-luxury-border flex items-center justify-center text-luxury-charcoal hover:text-luxury-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-luxury-gold">
              Product Editor
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-luxury-charcoal">
              {product.name ? product.name : "Untitled Creation"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {initialProduct && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-luxury-border bg-white text-luxury-charcoal hover:text-luxury-gold text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Preview Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal hover:bg-luxury-gold text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing..." : "Publish Creation"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ======================================================== */}
        {/* LEFT COLUMN: 8 COLS (Information & Specifications)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Basic Information Card */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Basic Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Safari Quilted Laptop Bag"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Slug (URL Path) *
                </label>
                <input
                  type="text"
                  required
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  placeholder="safari-quilted-laptop-bag"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm font-mono text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  SKU Identifier
                </label>
                <input
                  type="text"
                  value={product.sku || ""}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                  placeholder="PUR-SAF-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm font-mono text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Atelier Category
                </label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold cursor-pointer"
                >
                  {availableCategories.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                  {product.category && !availableCategories.includes(product.category) && (
                    <option value={product.category}>{product.category}</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Promotional Badge
                </label>
                <input
                  type="text"
                  value={product.badge || ""}
                  onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                  placeholder="e.g. Bestseller, 50% OFF, Heritage"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  value={product.tagline || ""}
                  onChange={(e) => setProduct({ ...product, tagline: e.target.value })}
                  placeholder="e.g. Carry Your Story"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* 2. Visual Photography & Media Manager (Crucial Requirement) */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-luxury-border pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-luxury-charcoal">
                  Campaign Photography Gallery
                </h2>
                <p className="text-xs text-luxury-muted">
                  Upload multiple high-res angles (Front, Profile, Detail, Interior, Lifestyle)
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-soft hover:bg-luxury-border/60 text-luxury-charcoal text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-luxury-border">
                <UploadCloud className="w-4 h-4 text-luxury-gold" />
                <span>{uploading ? "Uploading..." : "Upload Photos"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {(product.gallery || []).map((imgUrl, idx) => {
                const isPrimary = product.image === imgUrl;
                return (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-luxury-soft/50 group transition-all ${
                      isPrimary
                        ? "border-luxury-gold shadow-md scale-[1.02]"
                        : "border-luxury-border hover:border-luxury-gold/50"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Product view ${idx + 1}`}
                      fill
                      sizes="200px"
                      className="object-contain p-2"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-luxury-gold text-white text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Primary</span>
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => deleteImage(imgUrl)}
                          className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-600"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, "left")}
                            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (product.gallery?.length || 0) - 1}
                            onClick={() => moveImage(idx, "right")}
                            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(imgUrl)}
                            className="px-2 py-1 rounded-md bg-white text-black text-[10px] font-semibold hover:bg-luxury-gold hover:text-white transition-colors"
                          >
                            Set ★
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Descriptions & Story */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Editorial Narrative & Story
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Short Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Brief summary of the creation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Atelier Story & Inspiration
                </label>
                <textarea
                  rows={3}
                  value={product.story || ""}
                  onChange={(e) => setProduct({ ...product, story: e.target.value })}
                  placeholder="In-depth narrative on the design heritage, leather origin, or sculpture..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-charcoal focus:outline-none focus:border-luxury-gold leading-relaxed"
                />
              </div>

              {/* Craft Highlights */}
              <div className="space-y-2 pt-2">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted block">
                  Craft Details & Feature Highlights
                </label>

                <div className="space-y-2">
                  {(product.details || []).map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-luxury-soft/50 border border-luxury-border text-xs"
                    >
                      <span>{detail}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDetail(idx)}
                        className="text-luxury-muted hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newDetailText}
                    onChange={(e) => setNewDetailText(e.target.value)}
                    placeholder="Add craft detail (e.g. 18k gold turnlock)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="px-4 py-2 rounded-xl bg-luxury-charcoal text-white text-xs font-semibold hover:bg-luxury-gold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Specifications */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Material
                </label>
                <input
                  type="text"
                  value={product.material || ""}
                  onChange={(e) => setProduct({ ...product, material: e.target.value })}
                  placeholder="Full-grain Italian calfskin"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={product.dimensions || ""}
                  onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                  placeholder="28cm (W) x 20cm (H) x 8cm (D)"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Weight
                </label>
                <input
                  type="text"
                  value={product.weight || ""}
                  onChange={(e) => setProduct({ ...product, weight: e.target.value })}
                  placeholder="480g"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Closure
                </label>
                <input
                  type="text"
                  value={product.closure || ""}
                  onChange={(e) => setProduct({ ...product, closure: e.target.value })}
                  placeholder="Magnetic snap with brass turnlock"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Interior Layout
                </label>
                <input
                  type="text"
                  value={product.interior || ""}
                  onChange={(e) => setProduct({ ...product, interior: e.target.value })}
                  placeholder="Main compartment with zip pocket"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Strap / Handle
                </label>
                <input
                  type="text"
                  value={product.strap || ""}
                  onChange={(e) => setProduct({ ...product, strap: e.target.value })}
                  placeholder="Reinforced dual handles + shoulder strap"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Lining
                </label>
                <input
                  type="text"
                  value={product.lining || ""}
                  onChange={(e) => setProduct({ ...product, lining: e.target.value })}
                  placeholder="Champagne satin micro-twill"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Origin
                </label>
                <input
                  type="text"
                  value={product.origin || ""}
                  onChange={(e) => setProduct({ ...product, origin: e.target.value })}
                  placeholder="Handcrafted in Florence, Italy"
                  className="w-full px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: 4 COLS (Pricing, Variants, Status, SEO)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing Card */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Pricing (INR)
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-base font-bold text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-semibold tracking-wider text-luxury-muted">
                  Original Price (Strikethrough ₹)
                </label>
                <input
                  type="number"
                  value={product.originalPrice || ""}
                  onChange={(e) =>
                    setProduct({ ...product, originalPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-soft/60 border border-luxury-border text-sm text-luxury-muted focus:outline-none focus:border-luxury-gold"
                />
              </div>

              {discount > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                  <span>Collector Savings:</span>
                  <span className="font-bold">Save {discount}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Color Finish Variants Card */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Color Finishes
            </h2>

            <div className="space-y-3">
              <div className="space-y-2">
                {(product.colors || []).map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-luxury-soft/50 border border-luxury-border text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-medium text-luxury-charcoal">{c.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c.name)}
                      className="text-luxury-muted hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-luxury-border/60 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-luxury-border cursor-pointer bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="e.g. Mughal Noir"
                    className="flex-1 px-3 py-2 rounded-xl bg-luxury-soft/60 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="w-full py-2 rounded-xl bg-luxury-charcoal text-white text-xs font-semibold hover:bg-luxury-gold transition-colors"
                >
                  + Add Color Finish
                </button>
              </div>
            </div>
          </div>

          {/* Visibility & Stock Settings */}
          <div className="p-6 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
              Stock & Visibility
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-luxury-soft/50 border border-luxury-border text-xs font-semibold cursor-pointer">
                <span>In Stock & Available</span>
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-luxury-soft/50 border border-luxury-border text-xs font-semibold cursor-pointer">
                <span>Featured on Storefront</span>
                <input
                  type="checkbox"
                  checked={product.featured || false}
                  onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
