import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 minute window
    return false;
  }

  entry.count += 1;
  if (entry.count > 6) {
    return true; // Exceeded 6 attempts per minute
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // 1. Anti-Brute-Force Protection
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "Too many coupon validation attempts. For security reasons, please wait a minute.",
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.code) {
      return NextResponse.json({ error: "Please enter a promotional code." }, { status: 400 });
    }

    const code = String(body.code).trim().toUpperCase();
    if (code.length < 3 || code.length > 30) {
      return NextResponse.json({ error: "Invalid promotional code format." }, { status: 400 });
    }

    // 2. Fetch authoritative coupon list from secure database
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Promotions service temporarily unavailable." }, { status: 503 });
    }

    const { data: settingRow } = await admin
      .from("store_settings")
      .select("value")
      .eq("key", "coupons")
      .single();

    const couponsList = Array.isArray(settingRow?.value) ? settingRow.value : [];
    const matchedCoupon = couponsList.find(
      (c: any) => String(c.code).trim().toUpperCase() === code
    );

    // If coupon doesn't exist or is inactive, delay slightly to prevent timing attacks
    if (!matchedCoupon || !matchedCoupon.isActive) {
      await new Promise((r) => setTimeout(r, 250));
      return NextResponse.json(
        { valid: false, error: "The promotional code entered is invalid or has expired." },
        { status: 400 }
      );
    }

    // 3. Expiry Check
    if (matchedCoupon.validUntil && new Date(matchedCoupon.validUntil).getTime() < Date.now()) {
      return NextResponse.json(
        { valid: false, error: "This promotional code has expired." },
        { status: 400 }
      );
    }

    // 4. Global Usage Limit Check
    if (matchedCoupon.usageLimit && matchedCoupon.usedCount >= matchedCoupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: "This promotional capsule has reached its maximum redemption quota." },
        { status: 400 }
      );
    }

    // 5. Authoritative Subtotal Calculation from DB Products (Never trust client prices)
    const items = Array.isArray(body.items) ? body.items : [];
    let serverSubtotal = 0;

    if (items.length > 0) {
      const itemIds = Array.from(new Set(items.map((i: any) => String(i.id).trim())));
      const { data: dbProducts } = await admin
        .from("products")
        .select("id, price")
        .in("id", itemIds);

      const priceMap = new Map<string, number>();
      (dbProducts || []).forEach((p) => priceMap.set(p.id, Number(p.price)));

      for (const item of items) {
        const pPrice = priceMap.get(item.id) || 2500;
        const qty = Math.max(1, Math.min(10, Number(item.quantity) || 1));
        serverSubtotal += pPrice * qty;
      }
    } else if (typeof body.subtotal === "number" && body.subtotal > 0) {
      serverSubtotal = body.subtotal;
    }

    // 6. Minimum Spend Requirement
    if (matchedCoupon.minOrder && serverSubtotal < matchedCoupon.minOrder) {
      return NextResponse.json(
        {
          valid: false,
          error: `This promotional code requires a minimum acquisition subtotal of ₹${matchedCoupon.minOrder.toLocaleString("en-IN")}.`,
          minOrderRequired: matchedCoupon.minOrder,
        },
        { status: 400 }
      );
    }

    // 7. Calculate Authoritative Discount Amount
    let discountAmount = 0;
    if (matchedCoupon.type === "percentage") {
      const rawPct = (serverSubtotal * Number(matchedCoupon.value)) / 100;
      discountAmount = Math.round(rawPct);
      if (matchedCoupon.maxDiscount && discountAmount > matchedCoupon.maxDiscount) {
        discountAmount = matchedCoupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(serverSubtotal, Number(matchedCoupon.value));
    }

    return NextResponse.json({
      valid: true,
      code: matchedCoupon.code,
      discountType: matchedCoupon.type,
      discountValue: matchedCoupon.value,
      discountAmount,
      subtotal: serverSubtotal,
      description: matchedCoupon.description || `Privilege discount: ₹${discountAmount.toLocaleString("en-IN")}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error validating coupon." },
      { status: 500 }
    );
  }
}
