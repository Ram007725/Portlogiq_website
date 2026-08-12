import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext();

async function fetchUniqueItemCount() {
  const res = await api.get("/api/store/cart/items");
  const items = res.data?.items;
  return Array.isArray(items) ? items.length : 0;
}

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setCartCount(await fetchUniqueItemCount());
      } catch (err) {
        console.error("Cart count error:", err);
      }
    };
    fetchCount();
  }, []);

  const refreshCartCount = async () => {
    try {
      setCartCount(await fetchUniqueItemCount());
    } catch (err) {
      console.error("Refresh cart count error:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
