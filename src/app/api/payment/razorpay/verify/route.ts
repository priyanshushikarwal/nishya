import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://127.0.0.1:8080";
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

      const goRes = await fetch(`${GO_BACKEND_URL}/api/payment/razorpay/verify`, {
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

    // 2. Cryptographic signature check
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (RAZORPAY_KEY_SECRET && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          { error: "Payment signature verification failed", verified: false },
          { status: 400 }
        );
      }
    }

    // 3. Mark order as paid in database
    const admin = createAdminClient();
    if (admin) {
      await admin
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",
        })
        .eq("id", orderId);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderId,
      paymentId: razorpayPaymentId,
      status: "paid",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
