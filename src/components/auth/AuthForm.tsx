"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface AuthFormProps {
  initialMode?: "signin" | "signup";
  onSuccess?: () => void;
  isInlineModal?: boolean;
}

export function AuthForm({
  initialMode = "signin",
  onSuccess,
  isInlineModal = false,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/orders";

  const { signIn, signUp, resetPassword } = useCustomerAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const isCheckoutRedirect = redirectUrl.includes("checkout");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setErrorMsg("Please enter your registered email address.");
        return;
      }
      setIsLoading(true);
      const res = await resetPassword(email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg("A password recovery link has been sent to your email.");
      } else {
        setErrorMsg(res.error || "Could not dispatch reset email. Please try again.");
      }
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters in length.");
        return;
      }

      setIsLoading(true);
      const res = await signUp({
        fullName,
        email,
        phone,
        password,
      });
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || "Registration could not be completed.");
        return;
      }

      setSuccessMsg("Welcome to Nishya Atelier! Your account is active.");
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 500);
      }
      return;
    }

    // Sign In Mode
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);
    const res = await signIn(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Authentication failed. Please verify credentials.");
      return;
    }

    setSuccessMsg("Welcome back! Redirecting...");
    if (onSuccess) {
      onSuccess();
    } else {
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 500);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto ${
        isInlineModal
          ? "p-6 sm:p-8 bg-white rounded-3xl border border-luxury-border shadow-xl"
          : "p-6 sm:p-10 bg-white/95 backdrop-blur-md rounded-3xl border border-luxury-border/80 shadow-2xl"
      }`}
    >
      {/* Checkout notice if user was redirected from checkout */}
      {isCheckoutRedirect && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-300">
          <ShieldCheck className="w-5 h-5 text-luxury-gold shrink-0" />
          <span>
            <strong>Client Verification Required:</strong> Please sign in or create an account to finalize your order.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-luxury-gold block">
          Nishya Privé Client Portal
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal">
          {mode === "signin"
            ? "Sign In to Your Account"
            : mode === "signup"
            ? "Create Your Account"
            : "Recover Your Password"}
        </h2>
        <p className="text-xs text-luxury-muted leading-relaxed max-w-xs mx-auto">
          {mode === "signin"
            ? "Access your bespoke order history, shipment tracking, and saved preferences."
            : mode === "signup"
            ? "Join our private client circle to place orders and enjoy white-glove service."
            : "Enter your registered email address and we will dispatch a secure recovery link."}
        </p>
      </div>

      {/* Mode Selector Tabs (only when not in forgot mode) */}
      {mode !== "forgot" && (
        <div className="grid grid-cols-2 p-1 bg-luxury-soft rounded-2xl border border-luxury-border mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-white text-luxury-charcoal shadow-xs"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-luxury-charcoal shadow-xs"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1 font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="flex-1 font-medium">{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name field (Sign Up only) */}
        {mode === "signup" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-luxury-charcoal block">
              Full Name <span className="text-luxury-gold">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Aadya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-luxury-soft/70 border border-luxury-border rounded-xl text-xs text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none focus:border-luxury-gold focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-luxury-charcoal block">
            Email Address <span className="text-luxury-gold">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="client@luxurymail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-luxury-soft/70 border border-luxury-border rounded-xl text-xs text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none focus:border-luxury-gold focus:bg-white transition-all min-h-[46px]"
            />
          </div>
        </div>

        {/* Telephone Number (Sign Up only, optional) */}
        {mode === "signup" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-luxury-charcoal block">
              Phone Number <span className="text-luxury-muted font-normal">(Optional for delivery updates)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-luxury-soft/70 border border-luxury-border rounded-xl text-xs text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none focus:border-luxury-gold focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>
        )}

        {/* Password (for signin & signup) */}
        {mode !== "forgot" && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-luxury-charcoal block">
                Password <span className="text-luxury-gold">*</span>
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-luxury-gold hover:text-luxury-charcoal font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-luxury-soft/70 border border-luxury-border rounded-xl text-xs text-luxury-charcoal placeholder:text-luxury-muted/60 focus:outline-none focus:border-luxury-gold focus:bg-white transition-all min-h-[46px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-charcoal transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-full bg-luxury-charcoal hover:bg-luxury-dark text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg shadow-luxury-charcoal/20 disabled:opacity-50 cursor-pointer min-h-[48px]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === "signin"
                  ? "Enter Atelier"
                  : mode === "signup"
                  ? "Complete Registration"
                  : "Send Reset Link"}
              </span>
              <ArrowRight className="w-4 h-4 text-luxury-gold" />
            </>
          )}
        </button>

        {/* Back button if in forgot password mode */}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="w-full text-center py-2 text-xs text-luxury-muted hover:text-luxury-charcoal transition-colors cursor-pointer"
          >
            ← Back to Sign In
          </button>
        )}
      </form>

      {/* Footer / Trust Guarantee */}
      <div className="mt-8 pt-6 border-t border-luxury-border/60 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[11px] text-luxury-muted">
          <ShieldCheck className="w-4 h-4 text-luxury-gold" />
          <span>Encrypted Client Confidentiality & SSL Security</span>
        </div>
        <p className="text-[10px] text-luxury-muted/70">
          By signing in or creating an account, you accept Nishya&apos;s Haute Maroquinerie Terms & Client Privacy Charter.
        </p>
      </div>
    </div>
  );
}
