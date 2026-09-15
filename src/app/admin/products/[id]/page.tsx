"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Product } from "@/types/product";
import { adminGetAllProducts } from "@/lib/services/products";
import { ProductEditorForm } from "@/components/admin/ProductEditorForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        const allProducts = await adminGetAllProducts();
        const found = allProducts.find(
          (p) => p.id === productId || p.slug === productId
        );
        if (found) {
          setProduct(found);
        } else {
          setError(`No luxury product found matching identifier "${productId}".`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product for editing.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mb-4" />
        <p className="font-serif text-base text-luxury-charcoal">Loading Product Master File...</p>
        <p className="font-sans text-xs text-luxury-muted mt-1">Retrieving atelier specifications and gallery assets</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-luxury-charcoal">Piece Not Found</h2>
        <p className="font-sans text-xs text-luxury-muted leading-relaxed">
          {error || "The requested handbag does not exist in the collection or was removed."}
        </p>
        <div className="pt-2">
          <button
            onClick={() => router.push("/admin/products")}
            className="px-5 py-2.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-wider font-semibold hover:bg-luxury-dark transition-colors"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

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
            Edit: {product.name}
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            SKU: <span className="font-mono text-luxury-charcoal font-semibold">{product.sku}</span> &bull; Slug: <span className="font-mono text-luxury-charcoal">{product.slug}</span>
          </p>
        </div>
      </div>

      <ProductEditorForm initialProduct={product} />
    </div>
  );
}
