import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { products as fallbackProducts } from "@/data/products";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapDbToProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || undefined,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
    secondaryImage: row.secondary_image || undefined,
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image],
    category: row.category,
    badge: row.badge || undefined,
    description: row.description || "",
    story: row.story || undefined,
    details: Array.isArray(row.details) ? row.details : [],
    care: Array.isArray(row.care) ? row.care : [],
    material: row.material || undefined,
    dimensions: row.dimensions || undefined,
    weight: row.weight || undefined,
    closure: row.closure || undefined,
    interior: row.interior || undefined,
    strap: row.strap || undefined,
    lining: row.lining || undefined,
    sku: row.sku || undefined,
    origin: row.origin || undefined,
    color: row.color || undefined,
    colors: Array.isArray(row.colors) ? row.colors : [],
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count || 0),
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
  };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (slug) {
        query = query.eq("slug", slug);
      }
      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      if (featured === "true") {
        query = query.eq("featured", true);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbToProduct);
        return NextResponse.json(
          { success: true, count: mapped.length, products: mapped },
          {
            headers: {
              "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err: any) {
      console.error("[API /api/products] Supabase query error:", err);
    }
  }

  // Graceful fallback
  let list = fallbackProducts;
  if (slug) {
    list = list.filter((p) => p.slug === slug);
  }
  if (category && category !== "All") {
    list = list.filter((p) => p.category === category);
  }
  if (featured === "true") {
    list = list.filter((p) => p.featured);
  }

  return NextResponse.json(
    { success: true, count: list.length, products: list, source: "fallback" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
