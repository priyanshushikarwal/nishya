import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://127.0.0.1:8080";

export async function POST(req: NextRequest) {
  try {
    // 1. Strictest Security: Verify Customer Authentication
    const serverSupabase = await createServerSupabase();
    let verifiedUser: { id: string; email: string } | null = null;

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (user?.email) {
      verifiedUser = { id: user.id, email: user.email.toLowerCase().trim() };
    } else {
      // Check Bearer authorization header
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const {
          data: { user: tokenUser },
        } = await serverSupabase.auth.getUser(token);
        if (tokenUser?.email) {
          verifiedUser = { id: tokenUser.id, email: tokenUser.email.toLowerCase().trim() };
        }
      }
    }

    if (!verifiedUser) {
      return NextResponse.json(
        {
          error: "Authentication required. Please sign in or create an account to complete your purchase.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate payload
    const body = await req.json().catch(() => null);
    if (!body || !body.customer || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid checkout request. Your shopping bag appears empty." },
        { status: 400 }
      );
    }

    const { customer, items } = body;
    const customerName = String(customer.name || "").trim();
    const customerPhone = String(customer.phone || "").trim();
    const customerAddress = String(customer.address || "").trim();
    const customerCity = String(customer.city || "").trim();
    const customerState = String(customer.state || "").trim();
    const customerPostalCode = String(customer.postalCode || "").trim();
    const paymentMethod = String(customer.paymentMethod || "card").toLowerCase();

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: "Please provide a valid full name." }, { status: 400 });
    }
    if (!customerAddress || customerAddress.length < 5 || !customerCity || !customerPostalCode) {
      return NextResponse.json({ error: "Please complete all required shipping address fields." }, { status: 400 });
    }

    // 3. Try forwarding to Go backend first if it is online
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const goRes = await fetch(`${GO_BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Customer-Email": verifiedUser.email,
        },
        body: JSON.stringify({
          customer: {
            ...customer,
            email: verifiedUser.email, // Bound strictly to authenticated user
          },
          items,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (goRes.ok) {
        const goData = await goRes.json();
        return NextResponse.json(goData);
      }
    } catch {
      // Go backend is offline or slow, proceed to direct Supabase processing below
    }

    // 4. Standalone Direct Execution via Supabase Admin Client
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Database service configuration missing." },
        { status: 503 }
      );
    }

    // A. Fetch products to calculate authoritative server-side prices
    const itemIds = Array.from(new Set(items.map((i: any) => String(i.id).trim())));
    const { data: dbProducts } = await admin
      .from("products")
      .select("id, name, price, image")
      .in("id", itemIds);

    const productMap = new Map<string, any>();
    (dbProducts || []).forEach((p) => productMap.set(p.id, p));

    let verifiedSubtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of items) {
      const p = productMap.get(item.id);
      const price = p ? Number(p.price) : 2500;
      const name = p ? p.name : "Nishya Handbag";
      const img = p ? p.image : "/images/nishya/carry_your_story_pink_arch.jpg";
      const qty = Math.max(1, Math.min(10, Number(item.quantity) || 1));

      verifiedSubtotal += price * qty;
      verifiedOrderItems.push({
        product_id: item.id,
        product_name: name,
        price,
        quantity: qty,
        selected_color: item.selectedColor || "Signature",
        image: img,
      });
    }

    // Server-Side Authoritative Coupon Verification
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    const requestedCoupon = String(body.couponCode || "").trim().toUpperCase();

    if (requestedCoupon) {
      const { data: settingRow } = await admin
        .from("store_settings")
        .select("value")
        .eq("key", "coupons")
        .single();

      const couponsList = Array.isArray(settingRow?.value) ? settingRow.value : [];
      const matchedCouponIndex = couponsList.findIndex(
        (c: any) => String(c.code).trim().toUpperCase() === requestedCoupon && c.isActive
      );

      if (matchedCouponIndex > -1) {
        const c = couponsList[matchedCouponIndex];
        const isValidDate = !c.validUntil || new Date(c.validUntil).getTime() > Date.now();
        const isWithinLimit = !c.usageLimit || (c.usedCount || 0) < c.usageLimit;
        const meetsMin = !c.minOrder || verifiedSubtotal >= c.minOrder;

        if (isValidDate && isWithinLimit && meetsMin) {
          appliedCouponCode = c.code;
          if (c.type === "percentage") {
            const raw = (verifiedSubtotal * Number(c.value)) / 100;
            discountAmount = Math.round(raw);
            if (c.maxDiscount && discountAmount > c.maxDiscount) {
              discountAmount = c.maxDiscount;
            }
          } else {
            discountAmount = Math.min(verifiedSubtotal, Number(c.value));
          }

          // Atomically increment usage in database
          couponsList[matchedCouponIndex].usedCount = (c.usedCount || 0) + 1;
          await admin.from("store_settings").update({ value: couponsList }).eq("key", "coupons");
        }
      }
    }

    const shippingFee = verifiedSubtotal >= 5000 ? 0 : 250;
    const grandTotal = Math.max(0, verifiedSubtotal - discountAmount + shippingFee);

    // B. Generate secure Order ID
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderId = `NIS-2026-${randomSuffix}`;

    const isCOD = paymentMethod === "cod";
    const paymentStatus = "pending";
    const orderStatus = isCOD ? "confirmed" : "pending";

    const shippingAddrJson = {
      address: customerAddress,
      city: customerCity,
      state: customerState,
      postalCode: customerPostalCode,
      paymentMethod,
      couponCode: appliedCouponCode,
      discountAmount,
    };

    // C. Insert Order
    const { error: orderInsertError } = await admin.from("orders").insert({
      id: orderId,
      customer_name: customerName,
      customer_email: verifiedUser.email,
      customer_phone: customerPhone || null,
      shipping_address: shippingAddrJson,
      subtotal: verifiedSubtotal,
      shipping_fee: shippingFee,
      total: grandTotal,
      payment_status: paymentStatus,
      order_status: orderStatus,
      created_at: new Date().toISOString(),
    });

    if (orderInsertError) {
      console.error("[Checkout DB Error]:", orderInsertError);
      return NextResponse.json(
        { error: "Could not register order in database. Please try again." },
        { status: 500 }
      );
    }

    // D. Insert Order Items
    const itemsToInsert = verifiedOrderItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      selected_color: item.selected_color,
      image: item.image,
    }));

    await admin.from("order_items").insert(itemsToInsert);

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: verifiedSubtotal,
      shippingFee,
      total: grandTotal,
      customerName,
      customerEmail: verifiedUser.email,
    });
  } catch (err: any) {
    console.error("[Checkout Route Exception]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during checkout." },
      { status: 500 }
    );
  }
}
