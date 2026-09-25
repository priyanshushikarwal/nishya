import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Product } from "@/types/product";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapProductToDb(p: Product): Record<string, any> {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline || null,
    price: Number(p.price) || 0,
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    image: p.image,
    secondary_image: p.secondaryImage || null,
    gallery: p.gallery || [p.image],
    category: p.category,
    badge: p.badge || null,
    description: p.description || "",
    story: p.story || null,
    details: p.details || [],
    care: p.care || [],
    material: p.material || null,
    dimensions: p.dimensions || null,
    weight: p.weight || null,
    closure: p.closure || null,
    interior: p.interior || null,
    strap: p.strap || null,
    lining: p.lining || null,
    sku: p.sku || null,
    origin: p.origin || null,
    color: p.color || null,
    colors: p.colors || [],
    rating: Number(p.rating) || 5.0,
    review_count: Number(p.reviewCount) || 0,
    in_stock: Boolean(p.inStock),
    featured: Boolean(p.featured),
    status: "published",
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = body.product || body;

    if (!product || !product.id || !product.name) {
      return NextResponse.json(
        { success: false, error: "Invalid product payload" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (supabase) {
      const dbRow = mapProductToDb(product);
      const { error } = await supabase.from("products").upsert(dbRow);
      if (error) {
        console.error("[Admin API Save Error]:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("[Admin API Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const supabase = getAdminClient();

    if (clearAll) {
      if (supabase) {
        const { error } = await supabase.from("products").delete().neq("id", "");
        if (error) {
          console.error("[Admin API Delete All Error]:", error);
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
          );
        }
      }
      return NextResponse.json({ success: true, clearedAll: true });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing product id" },
        { status: 400 }
      );
    }

    if (supabase) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("[Admin API Delete Error]:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("[Admin API Delete Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
