"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  total_spend: number;
  orders_count: number;
  tier: "VIP Atelier" | "Connoisseur" | "Client";
  joined: string;
}

const customerDirectory: CustomerRecord[] = [
  {
    id: "CUST-001",
    name: "Arya Singhania",
    email: "arya.s@vogue.in",
    phone: "+91 98200 12345",
    city: "Mumbai, MH",
    total_spend: 3499,
    orders_count: 1,
    tier: "VIP Atelier",
    joined: "January 2026",
  },
  {
    id: "CUST-002",
    name: "Devika Oberoi",
    email: "devika@oberoi.luxury",
    phone: "+91 98111 54321",
    city: "New Delhi, DL",
    total_spend: 6498,
    orders_count: 2,
    tier: "VIP Atelier",
    joined: "February 2026",
  },
  {
    id: "CUST-003",
    name: "Karan Johar",
    email: "karan@dharma.in",
    phone: "+91 99300 98765",
    city: "Bandra, Mumbai",
    total_spend: 2999,
    orders_count: 1,
    tier: "Connoisseur",
    joined: "March 2026",
  },
  {
    id: "CUST-004",
    name: "Ananya Piramal",
    email: "ananya@piramal.com",
    phone: "+91 98201 55667",
    city: "Worli, Mumbai",
    total_spend: 8990,
    orders_count: 3,
    tier: "VIP Atelier",
    joined: "December 2025",
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customerDirectory.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Patrons
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Client Relations</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Clients &amp; Patrons
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Directory of registered patrons, private client VIP tiers, and lifetime acquisition value.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-luxury-soft border border-luxury-border text-xs text-luxury-muted">
          Active Patrons: <strong className="text-luxury-charcoal font-semibold">{customerDirectory.length}</strong>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80 bg-white rounded-xl shadow-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patrons by name, email or city..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-luxury-border bg-luxury-soft/50 text-[10px] uppercase font-semibold text-luxury-muted tracking-wider">
              <th className="py-3 px-4">Patron</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Acquisitions</th>
              <th className="py-3 px-4">Lifetime Value</th>
              <th className="py-3 px-4">Member Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-border text-xs">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-luxury-soft/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-serif font-bold text-luxury-charcoal">
                    {client.name}
                  </div>
                  <div className="font-mono text-[10px] text-luxury-muted">
                    {client.id}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-luxury-muted">
                  <div>{client.email}</div>
                  <div className="text-[10px]">{client.phone}</div>
                </td>
                <td className="py-3.5 px-4 text-luxury-charcoal">
                  {client.city}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      client.tier === "VIP Atelier"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-purple-50 text-purple-800 border-purple-200"
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{client.tier}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {client.orders_count} order{client.orders_count > 1 ? "s" : ""}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-luxury-charcoal">
                  ₹{client.total_spend.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-luxury-muted">
                  {client.joined}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
