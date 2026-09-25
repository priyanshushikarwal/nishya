import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://127.0.0.1:8080";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Try Go backend if online
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const goRes = await fetch(`${GO_BACKEND_URL}/api/payment/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (goRes.ok) {
        const goData = await goRes.json();
        return NextResponse.json(goData);
      }
    } catch {
      // Go backend offline, proceed below
    }

    // 2. Fetch authoritative amount from Supabase database
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { data: order, error } = await admin
      .from("orders")
      .select("id, total")
      .eq("id", body.orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Referenced order not found" }, { status: 404 });
    }

    const amountInPaise = Math.round(Number(order.total) * 100);

    // If Razorpay keys are not configured, return test mock order
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        orderId: order.id,
        is_mock: true,
        key_id: "rzp_test_mock",
      });
    }

    // 3. Call Razorpay API
    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.id,
        notes: { nishya_order_id: order.id },
      }),
    });

    if (!rzpRes.ok) {
      const errData = await rzpRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error?.description || "Razorpay order creation failed" },
        { status: 500 }
      );
    }

    const rzpOrder = await rzpRes.json();
    return NextResponse.json({
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderId: order.id,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
