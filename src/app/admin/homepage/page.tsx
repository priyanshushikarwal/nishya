"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Check,
  Edit2,
  Upload,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  HomepageSection,
  getHomepageSections,
  saveHomepageSections,
  uploadMediaFile,
} from "@/lib/services/cms";

export default function HomepageCMSPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active section currently open for detailed content / image editing
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Image upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getHomepageSections();
        // Sort by sort_order
        const sorted = [...data].sort((a, b) => a.sort_order - b.sort_order);
        setSections(sorted);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Reorder sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((sec, idx) => ({
      ...sec,
      sort_order: idx + 1,
    }));
    setSections(renumbered);
  };

  // Toggle visibility [ON] / [OFF]
  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, is_visible: !sec.is_visible } : sec
      )
    );
  };

  // Update content field
  const updateContentField = (
    sectionId: string,
    field: string,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          content: {
            ...sec.content,
            [field]: value,
          },
        };
      })
    );
  };

  // Update section title/subtitle
  const updateMetaField = (
    sectionId: string,
    field: "title" | "subtitle",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, [field]: value } : sec))
    );
  };

  // Handle image upload for section
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionId: string,
    fieldKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFor(`${sectionId}-${fieldKey}`);
      setUploadError(null);
      const res = await uploadMediaFile(file, "cms-media");
      if (res.error) {
        setUploadError(res.error);
      } else if (res.url) {
        updateContentField(sectionId, fieldKey, res.url);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setUploadingFor(null);
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await saveHomepageSections(sections);
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
        <p className="font-serif text-sm text-luxury-muted">Reading Homepage Architecture...</p>
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
              Visual CMS
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Storefront Section Control</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Homepage Section Architecture
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Drag to reorder sections, toggle visibility `[ON]` / `[OFF]`, and edit marketing copy or images without writing code.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-luxury-gold" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4 text-luxury-gold" />
          )}
          <span>{saveSuccess ? "Published Live!" : "Publish Architecture"}</span>
        </button>
      </div>

      {/* Helper Note */}
      <div className="flex items-center gap-3 p-3.5 bg-luxury-soft/80 rounded-xl border border-luxury-border/80 text-xs text-luxury-muted">
        <Sparkles className="w-4 h-4 text-luxury-gold shrink-0" />
        <p>
          Changes saved here directly dictate which sections appear on the homepage and their vertical hierarchy. Click <strong>Customize Content</strong> on any section to edit copy and hero assets.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isExpanded = expandedSectionId === section.id;

          return (
            <div
              key={section.id}
              className={`rounded-xl border bg-white transition-all shadow-xs overflow-hidden ${
                section.is_visible
                  ? "border-luxury-border"
                  : "border-dashed border-gray-300 opacity-60 bg-gray-50/50"
              }`}
            >
              {/* Row Bar */}
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Up / Down Order */}
                  <div className="flex flex-col items-center gap-0.5 text-luxury-muted">
                    <button
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-luxury-charcoal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => moveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:text-luxury-charcoal disabled:opacity-20 cursor-pointer"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section Title & Descriptor */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-luxury-charcoal">
                        {section.title}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/5 text-luxury-muted">
                        #{section.id}
                      </span>
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-luxury-muted font-sans mt-0.5">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls: Visibility Switch & Edit Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-luxury-border">
                  {/* ON / OFF Toggle */}
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      section.is_visible
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {section.is_visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible [ON]</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden [OFF]</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-luxury-border hover:bg-black/5 text-xs text-luxury-charcoal font-medium transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>{isExpanded ? "Collapse" : "Customize Content"}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Content Editor */}
              {isExpanded && (
                <div className="p-5 bg-gray-50 border-t border-luxury-border space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-xs font-semibold text-luxury-charcoal uppercase tracking-wider">
                    Editable Text & Media Attributes
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(section.content || {}).map(([key, val]) => {
                      const isImage =
                        key.toLowerCase().includes("image") ||
                        key.toLowerCase().includes("photo") ||
                        (typeof val === "string" && (val.startsWith("/") || val.startsWith("http")));

                      return (
                        <div key={key} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-luxury-charcoal capitalize">
                            {key.replace(/_/g, " ")}
                          </label>

                          {isImage ? (
                            <div className="space-y-2">
                              <div className="relative h-32 rounded-lg border border-luxury-border bg-white overflow-hidden flex items-center justify-center group">
                                {val ? (
                                  <Image
                                    src={String(val)}
                                    alt={key}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-xs text-luxury-muted">No Image</span>
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                  <Upload className="w-5 h-5 mb-1" />
                                  <span className="text-xs font-semibold">Upload New Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, section.id, key)}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={String(val || "")}
                                onChange={(e) => updateContentField(section.id, key, e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal bg-white"
                                placeholder="Image URL or upload above"
                              />
                            </div>
                          ) : (
                            <textarea
                              rows={2}
                              value={String(val || "")}
                              onChange={(e) => updateContentField(section.id, key, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal bg-white focus:outline-hidden focus:border-luxury-gold"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {uploadingFor && (
                    <div className="flex items-center gap-2 text-xs text-luxury-gold pt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading media asset to Supabase Storage...</span>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs text-red-500 font-sans">{uploadError}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
