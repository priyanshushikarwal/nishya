"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { products } from "@/data/products";

interface ReviewItem {
  id: string;
  customer_name: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_image: string;
  rating: number;
  headline: string;
  comment: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

const initialReviews: ReviewItem[] = [
  {
    id: "rev-1",
    customer_name: "Arya Singhania",
    customer_email: "arya.s@vogue.in",
    product_id: products[0].id,
    product_name: products[0].name,
    product_image: products[0].image,
    rating: 5,
    headline: "Unmatched Italian Architectural Poise",
    comment:
      "The quilted calfskin feels exquisitely supple and the 18k hardware has substantial weight. Exceeded expectations in every dimension.",
    created_at: "2026-03-12",
    status: "approved",
  },
  {
    id: "rev-2",
    customer_name: "Devika Oberoi",
    customer_email: "devika@oberoi.luxury",
    product_id: products[1].id,
    product_name: products[1].name,
    product_image: products[1].image,
    rating: 5,
    headline: "Heritage In Every Stitch",
    comment:
      "A true collector's piece. The Mughal forest motifs are subtle, tasteful, and evoke Florence atelier excellence.",
    created_at: "2026-03-13",
    status: "approved",
  },
  {
    id: "rev-3",
    customer_name: "Rohit Kapadia",
    customer_email: "rohit@kapadia.co",
    product_id: products[2].id,
    product_name: products[2].name,
    product_image: products[2].image,
    rating: 4,
    headline: "Stunning silhouette, fast courier",
    comment:
      "The gold arch architecture gets compliments every time I enter a boardroom. Would love to see an additional strap option.",
    created_at: "2026-03-14",
    status: "pending",
  },
];

const LOCAL_REVIEWS_KEY = "pursia_admin_reviews_v1";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_REVIEWS_KEY);
      if (cached) {
        setReviews(JSON.parse(cached));
        return;
      }
    } catch {}
    setReviews(initialReviews);
  }, []);

  const persistReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleStatus = (id: string, status: "approved" | "rejected") => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    persistReviews(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this client testimonial?")) return;
    const updated = reviews.filter((r) => r.id !== id);
    persistReviews(updated);
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Curation
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Client Testimonials</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Customer Reviews &amp; Ratings
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Moderate, approve, and curate authentic verified purchaser reviews across the atelier collection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-luxury-soft border border-luxury-border text-xs text-luxury-muted">
            Total Reviews: <strong className="text-luxury-charcoal font-semibold">{reviews.length}</strong>
          </div>
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
            placeholder="Search by client, piece, or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-luxury-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Moderation</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-xl border border-luxury-border bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            {/* Left: Product, Customer & Review Body */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-20 rounded-lg bg-luxury-soft overflow-hidden border border-black/5 shrink-0">
                <Image
                  src={rev.product_image}
                  alt={rev.product_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-luxury-charcoal text-sm">
                    {rev.customer_name}
                  </span>
                  <span className="text-[10px] text-luxury-muted">&bull;</span>
                  <span className="text-[11px] text-luxury-muted">{rev.customer_email}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      rev.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : rev.status === "rejected"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-luxury-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-luxury-gold text-luxury-gold" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-serif font-semibold text-xs text-luxury-charcoal">
                    &ldquo;{rev.headline}&rdquo;
                  </span>
                </div>

                <p className="text-xs text-luxury-muted font-sans max-w-xl leading-relaxed">
                  {rev.comment}
                </p>

                <div className="text-[10px] text-luxury-muted pt-1">
                  Product: <strong className="text-luxury-charcoal">{rev.product_name}</strong> &bull; {rev.created_at}
                </div>
              </div>
            </div>

            {/* Right: Moderation Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-luxury-border">
              {rev.status !== "approved" && (
                <button
                  onClick={() => handleStatus(rev.id, "approved")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              )}

              {rev.status !== "rejected" && (
                <button
                  onClick={() => handleStatus(rev.id, "rejected")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Testimonial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
