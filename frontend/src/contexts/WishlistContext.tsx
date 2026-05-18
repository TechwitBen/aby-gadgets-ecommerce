import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { wishlistService } from "@/services/wishlist.service";
import type { Product } from "@/services/products.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WishlistContextValue {
  wishlistIds: Set<string>;
  wishlistProducts: Product[];
  /** Always accurate — use this for header badge counts */
  wishlistCount: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const LOCAL_KEY = "aby_wishlist_ids";

const saveLocal = (ids: Set<string>) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
};

const loadLocal = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(loadLocal);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  // ── Stable ref so callbacks never capture stale isAuthenticated ───────────
  const isAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // ── Fetch wishlist from server ─────────────────────────────────────────────
  const refreshWishlist = useCallback(async () => {
    if (!isAuthRef.current) return;
    setIsLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      const ids = new Set(data.productIds);
      setWishlistIds(ids);
      setWishlistProducts(data.wishlist ?? []);
      saveLocal(ids);
    } catch {
      // network / 401 — keep current state intact
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch whenever auth state changes (login / logout)
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      // Logged out — clear server products but keep localStorage IDs for guests
      setWishlistProducts([]);
    }
  }, [isAuthenticated]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    async (productId: string) => {
      const wasInList = wishlistIds.has(productId);

      // 1. Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        wasInList ? next.delete(productId) : next.add(productId);
        saveLocal(next);
        return next;
      });

      // Guest: localStorage only — done
      if (!isAuthRef.current) {
        return;
      }

      try {
        const res = await wishlistService.toggle(productId);
        const serverIds = new Set(res.productIds);
        setWishlistIds(serverIds);
        saveLocal(serverIds);
        await refreshWishlist();

        if (!res.inWishlist) {
          setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
        }
      } catch (error) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          wasInList ? next.add(productId) : next.delete(productId);
          saveLocal(next);
          return next;
        });
        toast.error("Could not update your wishlist. Please try again.");
      }
    },
    [wishlistIds, refreshWishlist],
  );

  // ── Explicit remove (trash icon on wishlist page) ─────────────────────────
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        saveLocal(next);
        return next;
      });
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));

      if (!isAuthRef.current) return;
      try {
        await wishlistService.remove(productId);
      } catch {
        refreshWishlist(); // rollback by re-syncing
      }
    },
    [refreshWishlist],
  );

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearWishlist = useCallback(async () => {
    setWishlistIds(new Set());
    setWishlistProducts([]);
    saveLocal(new Set());
    if (!isAuthRef.current) return;
    try {
      await wishlistService.clear();
    } catch {
      /* silent */
    }
  }, []);

  // ── isInWishlist ───────────────────────────────────────────────────────────
  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        wishlistCount: wishlistIds.size,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useWishlist = (): WishlistContextValue => {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};

export default WishlistContext;
