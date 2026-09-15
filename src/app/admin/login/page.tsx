"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Sparkles, AlertCircle, Database } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isSupabaseActive } = useAdminAuth();

  const [email, setEmail] = useState("admin@pursia.luxury");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/admin");
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@pursia.luxury");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen w-full bg-[#151418] text-white flex flex-col justify-between p-4 sm:p-8 selection:bg-luxury-gold selection:text-white">
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between py-4">
        <Link href="/" className="font-serif text-2xl font-bold tracking-[0.2em] text-white hover:text-luxury-gold transition-colors">
          PURSIA
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className={`w-2 h-2 rounded-full ${isSupabaseActive ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
          <span>{isSupabaseActive ? "Supabase Live Mode" : "Local Standalone Mode"}</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#1E1D22] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-luxury-gold text-[10px] uppercase tracking-[0.25em] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atelier Management</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-white/50 font-light">
              Sign in to manage luxury products, hero campaigns, and storefront CMS
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-white/70 block">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pursia.luxury"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-luxury-gold focus:outline-none text-white text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-white/70 block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-luxury-gold focus:outline-none text-white text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-luxury-gold hover:bg-luxury-gold-light active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-[0.2em] shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Enter Atelier CMS"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Fill Helper */}
          <div className="pt-2 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-white/50 hover:text-luxury-gold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Autofill Demo Credentials (admin@pursia.luxury)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center py-4 text-xs text-white/40">
        Pursia Haute Maroquinerie &copy; {new Date().getFullYear()} — Restricted Administration
      </div>
    </div>
  );
}
