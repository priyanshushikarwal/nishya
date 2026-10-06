import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { categories as fallbackCategories } from "@/data/categories";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json(
          { success: true, count: data.length, categories: data },
          {
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err: any) {
      console.error("[API /api/categories] Error:", err);
    }
  }

  const cleanFallback = fallbackCategories.filter((c) => c.slug !== "all");
  return NextResponse.json(
    { success: true, count: cleanFallback.length, categories: cleanFallback, source: "fallback" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
