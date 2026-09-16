import { NextResponse } from "next/server";
import { products as initialProducts } from "@/data/products";
import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// In-memory cache for fast local persistence across requests
let dynamicProductsCache: Product[] = [...initialProducts];

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json(dynamicProductsCache);
}

export async function POST(req: Request) {
  try {
    const product: Product = await req.json();
    if (!product || !product.id) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // 1. If Supabase configured, upsert to DB
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase.from("products").upsert({
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline || null,
          price: product.price,
          original_price: product.originalPrice || null,
          image: product.image,
          secondary_image: product.secondaryImage || null,
          gallery: product.gallery || [product.image],
          category: product.category,
          badge: product.badge || null,
          description: product.description,
          story: product.story || null,
          details: product.details || [],
          care: product.care || [],
          material: product.material || null,
          dimensions: product.dimensions || null,
          weight: product.weight || null,
          closure: product.closure || null,
          interior: product.interior || null,
          strap: product.strap || null,
          lining: product.lining || null,
          sku: product.sku || null,
          origin: product.origin || null,
          color: product.color || null,
          colors: product.colors || [],
          rating: product.rating || 5.0,
          review_count: product.reviewCount || 0,
          in_stock: product.inStock,
          featured: product.featured || false,
          status: "published",
          updated_at: new Date().toISOString(),
        });
      } catch {}
    }

    // 2. Update in-memory server cache
    const existingIndex = dynamicProductsCache.findIndex(
      (p) => p.id === product.id || p.slug === product.slug
    );

    if (existingIndex >= 0) {
      dynamicProductsCache[existingIndex] = product;
    } else {
      dynamicProductsCache = [product, ...dynamicProductsCache];
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase.from("products").delete().eq("id", id);
      } catch {}
    }

    dynamicProductsCache = dynamicProductsCache.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
