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
  Check,
  FolderOpen,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Category } from "@/data/categories";
import { uploadMediaFile } from "@/lib/services/cms";

export interface AdminCategory extends Category {
  image?: string;
  is_visible: boolean;
  sort_order: number;
}

const LOCAL_CATEGORIES_KEY = "nishya_admin_categories_v1";

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped: AdminCategory[] = data.categories.map((c: any, idx: number) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || "",
            count: 0,
            image: c.image || "/images/nishya/carry_your_story_black_gold.jpg",
            is_visible: c.is_visible !== false,
            sort_order: c.sort_order ?? idx + 1,
          }));
          setCategoriesList(mapped);
          localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(mapped));
          return;
        }
      }

      // Local fallback
      const cached = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (cached) {
        setCategoriesList(JSON.parse(cached));
      }
    } catch (err: any) {
      console.error("Error loading categories:", err);
      setErrorMessage("Could not load categories from server. Showing cached data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Save full list or reordered list to server
  const saveAllCategories = async (newList: AdminCategory[], notifyMsg?: string) => {
    setCategoriesList(newList);
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(newList));
    } catch {}

    try {
      setSaving(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newList }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("nishya_categories_updated"));
        if (notifyMsg) showToast(notifyMsg);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || "Failed to save categories to server.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reach server.");
    } finally {
      setSaving(false);
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
    saveAllCategories(renumbered, "Category order updated!");
  };

  const toggleVisibility = async (cat: AdminCategory) => {
    const newVisibility = !cat.is_visible;
    const updated = categoriesList.map((c) =>
      c.id === cat.id ? { ...c, is_visible: newVisibility } : c
    );
    await saveAllCategories(
      updated,
      `Category '${cat.name}' is now ${newVisibility ? "visible" : "hidden"}!`
    );
  };

  const handleOpenNew = () => {
    setEditingCat({
      id: `cat-${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      count: 0,
      image: "/images/nishya/carry_your_story_black_gold.jpg",
      is_visible: true,
      sort_order: categoriesList.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCat({ ...cat });
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Are you sure you want to permanently delete category "${cat.name}"?`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(cat.id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updated = categoriesList.filter((c) => c.id !== cat.id);
        setCategoriesList(updated);
        localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("nishya_categories_updated"));
        showToast(`Category "${cat.name}" deleted successfully!`);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to delete category: ${err.error || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Network error deleting category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCat) return;

    try {
      setUploadingImage(true);
      const res = await uploadMediaFile(file, "cms-media");
      if (res.url) {
        setEditingCat({ ...editingCat, image: res.url });
      } else if (res.error) {
        alert(res.error);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModal = async () => {
    if (!editingCat || !editingCat.name.trim()) {
      alert("Please provide a category name.");
      return;
    }

    const cleanSlug = (editingCat.slug || editingCat.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const finalCat: AdminCategory = {
      ...editingCat,
      name: editingCat.name.trim(),
      slug: cleanSlug,
    };

    const isExisting = categoriesList.some((c) => c.id === finalCat.id);
    let updatedList: AdminCategory[];
    if (isExisting) {
      updatedList = categoriesList.map((c) => (c.id === finalCat.id ? finalCat : c));
    } else {
      updatedList = [...categoriesList, finalCat];
    }

    setIsModalOpen(false);
    await saveAllCategories(
      updatedList,
      isExisting
        ? `Category "${finalCat.name}" updated successfully!`
        : `Category "${finalCat.name}" created successfully!`
    );
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-luxury-charcoal text-white text-xs font-semibold shadow-2xl border border-luxury-gold/30 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Taxonomy &amp; Navigation
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">
              {categoriesList.length} Categories Live
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Categories &amp; Collections
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Add new handbag categories, edit descriptions, toggle visibility on mobile &amp; web navigation, and arrange sorting order.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saving && (
            <div className="flex items-center gap-2 text-xs text-luxury-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-gold" />
              <span>Syncing with database...</span>
            </div>
          )}

          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-luxury-gold" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Helper Card */}
      <div className="flex items-center gap-3 p-3.5 bg-luxury-soft/80 rounded-xl border border-luxury-border/80 text-xs text-luxury-muted">
        <Sparkles className="w-4 h-4 text-luxury-gold shrink-0" />
        <p>
          Categories marked as <strong>Visible</strong> appear in the header navigation, mobile drawer menu, and catalog filter tabs. You can rearrange their display order using the <strong>▲ / ▼</strong> arrows.
        </p>
      </div>

      {/* Category List Table */}
      <div className="rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-luxury-border bg-luxury-soft/50 text-[10px] uppercase font-semibold text-luxury-muted tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Order</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Visibility</th>
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
                      disabled={index === 0 || saving}
                      className="hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer p-0.5"
                      title="Move Category Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] font-bold text-luxury-charcoal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => moveCategory(index, "down")}
                      disabled={index === categoriesList.length - 1 || saving}
                      className="hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer p-0.5"
                      title="Move Category Down"
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
                      <span className="font-serif text-sm font-bold text-luxury-charcoal block">
                        {cat.name}
                      </span>
                      {cat.name === "Pouch Bags" && (
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] uppercase font-bold tracking-wider bg-luxury-gold/15 text-luxury-gold">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Slug */}
                <td className="py-3 px-4 font-mono text-[11px] text-luxury-muted">
                  /products?category={encodeURIComponent(cat.name)}
                </td>

                {/* Description */}
                <td className="py-3 px-4 text-luxury-muted max-w-xs truncate">
                  {cat.description || "—"}
                </td>

                {/* Visibility Toggle */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => toggleVisibility(cat)}
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      cat.is_visible
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {cat.is_visible ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Visible [ON]</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-gray-500" />
                        <span>Hidden [OFF]</span>
                      </>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-luxury-charcoal hover:bg-black/5 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4 text-luxury-gold" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-luxury-border overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal">
                  {categoriesList.some((c) => c.id === editingCat.id)
                    ? "Edit Category"
                    : "Add New Category"}
                </h3>
                <p className="text-xs text-luxury-muted">
                  Configure category name, slug, description, and preview cover image.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-charcoal text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pouch Bags"
                    value={editingCat.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setEditingCat({ ...editingCat, name, slug });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-luxury-charcoal">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pouch-bags"
                    value={editingCat.slug}
                    onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal font-mono focus:outline-hidden focus:border-luxury-gold"
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
                  placeholder="Short artisanal narrative or collection summary"
                  value={editingCat.description}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
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
                      placeholder="Or paste direct image URL"
                      className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-luxury-soft border border-luxury-border/60">
                <div>
                  <span className="text-xs font-semibold text-luxury-charcoal block">
                    Visible in Navigation &amp; Filters
                  </span>
                  <span className="text-[10px] text-luxury-muted">
                    Show in mobile menu drawer, header dropdowns, and products catalog filters.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editingCat.is_visible}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, is_visible: e.target.checked })
                  }
                  className="w-4 h-4 accent-luxury-gold cursor-pointer"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-luxury-border flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={saving}
                className="px-6 py-2 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
