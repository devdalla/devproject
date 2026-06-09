import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  imageUrl: string | null;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "styles_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = (item: CartItem) =>
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.size === item.size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });

  const remove = (productId: string, size: string) =>
    setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size)));

  const setQty = (productId: string, size: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId && p.size === size ? { ...p, quantity: Math.max(0, qty) } : p,
        )
        .filter((p) => p.quantity > 0),
    );

  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotalCents = items.reduce((n, i) => n + i.quantity * i.unitPriceCents, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotalCents }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
