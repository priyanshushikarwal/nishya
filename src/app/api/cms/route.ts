import { NextResponse } from "next/server";
import { HeroCampaign, HomepageSection } from "@/lib/services/cms";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/security/auth-check";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// In-memory cache for server-side persistence
let cachedSections: HomepageSection[] | null = null;
let cachedCampaigns: HeroCampaign[] | null = null;

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`cms-get:${ip}`, 60, 60000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

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
  const ip = getClientIp(req);
  const rate = checkRateLimit(`cms-post:${ip}`, 20, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 1. Strict Admin Authorization Check
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format (array required)" }, { status: 400 });
    }

    if (type === "sections") {
      cachedSections = data;
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          for (const sec of data) {
            if (!sec.id || !sec.title) continue;
            await (supabase.from("homepage_sections") as any).upsert({
              id: String(sec.id).trim(),
              title: String(sec.title).slice(0, 200),
              subtitle: sec.subtitle ? String(sec.subtitle).slice(0, 300) : null,
              content: typeof sec.content === "object" ? sec.content : {},
              sort_order: Number(sec.sort_order || 0),
              is_visible: Boolean(sec.is_visible),
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
            if (!c.title || !c.desktop_image) continue;
            await (supabase.from("hero_campaigns") as any).upsert({
              id: c.id,
              title: String(c.title).slice(0, 200),
              subtitle: c.subtitle ? String(c.subtitle).slice(0, 300) : null,
              description: c.description ? String(c.description).slice(0, 500) : null,
              cta_text: c.cta_text ? String(c.cta_text).slice(0, 50) : "SHOP NOW",
              cta_url: c.cta_url ? String(c.cta_url).slice(0, 255) : "/products",
              desktop_image: String(c.desktop_image),
              mobile_image: c.mobile_image ? String(c.mobile_image) : null,
              sort_order: Number(c.sort_order || 0),
              is_active: Boolean(c.is_active ?? true),
            });
          }
        } catch {}
      }
      return NextResponse.json({ success: true, count: data.length });
    }

    return NextResponse.json({ error: "Invalid type specified" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
