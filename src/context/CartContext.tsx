"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "nishya_cart_items_v1";
const FREE_SHIPPING_THRESHOLD = 5000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load from localStorage on mount asynchronously with rigorous validation
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item) => item && item.product && typeof item.product.price === "number" && item.product.name
            );
            setItems(valid);
          }
        }
      } catch (err) {
        console.error("Failed to load cart from storage", err);
      } finally {
        setHasHydrated(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to storage", err);
    }
  }, [items, hasHydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedColor?: string) => {
      if (!product || !product.id) return;
      const color = selectedColor || product.color || "Signature Edition";
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item?.product?.id === product.id && item.selectedColor === color
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + quantity,
          };
          return updated;
        }

        return [...prevItems, { product, quantity, selectedColor: color }];
      });

      // Automatically open drawer when adding to cart
      setIsOpen(true);

      // Trigger mobile haptic vibration if supported
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate(40);
        } catch {}
      }

      // Notify floating cart toast for 100% instant visual feedback
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nishya_cart_item_added", {
            detail: { product, color },
          })
        );
      }
    },
    []
  );

  const removeFromCart = useCallback((productId: string, selectedColor?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && (!selectedColor || item.selectedColor === selectedColor))
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedColor?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedColor);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.product.id === productId && (!selectedColor || item.selectedColor === selectedColor)) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item?.product?.price) || 0;
    const qty = Number(item?.quantity) || 0;
    return sum + price * qty;
  }, 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        isFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
