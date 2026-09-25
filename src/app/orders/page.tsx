"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  price: number;
  quantity: number;
  selected_color?: string;
  image?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: any;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_items?: OrderItem[];
}

function OrdersContent() {
  const { user, profile, isLoading: isAuthLoading, isAuthenticated } = useCustomerAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "delivered">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch orders for current customer
  const fetchCustomerOrders = useCallback(async () => {
    if (!user?.email) {
      setIsLoadingOrders(false);
      return;
    }

    setIsLoadingOrders(true);
    try {
      // 1. Try our Next.js API route first
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
          setIsLoadingOrders(false);
          return;
        }
      }

      // 2. Direct client query via Supabase SDK if API didn't return
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("customer_email", user.email.toLowerCase().trim())
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data as Order[]);
          setIsLoadingOrders(false);
          return;
        }
      }

      setOrders([]);
    } catch (err) {
      console.warn("Could not fetch customer orders:", err);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchCustomerOrders();
      } else {
        setIsLoadingOrders(false);
      }
    }
  }, [user, isAuthLoading, fetchCustomerOrders, refreshKey]);

  // Loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif text-xs uppercase tracking-[0.25em] text-luxury-gold">
          Authenticating Client Credentials...
        </p>
      </div>
    );
  }

  // Not logged in gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-16 sm:py-24 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-luxury-soft border border-luxury-border flex items-center justify-center mx-auto text-luxury-gold shadow-md">
          <Lock className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-luxury-gold">
            Nishya Privé Vault
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
            Client Order Tracking
          </h1>
          <p className="text-xs text-luxury-muted leading-relaxed max-w-sm mx-auto">
            Please sign in to view your bespoke orders, real-time shipment logistics, and historical invoices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/login?redirect=/orders"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-md shadow-luxury-charcoal/20 min-h-[46px]"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 text-luxury-gold" />
          </Link>
          <Link
            href="/signup?redirect=/orders"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white border border-luxury-border hover:bg-luxury-soft text-luxury-charcoal text-xs uppercase tracking-widest font-semibold transition-all min-h-[46px]"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "delivered") return order.order_status === "delivered";
    if (filter === "active") return order.order_status !== "delivered" && order.order_status !== "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
        return {
          label: "Delivered",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      case "shipped":
        return {
          label: "In Transit",
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          icon: Truck,
        };
      case "processing":
        return {
          label: "Handcrafting in Atelier",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Sparkles,
        };
      case "confirmed":
        return {
          label: "Order Confirmed",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: CheckCircle2,
        };
      default:
        return {
          label: "Order Registered",
          bg: "bg-stone-100 text-stone-800 border-stone-200",
          icon: Clock,
        };
    }
  };

  const parseAddress = (shippingAddress: any) => {
    if (!shippingAddress) return null;
    if (typeof shippingAddress === "string") {
      try {
        return JSON.parse(shippingAddress);
      } catch {
        return { address: shippingAddress };
      }
    }
    return shippingAddress;
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-border pb-6 sm:pb-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              Personal Atelier Portfolio
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
            <span className="text-[10px] text-luxury-muted font-medium">
              Verified Client
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-charcoal">
            My Orders & Acquisitions
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Logged in as <strong className="text-luxury-charcoal">{profile?.full_name || "Nishya Patron"}</strong> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={isLoadingOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-luxury-border hover:bg-luxury-soft text-xs font-semibold text-luxury-charcoal transition-all cursor-pointer min-h-[40px]"
            title="Refresh order history"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-luxury-gold" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-md min-h-[40px]"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5 text-luxury-gold" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            filter === "all"
              ? "bg-luxury-charcoal text-white shadow-sm"
              : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal border border-luxury-border"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            filter === "active"
              ? "bg-luxury-charcoal text-white shadow-sm"
              : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal border border-luxury-border"
          }`}
        >
          In Progress ({orders.filter((o) => o.order_status !== "delivered" && o.order_status !== "cancelled").length})
        </button>
        <button
          onClick={() => setFilter("delivered")}
          className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            filter === "delivered"
              ? "bg-luxury-charcoal text-white shadow-sm"
              : "bg-luxury-soft text-luxury-muted hover:text-luxury-charcoal border border-luxury-border"
          }`}
        >
          Delivered ({orders.filter((o) => o.order_status === "delivered").length})
        </button>
      </div>

      {/* Orders List */}
      {isLoadingOrders ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-luxury-muted">Retrieving your order portfolio from the atelier vault...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4 bg-luxury-soft/50 rounded-3xl border border-luxury-border">
          <div className="w-16 h-16 rounded-full bg-white border border-luxury-border mx-auto flex items-center justify-center text-luxury-muted shadow-xs">
            <Package className="w-7 h-7 opacity-50 text-luxury-gold" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-luxury-charcoal">
            {filter === "all"
              ? "No Orders Found Yet"
              : filter === "active"
              ? "No Active In-Progress Orders"
              : "No Delivered Orders Yet"}
          </h2>
          <p className="text-xs text-luxury-muted font-light leading-relaxed">
            {filter === "all"
              ? "When you acquire an exquisite Nishya creation, its journey from our master artisans to your doorstep will appear right here."
              : "All your pieces have either completed delivery or you have no active orders in transit."}
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-widest font-semibold hover:bg-luxury-dark transition-all"
            >
              <span>Browse New Arrivals</span>
              <ArrowRight className="w-4 h-4 text-luxury-gold" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusBadge = getStatusBadge(order.order_status);
            const StatusIcon = statusBadge.icon;
            const addr = parseAddress(order.shipping_address);
            const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-luxury-border overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 bg-luxury-soft/60 border-b border-luxury-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                        Order #{order.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-muted">
                      Placed on {dateStr}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Order Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusBadge.label}</span>
                    </span>

                    {/* Payment Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      <span>
                        {order.payment_status === "paid"
                          ? "✓ Paid"
                          : order.shipping_address?.paymentMethod === "cod"
                          ? "Pay on Delivery"
                          : "Payment Pending"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Live Consignment & Tracking Update */}
                {addr && (addr.trackingNumber || addr.courier || addr.trackingUrl) && (
                  <div className="mx-4 sm:mx-6 mt-4 p-3.5 sm:p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-900 shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-indigo-950 flex items-center gap-2">
                          <span>Dispatch via {addr.courier || "Insured Express Courier"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900 font-bold uppercase tracking-wider">
                            In Transit
                          </span>
                        </div>
                        {addr.trackingNumber && (
                          <div className="text-[11px] text-indigo-800 mt-0.5">
                            Consignment AWB: <strong className="font-mono">{addr.trackingNumber}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {addr.trackingUrl ? (
                      <a
                        href={addr.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-indigo-900 hover:bg-indigo-950 text-white font-medium text-xs transition-colors shadow-xs shrink-0 cursor-pointer"
                      >
                        <span>Track Live Parcel</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-indigo-700 italic">
                        Out for delivery with courier
                      </span>
                    )}
                  </div>
                )}

                {/* Items in this order */}
                <div className="p-4 sm:p-6 divide-y divide-luxury-border/60">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                      >
                        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-luxury-soft overflow-hidden shrink-0 border border-luxury-border">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-luxury-muted text-xs">
                              <ShoppingBag className="w-6 h-6 opacity-30" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm sm:text-base font-semibold text-luxury-charcoal truncate">
                            {item.product_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-luxury-muted">
                            {item.selected_color && (
                              <span>Color: <strong className="text-luxury-charcoal">{item.selected_color}</strong></span>
                            )}
                            <span>·</span>
                            <span>Qty: <strong className="text-luxury-charcoal">{item.quantity}</strong></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-serif text-sm sm:text-base font-bold text-luxury-charcoal">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-luxury-muted">
                              {formatPrice(item.price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-xs text-luxury-muted italic">
                      Order details confirmed. Artisan items packaged in keepsake presentation box.
                    </div>
                  )}
                </div>

                {/* Order Footer & Breakdown */}
                <div className="p-4 sm:p-6 bg-luxury-soft/30 border-t border-luxury-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  {/* Shipping address preview */}
                  <div className="space-y-1 text-luxury-muted max-w-md">
                    <div className="font-semibold text-luxury-charcoal flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-luxury-gold" />
                      <span>Delivery Recipient: {order.customer_name}</span>
                    </div>
                    {addr && (
                      <p className="line-clamp-2 text-[11px]">
                        {addr.address}, {addr.city} {addr.state} - {addr.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Financials & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-luxury-border">
                    <div className="text-right">
                      <div className="text-[11px] text-luxury-muted">
                        Total Amount ({order.order_items?.length || 1} item
                        {(order.order_items?.length || 1) > 1 ? "s" : ""})
                      </div>
                      <div className="font-serif text-base sm:text-xl font-bold text-luxury-charcoal">
                        {formatPrice(order.total)}
                      </div>
                    </div>

                    <Link
                      href="/products"
                      className="px-4 py-2 rounded-full border border-luxury-border hover:bg-luxury-soft text-luxury-charcoal font-semibold transition-colors shrink-0"
                    >
                      Shop More
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Luxury Client Guarantee Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-luxury-soft border border-luxury-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-luxury-muted">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-luxury-gold shrink-0" />
          <span>
            Every Nishya creation includes our Certificate of Authenticity and 12-month Artisan Atelier Warranty.
          </span>
        </div>
        <a
          href="mailto:concierge@nishya.luxury"
          className="text-luxury-charcoal font-semibold hover:text-luxury-gold transition-colors underline shrink-0"
        >
          Contact Luxury Concierge
        </a>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <CanvasWrapper>
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <OrdersContent />
        </Suspense>
      </main>
      <Footer />
    </CanvasWrapper>
  );
}
