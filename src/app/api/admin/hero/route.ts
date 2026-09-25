import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Helper to ensure a string is a valid UUID
function toValidUUID(input: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(input)) {
    return input;
  }
  // Generate a deterministic UUID v5/v4 from the input string
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// GET /api/admin/hero — Fetch all hero campaigns from Supabase
export async function GET() {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const { data, error } = await admin
      .from("hero_campaigns")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/hero — Save or update hero campaign in Supabase (bypassing RLS with Service Role)
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

    const rawId = String(body.id || `hero-${Date.now()}`);
    const validId = toValidUUID(rawId);

    const campaignRow = {
      id: validId,
      title: String(body.title || "Nishya Hero Collection"),
      subtitle: body.subtitle ? String(body.subtitle) : null,
      description: body.description ? String(body.description) : null,
      cta_text: String(body.cta_text || "SHOP NOW"),
      cta_url: String(body.cta_url || "/products"),
      desktop_image: String(body.desktop_image || "/images/nishya/carry_your_story_pink_arch.jpg"),
      mobile_image: body.mobile_image ? String(body.mobile_image) : String(body.desktop_image || ""),
      sort_order: Number(body.sort_order) || 1,
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("hero_campaigns")
      .upsert(campaignRow, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Hero campaign save error in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/hero — Reorder & batch sync all hero campaigns
export async function PUT(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const campaigns = Array.isArray(body?.campaigns) ? body.campaigns : [];

    for (let i = 0; i < campaigns.length; i++) {
      const c = campaigns[i];
      const validId = toValidUUID(String(c.id));
      await admin
        .from("hero_campaigns")
        .upsert({
          id: validId,
          title: String(c.title || "Nishya Hero Collection"),
          subtitle: c.subtitle ? String(c.subtitle) : null,
          description: c.description ? String(c.description) : null,
          cta_text: String(c.cta_text || "SHOP NOW"),
          cta_url: String(c.cta_url || "/products"),
          desktop_image: String(c.desktop_image || "/images/nishya/carry_your_story_pink_arch.jpg"),
          mobile_image: c.mobile_image ? String(c.mobile_image) : String(c.desktop_image || ""),
          sort_order: i + 1,
          is_active: c.is_active !== false,
        }, { onConflict: "id" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/hero — Delete hero campaign by id
export async function DELETE(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Campaign id is required" }, { status: 400 });
    }

    const validId = toValidUUID(id);
    const { error } = await admin
      .from("hero_campaigns")
      .delete()
      .eq("id", validId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
