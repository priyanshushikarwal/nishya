import { NextResponse } from "next/server";
import { HeroCampaign, HomepageSection } from "@/lib/services/cms";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// In-memory cache for server-side persistence
let cachedSections: HomepageSection[] | null = null;
let cachedCampaigns: HeroCampaign[] | null = null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "sections" | "campaigns"

  if (type === "campaigns") {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("hero_campaigns")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) return NextResponse.json(data);
      } catch {}
    }
    return NextResponse.json(cachedCampaigns || []);
  }

  // Default: sections
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) return NextResponse.json(data);
    } catch {}
  }
  return NextResponse.json(cachedSections || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "sections") {
      cachedSections = data;
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          for (const sec of data) {
            await (supabase.from("homepage_sections") as any).upsert({
              id: sec.id,
              title: sec.title,
              subtitle: sec.subtitle,
              content: sec.content,
              sort_order: sec.sort_order,
              is_visible: sec.is_visible,
            });
          }
        } catch {}
      }
      return NextResponse.json({ success: true, count: data.length });
    }

    if (type === "campaigns") {
      cachedCampaigns = data;
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          for (const c of data) {
            await supabase.from("hero_campaigns").upsert(c);
          }
        } catch {}
      }
      return NextResponse.json({ success: true, count: data.length });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
