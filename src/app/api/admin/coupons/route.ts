import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface CouponItem {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  validUntil?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

// GET /api/admin/coupons — Retrieve all coupons
export async function GET() {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured." }, { status: 503 });
    }

    const { data: settingRow, error } = await admin
      .from("store_settings")
      .select("value")
      .eq("key", "coupons")
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const coupons: CouponItem[] = Array.isArray(settingRow?.value) ? settingRow.value : [];
    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/coupons — Add or update a coupon
export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const code = String(body.code).trim().toUpperCase();
    if (code.length < 3 || code.length > 25) {
      return NextResponse.json({ error: "Coupon code must be between 3 and 25 characters." }, { status: 400 });
    }

    const type = body.type === "fixed" ? "fixed" : "percentage";
    const value = Math.max(0, Number(body.value) || 0);
    const minOrder = body.minOrder ? Math.max(0, Number(body.minOrder)) : undefined;
    const maxDiscount = body.maxDiscount ? Math.max(0, Number(body.maxDiscount)) : undefined;
    const validUntil = body.validUntil ? new Date(body.validUntil).toISOString() : null;
    const usageLimit = body.usageLimit ? Math.max(1, Number(body.usageLimit)) : null;
    const isActive = body.isActive !== false;
    const description = String(body.description || "").trim() || `${value}${type === "percentage" ? "%" : "₹"} Privilege Offer`;

    // Fetch existing list
    const { data: settingRow } = await admin
      .from("store_settings")
      .select("value")
      .eq("key", "coupons")
      .single();

    let coupons: CouponItem[] = Array.isArray(settingRow?.value) ? settingRow.value : [];

    const existingIndex = coupons.findIndex((c) => c.code.toUpperCase() === code);

    if (existingIndex > -1) {
      // Update existing
      coupons[existingIndex] = {
        ...coupons[existingIndex],
        code,
        description,
        type,
        value,
        minOrder,
        maxDiscount,
        validUntil,
        usageLimit,
        isActive,
      };
    } else {
      // Append new
      coupons.push({
        code,
        description,
        type,
        value,
        minOrder,
        maxDiscount,
        validUntil,
        usageLimit,
        usedCount: 0,
        isActive,
        createdAt: new Date().toISOString(),
      });
    }

    // Save back to store_settings
    const { error: saveError } = await admin
      .from("store_settings")
      .upsert(
        {
          key: "coupons",
          value: coupons,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons — Delete coupon by code
export async function DELETE(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase service client unconfigured." }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const { data: settingRow } = await admin
      .from("store_settings")
      .select("value")
      .eq("key", "coupons")
      .single();

    let coupons: CouponItem[] = Array.isArray(settingRow?.value) ? settingRow.value : [];
    coupons = coupons.filter((c) => c.code.toUpperCase() !== code);

    const { error: saveError } = await admin
      .from("store_settings")
      .upsert(
        {
          key: "coupons",
          value: coupons,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
