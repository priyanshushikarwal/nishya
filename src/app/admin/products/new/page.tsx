"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductEditorForm } from "@/components/admin/ProductEditorForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg text-luxury-muted hover:text-luxury-charcoal hover:bg-black/5 transition-colors"
          title="Back to Product Catalog"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Create Luxury Creation
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Add a handcrafted handbag piece to the Nishya collection catalogue.
          </p>
        </div>
      </div>

      <ProductEditorForm />
    </div>
  );
}
