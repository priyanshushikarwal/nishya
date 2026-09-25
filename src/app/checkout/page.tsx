"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
  UserCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/lib/utils";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";

export default function CheckoutPage() {
  const { items, subtotal, isFreeShipping, clearCart } = useCart();
  const { user, profile, isAuthenticated, isLoading: isAuthLoading, signOut } = useCustomerAuth();

  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("NIS-2026-849201");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "card" as "card" | "upi" | "cod",
  });

  // Auto-fill from authenticated client profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name ? prev.name : (profile?.full_name || (user.user_metadata?.full_name as string) || ""),
        email: user.email || "",
        phone: prev.phone ? prev.phone : (profile?.phone || (user.user_metadata?.phone as string) || ""),
      }));
    }
  }, [user, profile]);

  // Promotional Privilege Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponAppliedMsg, setCouponAppliedMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError("");
    setCouponAppliedMsg("");

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError("Please enter a privilege code.");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "The promotional code entered is invalid or expired.");
        setDiscountAmount(0);
        setCouponAppliedMsg("");
      } else {
        setDiscountAmount(data.discountAmount);
        setCouponAppliedMsg(`✓ Code ${data.code} applied: ${data.description}`);
        setCouponError("");
      }
    } catch {
      setCouponError("Could not validate promotional code. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponAppliedMsg("");
    setCouponError("");
  };

  const shippingFee = isFreeShipping ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

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

    if (!user?.email) {
      setErrorMessage("Please sign in or create an account to finalize your order.");
      setIsProcessing(false);
      return;
    }

    const payloadCustomer = {
      ...formData,
      name: formData.name.trim() || profile?.full_name || "Valued Client",
      email: user.email, // Bound strictly to authenticated user email
    };

    // 1. If Concierge Pay on Delivery, directly place order as confirmed/pending payment
    if (formData.paymentMethod === "cod") {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: payloadCustomer,
            items: items.map((i) => ({
              id: i.product.id,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
            })),
            couponCode: couponCode.trim().toUpperCase() || undefined,
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
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: payloadCustomer,
          items: items.map((i) => ({
            id: i.product.id,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
          })),
          couponCode: couponCode.trim().toUpperCase() || undefined,
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
          name: payloadCustomer.name,
          email: payloadCustomer.email,
          contact: payloadCustomer.phone.replace(/[^0-9+]/g, ""),
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

            // Payment successfully verified!
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
            /* ======================================================== */
            /* 1. ORDER COMPLETE CONFIRMATION                           */
            /* ======================================================== */
            <div className="max-w-lg mx-auto py-12 sm:py-16 text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-300 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
                  Order Confirmed & Registered
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
                  Thank You for Your Patronage
                </h1>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  Your bespoke creation has been recorded under order{" "}
                  <strong className="text-luxury-charcoal font-semibold">
                    #{orderId}
                  </strong>
                  . A formal receipt has been dispatched to{" "}
                  <span className="text-luxury-charcoal font-medium">{user?.email || formData.email}</span>.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-luxury-soft border border-luxury-border text-left text-xs space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-luxury-muted">Delivery To:</span>
                  <span className="text-luxury-charcoal font-bold">{formData.name || profile?.full_name}</span>
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

              {/* Action Buttons: View in My Orders & Return to collection */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-lg shadow-luxury-charcoal/20 min-h-[48px]"
                >
                  <span>View in My Orders</span>
                  <ArrowRight className="w-4 h-4 text-luxury-gold" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white border border-luxury-border hover:bg-luxury-soft text-luxury-charcoal text-xs uppercase tracking-widest font-semibold transition-all min-h-[48px]"
                >
                  Return to Collection
                </Link>
              </div>
            </div>
          ) : isAuthLoading ? (
            /* ======================================================== */
            /* 2. AUTHENTICATION LOADING SKELETON                       */
            /* ======================================================== */
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-luxury-gold">
                Verifying Client Access...
              </p>
            </div>
          ) : !isAuthenticated ? (
            /* ======================================================== */
            /* 3. LUXURY AUTH GATE (Non-logged in user checkout guard)  */
            /* ======================================================== */
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
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
                    Client Verification Required
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-luxury-muted">
                  <Lock className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Nishya Privé Security Protocol</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left: Sign In / Create Account Form */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-luxury-gold shrink-0" />
                    <span>
                      <strong>Guests may freely browse our capsule collections,</strong> but placing orders and receiving courier tracking requires a verified client account.
                    </span>
                  </div>

                  <AuthForm isInlineModal initialMode="signin" />
                </div>

                {/* Right: Cart Summary Preservation */}
                <div className="lg:col-span-5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-luxury-soft/80 border border-luxury-border space-y-5">
                  <div className="flex items-center justify-between border-b border-luxury-border pb-3">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                      Your Reserved Bag ({items.length})
                    </h2>
                    <span className="text-[10px] bg-luxury-gold text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Reserved
                    </span>
                  </div>

                  <div className="divide-y divide-luxury-border/60 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-14 rounded-lg bg-white overflow-hidden shrink-0 border border-luxury-border">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="truncate">
                            <div className="font-serif font-bold text-luxury-charcoal truncate">
                              {item.product.name}
                            </div>
                            <span className="text-[10px] text-luxury-muted">
                              Qty: {item.quantity} · {item.selectedColor || "Signature"}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-luxury-charcoal shrink-0">
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
                      <span>Delivery</span>
                      <span>
                        {isFreeShipping ? (
                          <span className="text-emerald-700 font-semibold">Complimentary</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-luxury-border flex justify-between text-base font-serif font-bold text-luxury-charcoal">
                      <span>Grand Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-luxury-border text-[11px] text-luxury-muted space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-luxury-charcoal">
                      <Sparkles className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                      <span>Instant Order Activation</span>
                    </div>
                    <p>Your bag contents are preserved. Sign in or register above to unlock delivery selection immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 4. AUTHENTICATED USER CHECKOUT FORM                     */
            /* ======================================================== */
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
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

                {/* Authenticated Client Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-luxury-soft border border-luxury-border text-xs">
                    <UserCheck className="w-3.5 h-3.5 text-luxury-gold" />
                    <span className="font-medium text-luxury-charcoal truncate max-w-[180px]">
                      {profile?.full_name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-xs text-luxury-muted hover:text-luxury-charcoal underline cursor-pointer"
                    title="Sign Out"
                  >
                    Switch Account
                  </button>
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
                      1. Delivery Address & Recipient
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-luxury-muted font-medium">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Recipient Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-luxury-muted font-medium">Verified Email</label>
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ Tied to Account</span>
                        </div>
                        <input
                          type="email"
                          readOnly
                          disabled
                          value={user?.email || formData.email}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-luxury-soft/80 text-luxury-charcoal/80 cursor-not-allowed min-h-[44px] font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
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
                          placeholder="Apartment, suite, street address"
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
                          placeholder="City / District"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-luxury-muted font-medium">State / Region</label>
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-luxury-muted font-medium">Postal / ZIP Code</label>
                        <input
                          type="text"
                          required
                          placeholder="Postal Code"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-luxury-border bg-white text-luxury-charcoal focus:outline-none focus:border-luxury-charcoal min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3 sm:space-y-4 pt-4 border-t border-luxury-border">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
                      2. Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Card via Razorpay */}
                      <label
                        className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.paymentMethod === "card"
                            ? "border-luxury-charcoal bg-luxury-soft/80 ring-1 ring-luxury-charcoal"
                            : "border-luxury-border bg-white hover:border-luxury-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-luxury-charcoal">Card</span>
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === "card"}
                            onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                            className="text-luxury-charcoal focus:ring-0"
                          />
                        </div>
                        <span className="text-[11px] text-luxury-muted leading-tight">
                          Debit & Credit via Razorpay (Encrypted)
                        </span>
                      </label>

                      {/* UPI via Razorpay */}
                      <label
                        className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.paymentMethod === "upi"
                            ? "border-luxury-charcoal bg-luxury-soft/80 ring-1 ring-luxury-charcoal"
                            : "border-luxury-border bg-white hover:border-luxury-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-luxury-charcoal">UPI / QR</span>
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === "upi"}
                            onChange={() => setFormData({ ...formData, paymentMethod: "upi" })}
                            className="text-luxury-charcoal focus:ring-0"
                          />
                        </div>
                        <span className="text-[11px] text-luxury-muted leading-tight">
                          Google Pay, PhonePe, Paytm via Razorpay
                        </span>
                      </label>

                      {/* Cash on Delivery */}
                      <label
                        className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.paymentMethod === "cod"
                            ? "border-luxury-charcoal bg-luxury-soft/80 ring-1 ring-luxury-charcoal"
                            : "border-luxury-border bg-white hover:border-luxury-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-luxury-charcoal">Pay on Delivery</span>
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === "cod"}
                            onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                            className="text-luxury-charcoal focus:ring-0"
                          />
                        </div>
                        <span className="text-[11px] text-luxury-muted leading-tight">
                          Concierge delivery verification upon arrival
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || items.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg shadow-luxury-charcoal/20 disabled:opacity-50 cursor-pointer min-h-[48px]"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {formData.paymentMethod === "cod"
                              ? `Confirm Order — ${formatPrice(grandTotal)}`
                              : `Proceed to Pay ${formatPrice(grandTotal)}`}
                          </span>
                          <ArrowRight className="w-4 h-4 text-luxury-gold" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-luxury-muted mt-2">
                      Order will be instantly recorded under your client account and trackable in &quot;My Orders&quot;.
                    </p>
                  </div>
                </div>

                {/* Right: Order Summary Sidebar (5 cols on lg:) */}
                <div className="lg:col-span-5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-luxury-soft/80 border border-luxury-border space-y-5">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
                    Order Summary ({items.length} {items.length === 1 ? "Piece" : "Pieces"})
                  </h2>

                  <div className="divide-y divide-luxury-border/60 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-14 rounded-lg bg-white overflow-hidden shrink-0 border border-luxury-border">
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

                  {/* Privilege Atelier Code Box */}
                  <div className="pt-3 border-t border-luxury-border space-y-2">
                    <label className="text-xs text-luxury-muted font-semibold uppercase tracking-wider block">
                      Privilege Atelier Code
                    </label>
                    <div className="flex rounded-full overflow-hidden border border-luxury-border bg-white focus-within:border-luxury-gold shadow-xs">
                      <input
                        type="text"
                        placeholder="ENTER CODE (E.G. LUXE10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-4 py-2 text-xs uppercase text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none min-h-[40px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="px-4 bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0 min-h-[40px] disabled:opacity-50"
                      >
                        {isValidatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>

                    {couponAppliedMsg && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span>{couponAppliedMsg}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-700 hover:text-emerald-900 underline font-medium ml-2 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        {couponError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-luxury-border">
                    <div className="flex justify-between text-luxury-muted">
                      <span>Subtotal</span>
                      <span className="font-bold text-luxury-charcoal">{formatPrice(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Privilege Discount ({couponCode.toUpperCase()})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

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
