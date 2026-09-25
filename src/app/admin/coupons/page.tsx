"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Percent,
  IndianRupee,
  ShieldAlert,
  Search,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  validUntil?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    description: string;
    type: "percentage" | "fixed";
    value: number;
    minOrder: string;
    maxDiscount: string;
    validUntil: string;
    usageLimit: string;
    isActive: boolean;
  }>({
    code: "",
    description: "",
    type: "percentage",
    value: 10,
    minOrder: "",
    maxDiscount: "",
    validUntil: "",
    usageLimit: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (res.ok && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const updated = { ...coupon, isActive: !coupon.isActive };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === coupon.code ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error("Error toggling coupon status:", err);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you wish to decommission coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError("Privilege Code cannot be blank.");
      return;
    }

    if (formData.value <= 0) {
      setFormError("Discount value must be greater than zero.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: cleanCode,
        description: formData.description.trim() || undefined,
        type: formData.type,
        value: Number(formData.value),
        minOrder: formData.minOrder ? Number(formData.minOrder) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: formData.isActive,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create coupon.");
        setIsSaving(false);
        return;
      }

      setIsModalOpen(false);
      setFormData({
        code: "",
        description: "",
        type: "percentage",
        value: 10,
        minOrder: "",
        maxDiscount: "",
        validUntil: "",
        usageLimit: "",
        isActive: true,
      });
      await fetchCoupons();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-luxury-gold/10 text-luxury-gold">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
              Privilege Coupons & Atelier Offers
            </h1>
          </div>
          <p className="text-xs text-luxury-muted mt-1">
            Bank-grade server validated promotional codes with quota enforcement and brute-force shields.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-luxury-gold" />
          <span>New Privilege Code</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-luxury-border shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-luxury-muted font-semibold block">
            Total Vault Coupons
          </span>
          <span className="font-serif text-2xl font-bold text-luxury-charcoal mt-1 block">
            {totalCoupons}
          </span>
          <span className="text-[10px] text-luxury-muted mt-1 block">Stored in secure database vault</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-luxury-border shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-luxury-muted font-semibold block">
            Active Campaign Codes
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
            {activeCoupons}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Currently eligible for client redemption</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-luxury-border shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-luxury-muted font-semibold block">
            Total Client Redemptions
          </span>
          <span className="font-serif text-2xl font-bold text-luxury-gold mt-1 block">
            {totalRedemptions}
          </span>
          <span className="text-[10px] text-luxury-muted mt-1 block">Successfully verified & placed orders</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-luxury-border shadow-xs">
        <Search className="w-4 h-4 text-luxury-muted ml-2" />
        <input
          type="text"
          placeholder="Search by code or description (e.g. LUXE10, VIP)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-luxury-charcoal placeholder:text-luxury-muted/70 focus:outline-none bg-transparent"
        />
      </div>

      {/* Coupons Table / Grid */}
      <div className="bg-white rounded-3xl border border-luxury-border overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-luxury-muted uppercase tracking-wider">
              Decrypting promotional vault...
            </p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-luxury-gold mx-auto opacity-60" />
            <h3 className="font-serif text-base font-bold text-luxury-charcoal">
              No Privilege Codes Found
            </h3>
            <p className="text-xs text-luxury-muted max-w-sm mx-auto">
              Create your first promotional capsule code to reward esteemed Nishya clients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-luxury-muted uppercase tracking-wider border-b border-luxury-border text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Privilege Code</th>
                  <th className="py-3.5 px-6 font-semibold">Benefit Value</th>
                  <th className="py-3.5 px-6 font-semibold">Order Conditions</th>
                  <th className="py-3.5 px-6 font-semibold">Usage & Quota</th>
                  <th className="py-3.5 px-6 font-semibold">Expiry Date</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/60">
                {filteredCoupons.map((coupon) => {
                  const isExpired =
                    coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now();
                  const isLimitReached =
                    coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit;

                  return (
                    <tr
                      key={coupon.code}
                      className="hover:bg-luxury-soft/30 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-lg bg-luxury-charcoal text-white">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy code"
                            className="p-1 text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-luxury-muted mt-0.5 line-clamp-1">
                          {coupon.description}
                        </p>
                      </td>

                      {/* Benefit */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-luxury-charcoal flex items-center gap-1">
                          {coupon.type === "percentage" ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-luxury-gold" />
                              <span>{coupon.value}% Off</span>
                            </>
                          ) : (
                            <>
                              <IndianRupee className="w-3.5 h-3.5 text-luxury-gold" />
                              <span>{formatPrice(coupon.value)} Flat</span>
                            </>
                          )}
                        </div>
                        {coupon.maxDiscount ? (
                          <span className="text-[10px] text-luxury-muted block">
                            Cap: {formatPrice(coupon.maxDiscount)}
                          </span>
                        ) : null}
                      </td>

                      {/* Conditions */}
                      <td className="py-4 px-6 text-luxury-charcoal">
                        {coupon.minOrder ? (
                          <span className="font-medium">Min: {formatPrice(coupon.minOrder)}</span>
                        ) : (
                          <span className="text-luxury-muted">No Minimum</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-luxury-charcoal">
                          {coupon.usedCount || 0}
                        </span>
                        <span className="text-luxury-muted">
                          {" "}
                          / {coupon.usageLimit ? `${coupon.usageLimit} Max` : "∞"}
                        </span>
                        {isLimitReached && (
                          <span className="block text-[9px] text-red-600 font-semibold">
                            Quota Full
                          </span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-6">
                        {coupon.validUntil ? (
                          <div>
                            <span
                              className={`font-medium ${
                                isExpired ? "text-red-600 font-semibold" : "text-luxury-charcoal"
                              }`}
                            >
                              {new Date(coupon.validUntil).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {isExpired && (
                              <span className="block text-[9px] text-red-600 font-semibold">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-luxury-muted">Perpetual</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                            coupon.isActive && !isExpired && !isLimitReached
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.isActive && !isExpired && !isLimitReached
                                ? "bg-emerald-600 animate-pulse"
                                : "bg-gray-400"
                            }`}
                          />
                          <span>
                            {coupon.isActive && !isExpired && !isLimitReached
                              ? "Active"
                              : "Deactivated"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(coupon.code)}
                          className="p-1.5 text-luxury-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Decommission Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-luxury-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-luxury-gold" />
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal">
                  Create Privilege Code
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-charcoal cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                  Coupon Code (e.g. LUXE15)
                </label>
                <input
                  type="text"
                  required
                  placeholder="LUXE15"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                  Atelier Description / Client Note
                </label>
                <input
                  type="text"
                  placeholder="15% off inaugural collection order"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as "percentage" | "fixed" })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Value {formData.type === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Min Acquisition (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3000 (Optional)"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2000 (Optional)"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="text-luxury-muted uppercase tracking-wider font-semibold block mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50 (Optional)"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-luxury-border focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-luxury-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-luxury-border text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white font-semibold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Seal Privilege Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
