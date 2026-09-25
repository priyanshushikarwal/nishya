import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CanvasWrapper } from "@/components/layout/CanvasWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account | Nishya — Haute Maroquinerie",
  description: "Create your private Nishya client account to place bespoke orders and enjoy privileged client concierge.",
};

function SignUpContent() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center">
      <AuthForm initialMode="signup" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <CanvasWrapper>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <SignUpContent />
        </Suspense>
      </main>
      <Footer />
    </CanvasWrapper>
  );
}
