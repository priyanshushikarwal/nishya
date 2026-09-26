import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: "customer" | "admin" | "guest";
  tier: "VIP Atelier" | "Connoisseur" | "Client";
  orders_count: number;
  total_spend: number;
  email_confirmed: boolean;
  joined: string;
  created_at: string;
  last_sign_in_at?: string;
  source: "registered" | "guest_order";
}

// Format date into human-readable e.g. "25 Sep 2026"
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Compute client tier based on spend and orders
function computeTier(totalSpend: number, ordersCount: number): "VIP Atelier" | "Connoisseur" | "Client" {
  if (totalSpend >= 8000 || ordersCount >= 3) return "VIP Atelier";
  if (totalSpend >= 2500 || ordersCount >= 1) return "Connoisseur";
  return "Client";
}

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase service client not configured" },
        { status: 503 }
      );
    }

    // 1. Fetch real auth users from Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.listUsers();
    if (authError) {
      console.error("Error fetching Supabase auth users:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Fetch public.profiles if exists
    let profilesMap = new Map<string, any>();
    try {
      const { data: profiles } = await admin.from("profiles").select("*");
      if (profiles) {
        profiles.forEach((p: any) => profilesMap.set(p.id, p));
      }
    } catch (err) {
      console.warn("Could not query profiles table:", err);
    }

    // 3. Fetch public.orders to calculate orders and spend per customer
    let ordersByEmail = new Map<string, any[]>();
    try {
      const { data: orders } = await admin.from("orders").select("*");
      if (orders) {
        orders.forEach((o: any) => {
          const email = (o.customer_email || "").toLowerCase().trim();
          if (email) {
            if (!ordersByEmail.has(email)) ordersByEmail.set(email, []);
            ordersByEmail.get(email)!.push(o);
          }
        });
      }
    } catch (err) {
      console.warn("Could not query orders table:", err);
    }

    const seenEmails = new Set<string>();
    const customers: AdminCustomer[] = [];

    // Process all registered Supabase Auth users
    for (const u of authData?.users || []) {
      const email = (u.email || "").toLowerCase().trim();
      seenEmails.add(email);

      const profile = profilesMap.get(u.id);
      const userOrders = ordersByEmail.get(email) || [];
      const totalSpend = userOrders.reduce(
        (sum, o) => sum + (Number(o.total) || 0),
        0
      );

      // Extract address if available from orders
      let city = "—";
      let phone = u.user_metadata?.phone || profile?.phone || "";
      if (userOrders.length > 0) {
        const latestOrder = userOrders[0];
        if (!phone && latestOrder.customer_phone) {
          phone = latestOrder.customer_phone;
        }
        const shipping =
          typeof latestOrder.shipping_address === "string"
            ? JSON.parse(latestOrder.shipping_address)
            : latestOrder.shipping_address || {};
        if (shipping.city) {
          city = shipping.city + (shipping.state ? `, ${shipping.state}` : "");
        }
      }

      const name =
        profile?.full_name ||
        u.user_metadata?.full_name ||
        (email.includes("@") ? email.split("@")[0] : "Nishya Patron");

      const role =
        (profile?.role as "admin" | "customer") ||
        (u.user_metadata?.role as "admin" | "customer") ||
        "customer";

      customers.push({
        id: u.id,
        name: name.trim() || email.split("@")[0],
        email: u.email || "",
        phone: phone || "—",
        city,
        role,
        tier: computeTier(totalSpend, userOrders.length),
        orders_count: userOrders.length,
        total_spend: totalSpend,
        email_confirmed: Boolean(u.email_confirmed_at),
        joined: formatDate(u.created_at),
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        source: "registered",
      });
    }

    // Also include guest buyers who placed orders but haven't created an auth account yet
    for (const [email, orderList] of ordersByEmail.entries()) {
      if (!seenEmails.has(email) && orderList.length > 0) {
        const latest = orderList[0];
        const totalSpend = orderList.reduce(
          (sum, o) => sum + (Number(o.total) || 0),
          0
        );

        let city = "—";
        const shipping =
          typeof latest.shipping_address === "string"
            ? JSON.parse(latest.shipping_address)
            : latest.shipping_address || {};
        if (shipping.city) {
          city = shipping.city + (shipping.state ? `, ${shipping.state}` : "");
        }

        customers.push({
          id: latest.id,
          name: latest.customer_name || email.split("@")[0],
          email,
          phone: latest.customer_phone || "—",
          city,
          role: "guest",
          tier: computeTier(totalSpend, orderList.length),
          orders_count: orderList.length,
          total_spend: totalSpend,
          email_confirmed: false,
          joined: formatDate(latest.created_at),
          created_at: latest.created_at,
          source: "guest_order",
        });
      }
    }

    // Sort by created_at descending (newest registrations first)
    customers.sort((a, b) => {
      const tA = new Date(a.created_at).getTime() || 0;
      const tB = new Date(b.created_at).getTime() || 0;
      return tB - tA;
    });

    return NextResponse.json({
      success: true,
      customers,
      total: customers.length,
      stats: {
        total_registered: customers.filter((c) => c.source === "registered").length,
        total_guests: customers.filter((c) => c.source === "guest_order").length,
        total_orders_placed: customers.reduce((sum, c) => sum + c.orders_count, 0),
        total_revenue: customers.reduce((sum, c) => sum + c.total_spend, 0),
      },
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/customers:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
