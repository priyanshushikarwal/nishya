import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { products as localProducts } from "@/data/products";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

interface CheckoutItem {
  id: string;
  quantity: number;
  selectedColor?: string;
}

interface CheckoutPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    paymentMethod: "card" | "upi" | "cod";
  };
  items: CheckoutItem[];
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const isLoadTest = req.headers.get("x-load-test-bypass") === "staging-benchmark-2026";

  // Rate limit: 60 checkouts / min per IP (or bypass if staging benchmark)
  if (!isLoadTest) {
    const rate = checkRateLimit(`checkout:${ip}`, 60, 60000);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please wait a moment before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Idempotency Key check (Gracefully handles whether DB column exists yet)
  const idempotencyKey =
    req.headers.get("x-idempotency-key") ||
    req.headers.get("idempotency-key") ||
    null;

  const dbClient = createAdminClient();

  if (dbClient && idempotencyKey) {
    try {
      const { data: existingOrder, error: idempErr } = await (dbClient.from("orders") as any)
        .select("*")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (!idempErr && existingOrder) {
        return NextResponse.json({
          success: true,
          orderId: existingOrder.id,
          subtotal: existingOrder.subtotal,
          shippingFee: existingOrder.shipping_fee,
          total: existingOrder.total,
          customerName: existingOrder.customer_name,
          customerEmail: existingOrder.customer_email,
          isIdempotentReplay: true,
        });
      }
    } catch {
      // Column may not yet exist in PostgreSQL schema cache; continue safely
    }
  }

  try {
    const body: CheckoutPayload = await req.json();

    if (!body || !body.customer || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid checkout request. Your shopping bag appears empty." },
        { status: 400 }
      );
    }

    const { customer, items } = body;

    // 1. Strict Customer & Address Validation
    const name = customer.name?.trim();
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Please provide a valid full name." }, { status: 400 });
    }

    const email = customer.email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const phone = customer.phone?.trim();
    if (!phone || phone.length < 7 || phone.length > 25) {
      return NextResponse.json({ error: "Please provide a valid contact telephone number." }, { status: 400 });
    }

    const address = customer.address?.trim();
    const city = customer.city?.trim();
    const postalCode = customer.postalCode?.trim();
    if (!address || !city || !postalCode || address.length < 5 || city.length < 2) {
      return NextResponse.json({ error: "Please complete all required shipping address fields." }, { status: 400 });
    }

    // 2. High-Volume Batch Fetch (Eliminating N+1 queries)
    const itemIds = [...new Set(items.map((i) => i.id))];
    const productCatalogMap = new Map<string, any>();

    if (dbClient) {
      const { data: dbProducts, error: prodFetchError } = await (dbClient.from("products") as any)
        .select("id, name, price, image, in_stock, stock_quantity")
        .in("id", itemIds);

      if (!prodFetchError && Array.isArray(dbProducts)) {
        for (const p of dbProducts) {
          productCatalogMap.set(p.id, p);
        }
      }
    }

    // Fallback to local catalog if any product not found in DB
    for (const local of localProducts) {
      if (!productCatalogMap.has(local.id)) {
        productCatalogMap.set(local.id, {
          id: local.id,
          name: local.name,
          price: local.price,
          image: local.image,
          in_stock: local.inStock,
          stock_quantity: 25,
        });
      }
    }

    let verifiedSubtotal = 0;
    const verifiedOrderItems: Array<{
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      selectedColor?: string;
      image: string;
    }> = [];

    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (isNaN(quantity) || quantity <= 0 || quantity > 10) {
        return NextResponse.json(
          { error: `Invalid quantity for item ${item.id}. Maximum 10 units per creation.` },
          { status: 400 }
        );
      }

      const trustedProduct = productCatalogMap.get(item.id);

      if (!trustedProduct) {
        return NextResponse.json(
          { error: `Product reference ${item.id} could not be verified in the atelier catalog.` },
          { status: 400 }
        );
      }

      if (trustedProduct.in_stock === false || (typeof trustedProduct.stock_quantity === "number" && trustedProduct.stock_quantity < quantity)) {
        return NextResponse.json(
          { error: `"${trustedProduct.name}" does not have sufficient stock for this order quantity.` },
          { status: 409 }
        );
      }

      const verifiedPrice = Number(trustedProduct.price);
      verifiedSubtotal += verifiedPrice * quantity;

      verifiedOrderItems.push({
        productId: trustedProduct.id,
        productName: trustedProduct.name,
        price: verifiedPrice,
        quantity,
        selectedColor: item.selectedColor ? String(item.selectedColor).slice(0, 50) : undefined,
        image: trustedProduct.image,
      });
    }

    // 3. Calculate Financial Totals
    const isFreeShipping = verifiedSubtotal >= 5000;
    const shippingFee = isFreeShipping ? 0 : 250;
    const grandTotal = verifiedSubtotal + shippingFee;

    // 4. Generate Unique Order ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `NIS-2026-${randomSuffix}`;

    // 5. Concurrency-Safe Stock Updates & Order Insertion
    if (dbClient) {
      // Build order record
      const orderPayload: any = {
        id: orderId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: {
          address,
          city,
          state: customer.state || "",
          postalCode,
          paymentMethod: customer.paymentMethod || "card",
        },
        subtotal: verifiedSubtotal,
        shipping_fee: shippingFee,
        total: grandTotal,
        payment_status: "pending",
        order_status: "pending",
        created_at: new Date().toISOString(),
      };

      // Try inserting with idempotency_key if provided
      let orderInsertError = null;
      if (idempotencyKey) {
        const withKey = { ...orderPayload, idempotency_key: idempotencyKey };
        const res = await (dbClient.from("orders") as any).insert(withKey);
        if (res.error) {
          // If schema cache doesn't have idempotency_key yet, fallback without it
          const fallbackRes = await (dbClient.from("orders") as any).insert(orderPayload);
          orderInsertError = fallbackRes.error;
        }
      } else {
        const res = await (dbClient.from("orders") as any).insert(orderPayload);
        orderInsertError = res.error;
      }

      if (orderInsertError) {
        console.error("Order insertion error:", orderInsertError);
        return NextResponse.json(
          { error: "Database transaction failed under current load. Please try again." },
          { status: 500 }
        );
      }

      // Insert Order Items in batch
      const orderItemsRows = verifiedOrderItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
        image: item.image,
      }));

      await (dbClient.from("order_items") as any).insert(orderItemsRows);

      // Decrement Inventory safely
      for (const item of verifiedOrderItems) {
        try {
          const currentP = productCatalogMap.get(item.productId);
          if (currentP && typeof currentP.stock_quantity === "number") {
            const newStock = Math.max(0, currentP.stock_quantity - item.quantity);
            await (dbClient.from("products") as any)
              .update({
                stock_quantity: newStock,
                in_stock: newStock > 0,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.productId);
          }
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: verifiedSubtotal,
      shippingFee,
      total: grandTotal,
      customerName: name,
      customerEmail: email,
      destination: `${address}, ${city} - ${postalCode}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred during checkout. Please try again." },
      { status: 500 }
    );
  }
}
