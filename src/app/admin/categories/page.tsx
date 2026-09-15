"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  Save,
  Check,
  FolderOpen,
} from "lucide-react";
import { categories as initialCategories, Category } from "@/data/categories";
import { uploadMediaFile } from "@/lib/services/cms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AdminCategory extends Category {
  image?: string;
  is_visible: boolean;
  sort_order: number;
}

const LOCAL_CATEGORIES_KEY = "pursia_admin_categories_v1";

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });
          if (!error && data && data.length > 0) {
            setCategoriesList(
              data.map((c: any, idx: number) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description || "",
                count: 0,
                image: c.image || "/images/nishya/carry_your_story_pink_arch.jpg",
                is_visible: c.is_visible ?? true,
                sort_order: c.sort_order || idx + 1,
              }))
            );
            return;
          }
        }

        const cached = localStorage.getItem(LOCAL_CATEGORIES_KEY);
        if (cached) {
          setCategoriesList(JSON.parse(cached));
          return;
        }

        const seeded: AdminCategory[] = initialCategories.map((c, idx) => ({
          ...c,
          image:
            idx === 0
              ? "/images/nishya/carry_your_story_pink_arch.jpg"
              : idx === 1
              ? "/images/nishya/carry_your_story_black_gold.jpg"
              : idx === 2
              ? "/images/nishya/carry_your_story_pink_float.jpg"
              : "/images/nishya/little_things_big_joys_basket.jpg",
          is_visible: true,
          sort_order: idx + 1,
        }));
        setCategoriesList(seeded);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const persistCategories = async (newList: AdminCategory[]) => {
    setCategoriesList(newList);
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(newList));
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        for (const cat of newList) {
          await supabase.from("categories").upsert({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            sort_order: cat.sort_order,
            is_visible: cat.is_visible,
          });
        }
      } catch {}
    }
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoriesList.length) return;

    const updated = [...categoriesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((c, idx) => ({ ...c, sort_order: idx + 1 }));
    persistCategories(renumbered);
  };

  const toggleVisibility = (id: string) => {
    const updated = categoriesList.map((c) =>
      c.id === id ? { ...c, is_visible: !c.is_visible } : c
    );
    persistCategories(updated);
  };

  const handleOpenNew = () => {
    setEditingCat({
      id: `cat-${Date.now()}`,
      name: "Miniature Silhouettes",
      slug: "mini-silhouettes",
      description: "Petite sculptural silhouettes engineered for evening poise.",
      count: 0,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
      is_visible: true,
      sort_order: categoriesList.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCat({ ...cat });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const updated = categoriesList.filter((c) => c.id !== id);
    persistCategories(updated);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCat) return;

    try {
      setUploadingImage(true);
      const res = await uploadMediaFile(file, "cms-media");
      if (res.url) {
        setEditingCat({ ...editingCat, image: res.url });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModal = () => {
    if (!editingCat) return;
    const index = categoriesList.findIndex((c) => c.id === editingCat.id);
    let updated: AdminCategory[];
    if (index >= 0) {
      updated = [...categoriesList];
      updated[index] = editingCat;
    } else {
      updated = [...categoriesList, editingCat];
    }
    persistCategories(updated);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-3" />
        <p className="font-serif text-sm text-luxury-muted">Loading Categories Catalogue...</p>
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
              Taxonomy
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Storefront Navigation</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Categories &amp; Collections
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Manage luxury handbag categories, taxonomy slugs, cover photographs, and display hierarchy.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-luxury-gold" />
          <span>New Category</span>
        </button>
      </div>

      {/* Category List Table */}
      <div className="rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-luxury-border bg-luxury-soft/50 text-[10px] uppercase font-semibold text-luxury-muted tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Order</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-border text-xs">
            {categoriesList.map((cat, index) => (
              <tr key={cat.id} className="hover:bg-luxury-soft/30 transition-colors">
                {/* Reorder Up/Down */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-0.5 text-luxury-muted">
                    <button
                      onClick={() => moveCategory(index, "up")}
                      disabled={index === 0}
                      className="hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] font-bold text-luxury-charcoal">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveCategory(index, "down")}
                      disabled={index === categoriesList.length - 1}
                      className="hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* Category with image */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-luxury-soft overflow-hidden border border-black/5 shrink-0">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-luxury-muted">
                          <FolderOpen className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-serif text-sm font-bold text-luxury-charcoal">
                        {cat.name}
                      </span>
                      {cat.count > 0 && (
                        <span className="block text-[10px] text-luxury-muted">
                          {cat.count} pieces assigned
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Slug */}
                <td className="py-3 px-4 font-mono text-[11px] text-luxury-charcoal">
                  /{cat.slug}
                </td>

                {/* Description */}
                <td className="py-3 px-4 text-luxury-muted max-w-xs truncate">
                  {cat.description}
                </td>

                {/* Visibility */}
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleVisibility(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      cat.is_visible
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {cat.is_visible ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-luxury-charcoal hover:bg-black/5 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Edit or Create Category */}
      {isModalOpen && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-luxury-border overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-luxury-charcoal">
                {categoriesList.some((c) => c.id === editingCat.id)
                  ? "Edit Category"
                  : "Create Luxury Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-charcoal"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingCat.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setEditingCat({ ...editingCat, name, slug });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingCat.slug}
                    onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-luxury-charcoal">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCat.description}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                />
              </div>

              {/* Category Cover Image */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-luxury-charcoal">
                  Collection Cover Photograph
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg bg-luxury-soft border border-luxury-border overflow-hidden shrink-0">
                    {editingCat.image ? (
                      <Image
                        src={editingCat.image}
                        alt="Category"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-luxury-muted text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-black/5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-luxury-gold" />
                      <span>{uploadingImage ? "Uploading..." : "Upload New Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingCat.image || ""}
                      onChange={(e) =>
                        setEditingCat({ ...editingCat, image: e.target.value })
                      }
                      placeholder="Or paste image URL"
                      className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-luxury-soft">
                <span className="text-xs font-semibold text-luxury-charcoal">
                  Visible in Navigation &amp; Filters
                </span>
                <input
                  type="checkbox"
                  checked={editingCat.is_visible}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, is_visible: e.target.checked })
                  }
                  className="w-4 h-4 accent-luxury-gold"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-luxury-border flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-6 py-2 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
