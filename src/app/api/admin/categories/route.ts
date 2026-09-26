import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function toValidUUID(input: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(input)) {
    return input;
  }
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// GET /api/admin/categories — Fetch all categories with service role
export async function GET() {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const { data, error } = await admin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/categories — Create or update categories
export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Support batch array or single category
    const items = Array.isArray(body?.categories) ? body.categories : [body];

    for (const cat of items) {
      if (!cat.name) continue;
      const validId = toValidUUID(String(cat.id || `cat-${Date.now()}-${Math.random()}`));
      const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const { error } = await admin
        .from("categories")
        .upsert({
          id: validId,
          name: String(cat.name).trim(),
          slug: String(slug).trim(),
          description: cat.description ? String(cat.description) : null,
          image: cat.image ? String(cat.image) : null,
          sort_order: Number(cat.sort_order) || 1,
          is_visible: cat.is_visible !== false,
        }, { onConflict: "id" });

      if (error) {
        console.error("Error upserting category:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

// DELETE /api/admin/categories?id=... — Delete a category
export async function DELETE(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const validId = toValidUUID(id);
    const { error } = await admin
      .from("categories")
      .delete()
      .or(`id.eq.${validId},id.eq.${id}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
