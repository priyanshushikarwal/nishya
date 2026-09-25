"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CheckoutPage() {
  const { items, subtotal, isFreeShipping, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("NIS-2026-849201");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "Aadya Sharma",
    email: "aadya.sharma@luxurymail.com",
    phone: "+91 98765 43210",
    address: "Penthouse 14B, The Oberoi Enclave",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    paymentMethod: "card" as "card" | "upi" | "cod",
  });

  const shippingFee = isFreeShipping ? 0 : 250;
  const grandTotal = subtotal + shippingFee;

  // Dynamic Razorpay SDK script loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    // 1. If Concierge Pay on Delivery, directly place order as confirmed/pending payment
    if (formData.paymentMethod === "cod") {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: formData,
            items: items.map((i) => ({
              id: i.product.id,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Order processing failed. Please try again.");
          setIsProcessing(false);
          return;
        }

        setOrderId(data.orderId);
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
        return;
      } catch {
        setErrorMessage("Network connection error. Please check your connection.");
        setIsProcessing(false);
        return;
      }
    }

    // 2. Online Payment (Card / UPI) via Razorpay
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMessage("Razorpay payment gateway failed to load. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // Step A: Register the order in database first (in 'pending' payment status)
      // Prices and subtotal are strictly calculated by the server from the product catalog.
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: items.map((i) => ({
            id: i.product.id,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        setErrorMessage(orderData.error || "Order preparation failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      const createdOrderId = orderData.orderId;

      // Step B: Create Razorpay Order referencing the verified Order ID
      // Server will fetch the exact amount from the database, preventing any client-side price tampering.
      const rzpOrderRes = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrderId,
          currency: "INR",
        }),
      });

      const rzpOrderData = await rzpOrderRes.json();
      if (!rzpOrderRes.ok || !rzpOrderData.id) {
        setErrorMessage(rzpOrderData.error || "Could not initiate payment gateway session. Please try again.");
        setIsProcessing(false);
        return;
      }

      const razorpayKey =
        rzpOrderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_Te2wCxAX1j4qSL";

      // Configure Razorpay Checkout options
      const options = {
        key: razorpayKey,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || "INR",
        name: "NISHYA",
        description: "Atelier Haute Maroquinerie Acquisition",
        image: "/images/nishya/carry_your_story_pink_arch.jpg",
        order_id: rzpOrderData.is_mock ? undefined : rzpOrderData.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone.replace(/[^0-9+]/g, ""),
        },
        theme: {
          color: "#151418", // Nishya luxury obsidian black
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: any) => {
          setIsProcessing(true);
          try {
            const paymentId = response.razorpay_payment_id || `pay_test_${Date.now()}`;

            // Step C: Cryptographically verify payment on server before confirming order
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: createdOrderId,
                razorpayOrderId: response.razorpay_order_id || rzpOrderData.id,
                razorpayPaymentId: paymentId,
                razorpaySignature: response.razorpay_signature || "",
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              setErrorMessage(
                verifyData.error || "Payment verification failed. Please contact concierge support."
              );
              setIsProcessing(false);
              return;
            }

            // Payment successfully verified by server!
            setOrderId(createdOrderId);
            setConfirmedPaymentId(paymentId);
            setIsProcessing(false);
            setOrderComplete(true);
            clearCart();
          } catch {
            setErrorMessage(
              `Payment verification encountered a network error. Your Order ID is #${createdOrderId}. Please contact support.`
            );
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setErrorMessage(resp.error?.description || "Payment authorization was declined.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      setErrorMessage(err?.message || "An unexpected error occurred while initiating Razorpay checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <CanvasWrapper>
      <Header />

      <main className="px-4 sm:px-6 md:px-8 lg:px-14 py-6 sm:py-10 lg:py-16 overflow-x-clip">
        <div className="w-full max-w-[1200px] mx-auto">
          {orderComplete ? (
            <div className="max-w-lg mx-auto py-12 sm:py-16 text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-300 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
                  Order Confirmed
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
                  Thank You for Your Patronage
                </h1>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  Your bespoke creation has been registered under order{" "}
                  <strong className="text-luxury-charcoal">
                    #{orderId}
                  </strong>
                  . A formal receipt and shipment tracking schedule has been dispatched to{" "}
                  <span className="text-luxury-charcoal font-medium">{formData.email}</span>.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-luxury-soft border border-luxury-border text-left text-xs space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-luxury-muted">Delivery To:</span>
                  <span className="text-luxury-charcoal font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-muted">Destination:</span>
                  <span className="text-luxury-charcoal text-right">
                    {formData.address}, {formData.city} - {formData.postalCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-muted">Payment:</span>
                  <span className="text-luxury-charcoal font-medium capitalize">
                    {formData.paymentMethod === "card"
                      ? "Credit / Debit Card (Razorpay)"
                      : formData.paymentMethod === "upi"
                      ? "Instant UPI (Razorpay)"
                      : "Concierge Pay on Delivery"}
                  </span>
                </div>
                {confirmedPaymentId && (
                  <div className="flex justify-between font-mono text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                    <span>Payment Ref:</span>
                    <span className="font-bold">{confirmedPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-luxury-muted">Packaging:</span>
                  <span className="text-luxury-gold font-semibold">
                    Nishya Keepsake Box & Dustbag
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-8 py-3.5 rounded-full bg-luxury-charcoal text-white text-xs uppercase tracking-widest font-semibold hover:bg-luxury-dark transition-all min-h-[48px]"
                >
                  Return to Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-border pb-4 sm:pb-6">
                <div>
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-luxury-muted hover:text-luxury-charcoal mb-1 py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Bag</span>
                  </Link>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
                    Checkout & Delivery
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-luxury-muted">
                  <Lock className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Secure SSL Checkout</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                  <span className="font-semibold">Checkout Notice:</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Form Fields (7 cols on lg:) */}
                <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                  {/* Personal & Shipping Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                      1. Delivery Address
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-luxury-muted font-medium">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-luxury-muted font-medium">Street Address</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">City</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3 sm:space-y-4 pt-3 border-t border-luxury-border">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                      2. Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                      {[
                        { id: "card", label: "Credit / Debit Card" },
                        { id: "upi", label: "UPI / NetBanking" },
                        { id: "cod", label: "Concierge Pay on Delivery" },
                      ].map((m) => (
                        <label
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all min-h-[52px] justify-center ${
                            formData.paymentMethod === m.id
                              ? "border-luxury-charcoal bg-luxury-soft font-semibold text-luxury-charcoal shadow-xs"
                              : "border-luxury-border hover:bg-luxury-soft/50 text-luxury-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={formData.paymentMethod === m.id}
                              onChange={() => setFormData({ ...formData, paymentMethod: m.id as "card" | "upi" | "cod" })}
                              className="accent-luxury-gold w-4 h-4"
                            />
                          </div>
                          <span>{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || items.length === 0}
                    className="w-full py-4 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg shadow-luxury-charcoal/20 disabled:opacity-50 cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      "Authorizing..."
                    ) : formData.paymentMethod === "cod" ? (
                      `Place Order • ${formatPrice(grandTotal)}`
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>Pay via Razorpay • {formatPrice(grandTotal)}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Order Summary Sidebar (5 cols on lg:, full width on mobile) */}
                <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-luxury-soft/60 border border-luxury-border space-y-4 sm:space-y-6">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
                    Your Selection ({items.length} pieces)
                  </h3>

                  <div className="divide-y divide-luxury-border max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="py-3 flex gap-3 items-center justify-between"
                      >
                        <div className="flex gap-2.5 items-center">
                          <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden bg-luxury-soft shrink-0 border border-luxury-border">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div>
                            <h4 className="font-serif text-xs font-bold text-luxury-charcoal line-clamp-1">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] sm:text-[11px] text-luxury-muted">
                              Qty: {item.quantity} • {item.selectedColor || "Signature"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-luxury-charcoal shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-luxury-border">
                    <div className="flex justify-between text-luxury-muted">
                      <span>Subtotal</span>
                      <span className="font-bold text-luxury-charcoal">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-luxury-muted">
                      <span>Shipping</span>
                      <span>
                        {isFreeShipping ? (
                          <span className="text-emerald-700 font-semibold">Complimentary</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-luxury-border flex justify-between text-sm sm:text-base font-serif font-bold text-luxury-charcoal">
                      <span>Total Amount</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-luxury-border text-[11px] text-luxury-muted space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-luxury-charcoal">
                      <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                      <span>The Nishya Promise</span>
                    </div>
                    <p>Every piece arrives in signature gold-embossed packaging with certificate of Florentine authenticity.</p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </CanvasWrapper>
  );
}
