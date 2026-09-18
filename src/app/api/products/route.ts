import { NextResponse } from "next/server";
import { products as initialProducts } from "@/data/products";
import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/security/auth-check";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// In-memory cache for fast local persistence across requests
let dynamicProductsCache: Product[] = [...initialProducts];

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`products-get:${ip}`, 60, 60000); // 60 req/min
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json(dynamicProductsCache);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`products-post:${ip}`, 20, 60000); // 20 admin edits/min
  if (!rate.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded for catalog modifications." },
      { status: 429 }
    );
  }

  // 1. Enforce strict Admin Authorization
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    // 2. Strict Input Validation & Schema Enforcement
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const {
      id,
      name,
      slug,
      price,
      originalPrice,
      image,
      category,
      description,
    } = body;

    if (!id || typeof id !== "string" || id.length > 100) {
      return NextResponse.json({ error: "Invalid or missing product ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 250) {
      return NextResponse.json({ error: "Invalid product name" }, { status: 400 });
    }

    if (!slug || typeof slug !== "string" || !/^[a-z0-9-_]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid product slug (must be lowercase letters, numbers, and hyphens)" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 10000000) {
      return NextResponse.json(
        { error: "Price must be a valid non-negative number" },
        { status: 400 }
      );
    }

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Product primary image is required" }, { status: 400 });
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Product category is required" }, { status: 400 });
    }

    // 3. Upsert to Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { error: dbError } = await (supabase.from("products") as any).upsert({
          id: id.trim(),
          name: name.trim(),
          slug: slug.trim(),
          tagline: typeof body.tagline === "string" ? body.tagline.slice(0, 300) : null,
          price: parsedPrice,
          original_price: originalPrice ? Number(originalPrice) : null,
          image: image.trim(),
          secondary_image: typeof body.secondaryImage === "string" ? body.secondaryImage : null,
          gallery: Array.isArray(body.gallery) ? body.gallery : [image],
          category: category.trim(),
          badge: typeof body.badge === "string" ? body.badge.slice(0, 50) : null,
          description: typeof description === "string" ? description : "",
          story: typeof body.story === "string" ? body.story : null,
          details: Array.isArray(body.details) ? body.details : [],
          care: Array.isArray(body.care) ? body.care : [],
          material: typeof body.material === "string" ? body.material : null,
          dimensions: typeof body.dimensions === "string" ? body.dimensions : null,
          weight: typeof body.weight === "string" ? body.weight : null,
          closure: typeof body.closure === "string" ? body.closure : null,
          interior: typeof body.interior === "string" ? body.interior : null,
          strap: typeof body.strap === "string" ? body.strap : null,
          lining: typeof body.lining === "string" ? body.lining : null,
          sku: typeof body.sku === "string" ? body.sku : null,
          origin: typeof body.origin === "string" ? body.origin : null,
          color: typeof body.color === "string" ? body.color : null,
          colors: Array.isArray(body.colors) ? body.colors : [],
          rating: typeof body.rating === "number" ? Math.min(5, Math.max(1, body.rating)) : 5.0,
          review_count: typeof body.reviewCount === "number" ? Math.max(0, body.reviewCount) : 0,
          in_stock: Boolean(body.inStock ?? true),
          featured: Boolean(body.featured || false),
          status: "published",
          updated_at: new Date().toISOString(),
        });

        if (dbError) {
          return NextResponse.json({ error: dbError.message }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: "Failed to persist product to database" }, { status: 500 });
      }
    }

    // 4. Update in-memory server cache
    const existingIndex = dynamicProductsCache.findIndex(
      (p) => p.id === body.id || p.slug === body.slug
    );

    if (existingIndex >= 0) {
      dynamicProductsCache[existingIndex] = body;
    } else {
      dynamicProductsCache = [body, ...dynamicProductsCache];
    }

    return NextResponse.json({ success: true, product: body });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON or server error" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`products-delete:${ip}`, 10, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 1. Enforce strict Admin Authorization
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid product id" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: "Database deletion failed" }, { status: 500 });
      }
    }

    dynamicProductsCache = dynamicProductsCache.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
