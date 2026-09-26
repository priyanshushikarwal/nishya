import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/sections — Fetch all homepage sections
export async function GET() {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const { data, error } = await admin
      .from("homepage_sections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sections: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST or PUT /api/admin/sections — Save / update homepage sections with service role
export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const sections = Array.isArray(body?.sections) ? body.sections : [];

    if (sections.length === 0) {
      return NextResponse.json({ error: "No sections provided" }, { status: 400 });
    }

    for (const sec of sections) {
      await admin
        .from("homepage_sections")
        .upsert({
          id: sec.id,
          title: sec.title,
          subtitle: sec.subtitle || null,
          content: sec.content || {},
          sort_order: Number(sec.sort_order) || 1,
          is_visible: Boolean(sec.is_visible),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
