"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "yo2ytculno";

export function MicrosoftClarity() {
  useEffect(() => {
    if (typeof window !== "undefined" && CLARITY_PROJECT_ID) {
      try {
        Clarity.init(CLARITY_PROJECT_ID);
      } catch (err) {
        console.warn("Microsoft Clarity initialization error:", err);
      }
    }
  }, []);

  return null;
}
