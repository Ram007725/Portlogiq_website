import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "portlogiq_wishlist";
const WishlistContext = createContext(null);

function readStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Wishlist save error:", err);
    }
  }, [items]);

  const isWishlisted = useCallback(
    (id) => items.some((item) => item.id === id),
    [items]
  );

  const toggleWishlist = useCallback((product) => {
    if (!product?.id) return false;

    const alreadySaved = items.some((item) => item.id === product.id);

    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }

      const img =
        product.images && product.images.length > 0 ? product.images[0] : product.img || null;

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          img,
        },
      ];
    });

    return !alreadySaved;
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      wishlistCount: items.length,
      isWishlisted,
      toggleWishlist,
    }),
    [items, isWishlisted, toggleWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
};
