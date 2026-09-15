"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Filter,
  ExternalLink,
  Loader2,
  FileImage,
  Layers,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/services/cms";
import { products } from "@/data/products";
import { heroSlidesData } from "@/data/heroSlides";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  usage: "Product Gallery" | "Hero Campaign" | "CMS Editorial" | "General Media";
  uploaded_at: string;
}

// Initial seed media items
const initialMediaList: MediaItem[] = [
  ...products.flatMap((p) =>
    (p.gallery || [p.image]).map((img, i) => ({
      id: `media-prod-${p.id}-${i}`,
      name: `${p.slug}-view-${i + 1}.jpg`,
      url: img,
      size: "1.4 MB",
      type: "image/jpeg",
      usage: "Product Gallery" as const,
      uploaded_at: "2026-03-10",
    }))
  ),
  ...heroSlidesData.map((s, i) => ({
    id: `media-hero-${s.id}`,
    name: `hero-campaign-editorial-${i + 1}.jpg`,
    url: s.image,
    size: "2.1 MB",
    type: "image/jpeg",
    usage: "Hero Campaign" as const,
    uploaded_at: "2026-03-12",
  })),
];

const LOCAL_MEDIA_KEY = "pursia_admin_media_library_v1";

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUsage, setFilterUsage] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_MEDIA_KEY);
      if (cached) {
        setMediaList(JSON.parse(cached));
        return;
      }
    } catch {}
    setMediaList(initialMediaList);
  }, []);

  const saveMediaList = (newList: MediaItem[]) => {
    setMediaList(newList);
    try {
      localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(newList));
    } catch {}
  };

  // Handle multi-upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await uploadMediaFile(file, "product-media");
      if (res.url) {
        newItems.push({
          id: `media-custom-${Date.now()}-${i}`,
          name: file.name,
          url: res.url,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || "image/jpeg",
          usage: "General Media",
          uploaded_at: new Date().toISOString().split("T")[0],
        });
      }
    }

    saveMediaList([...newItems, ...mediaList]);
    setUploading(false);
  };

  // Delete media item
  const handleDelete = (id: string) => {
    const updated = mediaList.filter((m) => m.id !== id);
    saveMediaList(updated);
    setDeleteConfirmId(null);
  };

  // Copy URL to clipboard
  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered media
  const filtered = mediaList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.usage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUsage =
      filterUsage === "all" || m.usage.toLowerCase().includes(filterUsage.toLowerCase());
    return matchesSearch && matchesUsage;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Supabase Storage
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Asset Management</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Media & Asset Library
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            All photography, banners, and lookbooks stored in Supabase buckets (<code>product-media</code> &amp; <code>cms-media</code>).
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-luxury-gold" />
            ) : (
              <Upload className="w-4 h-4 text-luxury-gold" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Photographs"}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-luxury-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or usage..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-luxury-muted" />
          <select
            value={filterUsage}
            onChange={(e) => setFilterUsage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Media Usages</option>
            <option value="Product Gallery">Product Gallery</option>
            <option value="Hero Campaign">Hero Campaign</option>
            <option value="CMS Editorial">CMS Editorial</option>
            <option value="General Media">General Media</option>
          </select>
          <span className="text-xs text-luxury-muted pl-2">
            Showing {filtered.length} files
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative aspect-4/5 w-full bg-luxury-soft overflow-hidden">
              <Image
                src={item.url}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="p-2 rounded-full bg-white/90 text-luxury-charcoal hover:bg-white hover:scale-110 transition-all cursor-pointer"
                  title="Copy Public URL"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/90 text-luxury-charcoal hover:bg-white hover:scale-110 transition-all"
                  title="View High-Res"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all cursor-pointer"
                  title="Delete Photograph"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tag Pill */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-medium text-white tracking-wide">
                {item.usage}
              </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 space-y-1">
              <p className="text-xs font-semibold text-luxury-charcoal truncate" title={item.name}>
                {item.name}
              </p>
              <div className="flex items-center justify-between text-[10px] text-luxury-muted">
                <span>{item.size}</span>
                <span>{item.uploaded_at}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-luxury-border">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-luxury-charcoal">
                Confirm Asset Deletion
              </h3>
              <p className="text-xs text-luxury-muted mt-1 leading-relaxed">
                Deleting this photograph may break published lookbooks or product galleries if currently actively referenced on the storefront.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
