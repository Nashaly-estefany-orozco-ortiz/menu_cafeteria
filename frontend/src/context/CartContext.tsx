import React, { createContext, useContext, useMemo, useState } from "react";

import type { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const remove = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const setQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      remove(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clear = () => setItems([]);

  const { total, count } = useMemo(() => {
    const t = items.reduce(
      (acc, i) => acc + i.product.price * i.quantity,
      0
    );
    const c = items.reduce((acc, i) => acc + i.quantity, 0);
    return { total: t, count: c };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQuantity, clear, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
