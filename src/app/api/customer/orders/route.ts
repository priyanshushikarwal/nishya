import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Identify user via session cookies or authorization header
    const serverSupabase = await createServerSupabase();
    let userEmail: string | null = null;

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (user?.email) {
      userEmail = user.email.toLowerCase().trim();
    } else {
      // Check Bearer token in Authorization header
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const {
          data: { user: tokenUser },
        } = await serverSupabase.auth.getUser(token);
        if (tokenUser?.email) {
          userEmail = tokenUser.email.toLowerCase().trim();
        }
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required to view your orders." },
        { status: 401 }
      );
    }

    // 2. Fetch orders using admin client to ensure all relations are fetched reliably
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data: orders, error } = await adminClient
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Customer Orders API Error]:", error);
      return NextResponse.json(
        { error: "Could not retrieve customer orders." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (err: any) {
    console.error("[Customer Orders API Exception]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
