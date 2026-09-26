"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  User,
  MapPin,
  Calendar,
  X,
  ArrowUpRight,
} from "lucide-react";
import { AdminCustomer } from "@/app/api/admin/customers/route";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [stats, setStats] = useState({
    total_registered: 0,
    total_guests: 0,
    total_orders_placed: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "registered" | "buyers" | "admin">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  const fetchCustomers = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter based on search query and active tab
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === "registered") {
      return c.source === "registered" && c.role !== "admin";
    }
    if (activeTab === "buyers") {
      return c.orders_count > 0;
    }
    if (activeTab === "admin") {
      return c.role === "admin";
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Patron Directory
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Live Registered Accounts &amp; Buyers</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Clients &amp; Patrons
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Authoritative directory of real registered accounts, client contact profiles, and lifetime acquisitions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCustomers(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-luxury-border bg-white hover:bg-luxury-soft text-luxury-charcoal text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh patron list from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-luxury-gold ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered Accounts */}
        <div className="p-4 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-luxury-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Registered Accounts</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-luxury-charcoal">
            {stats.total_registered}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">Real signed-up patrons</p>
        </div>

        {/* Guest Buyers */}
        <div className="p-4 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-luxury-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Guest Checkout Buyers</span>
            <ShoppingBag className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="font-serif text-2xl font-bold text-luxury-charcoal">
            {stats.total_guests}
          </div>
          <p className="text-[10px] text-luxury-muted font-medium">Placed orders without password</p>
        </div>

        {/* Total Acquisitions */}
        <div className="p-4 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-luxury-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Commissions</span>
            <ShoppingBag className="w-4 h-4 text-luxury-charcoal" />
          </div>
          <div className="font-serif text-2xl font-bold text-luxury-charcoal">
            {stats.total_orders_placed}
          </div>
          <p className="text-[10px] text-luxury-muted font-medium">Combined orders placed</p>
        </div>

        {/* Total Spend */}
        <div className="p-4 rounded-2xl bg-white border border-luxury-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-luxury-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Value</span>
            <Sparkles className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="font-serif text-2xl font-bold text-luxury-charcoal">
            ₹{stats.total_revenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-luxury-muted font-medium">Lifetime patron acquisitions</p>
        </div>
      </div>

      {/* 3. Search and Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/5 rounded-full border border-luxury-border max-w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            All Patrons ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "registered"
                ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            Registered Users ({customers.filter((c) => c.source === "registered" && c.role !== "admin").length})
          </button>
          <button
            onClick={() => setActiveTab("buyers")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "buyers"
                ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            Buyers With Orders ({customers.filter((c) => c.orders_count > 0).length})
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-white text-luxury-charcoal shadow-xs font-semibold"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            Staff &amp; Admins ({customers.filter((c) => c.role === "admin").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80 bg-white rounded-xl shadow-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-charcoal text-xs"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* 4. Patrons Table */}
      <div className="rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-luxury-border bg-luxury-soft/50 text-[10px] uppercase font-semibold text-luxury-muted tracking-wider">
                <th className="py-3 px-4">Patron / Identity</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Acquisitions</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Registered On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-luxury-muted">
                    <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading real patrons from database...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-luxury-muted">
                    <User className="w-8 h-8 text-luxury-muted/50 mx-auto mb-2" />
                    <p className="font-semibold text-luxury-charcoal">No patrons found</p>
                    <p className="text-[11px] text-luxury-muted">
                      {search ? `No accounts match "${search}"` : "No customers registered yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const initials = client.name
                    ? client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : client.email.slice(0, 2).toUpperCase();

                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedCustomer(client)}
                      className="hover:bg-luxury-soft/40 transition-colors cursor-pointer group"
                    >
                      {/* Patron Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-luxury-soft border border-luxury-border flex items-center justify-center font-serif font-bold text-xs text-luxury-gold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-luxury-charcoal flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {client.email_confirmed && (
                                <span title="Email Verified">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-luxury-muted truncate max-w-[160px]">
                              {client.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-luxury-muted">
                        <div className="text-luxury-charcoal font-medium">{client.email}</div>
                        <div className="text-[11px] font-mono text-luxury-muted">
                          {client.phone && client.phone !== "—" ? client.phone : "No phone provided"}
                        </div>
                      </td>

                      {/* Account Type / Role */}
                      <td className="py-3.5 px-4">
                        {client.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <ShieldCheck className="w-3 h-3 text-rose-600" />
                            <span>Atelier Admin</span>
                          </span>
                        ) : client.source === "registered" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <span>Guest Buyer</span>
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-luxury-charcoal">
                        {client.city}
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            client.tier === "VIP Atelier"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : client.tier === "Connoisseur"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-luxury-gold" />
                          <span>{client.tier}</span>
                        </span>
                      </td>

                      {/* Acquisitions */}
                      <td className="py-3.5 px-4 font-mono">
                        {client.orders_count > 0 ? (
                          <Link
                            href={`/admin/orders?search=${encodeURIComponent(client.email)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-luxury-charcoal font-bold hover:text-luxury-gold underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>{client.orders_count} order{client.orders_count > 1 ? "s" : ""}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-luxury-muted">0 orders</span>
                        )}
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 font-mono font-bold text-luxury-charcoal">
                        ₹{client.total_spend.toLocaleString("en-IN")}
                      </td>

                      {/* Member Since */}
                      <td className="py-3.5 px-4 text-luxury-muted text-[11px]">
                        {client.joined}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(client);
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold text-luxury-gold hover:text-luxury-charcoal hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Slide-Over Modal for Patron */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-luxury-border overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-luxury-border flex items-center justify-between bg-luxury-soft/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-luxury-soft border border-luxury-gold/30 flex items-center justify-center font-serif font-bold text-sm text-luxury-gold">
                  {selectedCustomer.name
                    ? selectedCustomer.name.slice(0, 2).toUpperCase()
                    : selectedCustomer.email.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-luxury-charcoal flex items-center gap-1.5">
                    <span>{selectedCustomer.name}</span>
                    {selectedCustomer.email_confirmed && (
                      <span title="Verified Account">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                      </span>
                    )}
                  </h3>
                  <p className="font-mono text-xs text-luxury-muted">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full text-luxury-muted hover:text-luxury-charcoal hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-luxury-soft/50 border border-luxury-border">
                  <span className="text-[10px] uppercase font-semibold text-luxury-muted tracking-wider block mb-1">
                    Patron Tier
                  </span>
                  <div className="flex items-center gap-1.5 font-serif font-bold text-luxury-charcoal text-base">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>{selectedCustomer.tier}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-luxury-soft/50 border border-luxury-border">
                  <span className="text-[10px] uppercase font-semibold text-luxury-muted tracking-wider block mb-1">
                    Lifetime Spend
                  </span>
                  <div className="font-serif font-bold text-luxury-charcoal text-base">
                    ₹{selectedCustomer.total_spend.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-xs divide-y divide-luxury-border">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-luxury-muted flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>User ID:</span>
                  </span>
                  <span className="font-mono text-[11px] text-luxury-charcoal">{selectedCustomer.id}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-luxury-muted flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Phone:</span>
                  </span>
                  <span className="font-mono text-luxury-charcoal">
                    {selectedCustomer.phone && selectedCustomer.phone !== "—" ? (
                      <a href={`tel:${selectedCustomer.phone}`} className="hover:underline text-luxury-gold">
                        {selectedCustomer.phone}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-luxury-muted flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Primary Location:</span>
                  </span>
                  <span className="font-medium text-luxury-charcoal">{selectedCustomer.city}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-luxury-muted flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Account Created:</span>
                  </span>
                  <span className="text-luxury-charcoal">{selectedCustomer.joined}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-luxury-muted flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Total Orders:</span>
                  </span>
                  <span className="font-bold text-luxury-charcoal">{selectedCustomer.orders_count}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`mailto:${selectedCustomer.email}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-luxury-border text-xs font-semibold text-luxury-charcoal hover:bg-luxury-soft transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Send Concierge Email</span>
                </a>

                {selectedCustomer.orders_count > 0 && (
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(selectedCustomer.email)}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-luxury-charcoal text-white text-xs font-semibold hover:bg-luxury-dark transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>View Customer Orders ({selectedCustomer.orders_count})</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
