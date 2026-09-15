"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit3, Trash2, ExternalLink, Filter } from "lucide-react";
import { adminGetAllProducts, adminDeleteProduct } from "@/lib/services/products";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const data = await adminGetAllProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you certain you wish to archive "${name}" from the atelier catalog?`)) {
      await adminDeleteProduct(id);
      loadProducts();
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-luxury-gold block">
            Atelier Inventory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal tracking-tight">
            Handbag Creations ({products.length})
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxury-charcoal hover:bg-luxury-gold text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Creation</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-luxury-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by handbag name, SKU, or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-luxury-soft/80 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-luxury-muted shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-luxury-soft/80 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold cursor-pointer"
          >
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-luxury-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-luxury-muted text-xs">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="font-serif text-base text-luxury-charcoal">No creations found.</p>
            <p className="text-xs text-luxury-muted">Try adjusting your search criteria or add a new piece.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-luxury-border/80 text-luxury-muted uppercase tracking-wider font-semibold bg-luxury-soft/40">
                  <th className="py-3 px-4">Creation</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/60">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-luxury-soft/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-luxury-soft shrink-0 border border-luxury-border">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-sm text-luxury-charcoal">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-luxury-muted flex items-center gap-2">
                            <span>SKU: {product.sku || "N/A"}</span>
                            <span>•</span>
                            <span>/product/{product.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-luxury-charcoal font-medium">
                      {product.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-luxury-charcoal">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-luxury-muted line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          product.inStock
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            product.inStock ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                        {product.inStock ? "In Stock" : "Sold Out"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-luxury-soft border border-luxury-border text-luxury-charcoal">
                        Published
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="w-8 h-8 rounded-lg hover:bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal flex items-center justify-center transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/admin/products/${product.id}`}
                          title="Edit Creation"
                          className="w-8 h-8 rounded-lg hover:bg-luxury-soft text-luxury-muted hover:text-luxury-gold flex items-center justify-center transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Archive Piece"
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-luxury-muted hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
