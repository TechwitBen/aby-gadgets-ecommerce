import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { cartService, type CartDoc } from "@/services/Cart.service";
import { useAuth } from "@/contexts/AuthContext";

// ── CartItem — the shape stored locally and used by UI ────────────────────────
export interface CartItem {
  id: string;        // product _id (used as a display/grouping key)
  variantId: string; // variant _id — THIS is the unique cart key
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  storage?: string;
  ram?: string;
  sku?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "abygadget_cart";

// ── Helper: map backend CartDoc → local CartItem[] ────────────────────────────
const docToItems = (doc: CartDoc): CartItem[] =>
  doc.items.map((item) => ({
    id: item.product._id,
    variantId: item.variant._id,
    name: item.product.name,
    price: item.variant.price,
    image: item.product.images?.[0] ?? "",
    quantity: item.quantity,
    color: item.variant.color,
    storage: item.variant.storage,
    ram: item.variant.ram,
    sku: item.variant.sku,
  }));

// ── Provider ──────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, logoutReason } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Tracks whether user was logged in during this session
  const wasAuthenticated = useRef(false);

  // ── 1. Load from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      /* ignore corrupted localStorage */
    }

    setIsInitialized(true);
  }, []);

  // ── 2. Persist to localStorage whenever items change ───────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, isInitialized]);

  // ── 3. Clear cart ONLY on manual logout ────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      // user is logged in
      wasAuthenticated.current = true;
      return;
    }

    if (
      wasAuthenticated.current &&
      isInitialized &&
      logoutReason === "manual"
    ) {
      // real logout → clear everything
      wasAuthenticated.current = false;
      setItems([]);
      localStorage.removeItem(CART_KEY);
    }
  }, [isAuthenticated, isInitialized, logoutReason]);

  // ── 4. On login: sync local cart with server ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const syncOnLogin = async () => {
      setIsSyncing(true);

      try {
        const serverCart = await cartService.getCart();
        const serverItems = docToItems(serverCart);

        // Read local cart
        const localItems = JSON.parse(
          localStorage.getItem(CART_KEY) ?? "[]"
        ) as CartItem[];

        const merged = [...serverItems];

        // Push local-only items to server
        for (const local of localItems) {
          const alreadyExists = merged.find(
            (s) => s.variantId === local.variantId
          );

          if (!alreadyExists) {
            try {
              await cartService.addItem({
                product: local.id,
                variant: local.variantId,
                quantity: local.quantity,
              });

              merged.push(local);
            } catch {
              // variant may no longer exist → skip
            }
          }
        }

        setItems(merged);
      } catch {
        // server unavailable → keep local cart
      } finally {
        setIsSyncing(false);
      }
    };

    syncOnLogin();
  }, [isAuthenticated, isInitialized]);

  // ── Helper: replace local state with server cart ───────────────────────────
  const applyServerCart = useCallback((doc: CartDoc) => {
    setItems(docToItems(doc));
  }, []);

  // ── addToCart ──────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (item: CartItem) => {
      if (isSyncing) return;
      // Never allow undefined variantId
      if (!item.variantId) return;

      // optimistic local update
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.variantId === item.variantId
        );

        if (existing) {
          return prev.map((i) =>
            i.variantId === item.variantId
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                }
              : i
          );
        }

        return [...prev, item];
      });

      // sync to backend if logged in
      if (isAuthenticated) {
        try {
          const doc = await cartService.addItem({
            product: item.id,
            variant: item.variantId,
            quantity: item.quantity,
          });

          applyServerCart(doc);
        } catch {
          // keep optimistic state
        }
      }
    },
    [isAuthenticated, applyServerCart]
  );

  // ── removeFromCart ─────────────────────────────────────────────────────────
  const removeFromCart = useCallback(
    async (variantId: string) => {
      // optimistic
      setItems((prev) =>
        prev.filter((i) => i.variantId !== variantId)
      );

      if (isAuthenticated) {
        try {
          const doc = await cartService.removeItem(variantId);
          applyServerCart(doc);
        } catch {
          // keep optimistic state
        }
      }
    },
    [isAuthenticated, applyServerCart]
  );

  // ── updateQuantity ─────────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(variantId);
        return;
      }

      // optimistic
      setItems((prev) =>
        prev.map((i) =>
          i.variantId === variantId
            ? { ...i, quantity }
            : i
        )
      );

      if (isAuthenticated) {
        try {
          const doc = await cartService.updateItem({
            variant: variantId,
            quantity,
          });

          applyServerCart(doc);
        } catch {
          // keep optimistic state
        }
      }
    },
    [isAuthenticated, applyServerCart, removeFromCart]
  );

  // ── clearCart ──────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_KEY);

    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated]);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return ctx;
};