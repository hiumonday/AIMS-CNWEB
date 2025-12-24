import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import cartService, { type CartLine } from "../services/cartService";

type CartContextValue = {
  items: CartLine[];
  addItem: (productId: string, qty?: number) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => void;
  lines: CartLine[];
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  
  const sessionKey = cartService.getSessionKey();

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      const cart = await cartService.getCart(sessionKey);
      if (cart && cart.items) {
        setItems(cart.items);
        // Use totalBeforeVat from response as subtotal, or sum items
        setCartSubtotal(cart.totalBeforeVat || 0);
      } else {
        setItems([]);
        setCartSubtotal(0);
      }
    } catch (err) {
      console.error("Failed to refresh cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart from backend on mount
  useEffect(() => {
    refreshCart();
  }, [sessionKey]);

  const addItem = async (productId: string, qty = 1) => {
    try {
      const updatedCart = await cartService.addItem(sessionKey, {
        productId: Number(productId),
        quantity: qty,
      });

      if (updatedCart.items) {
        setItems(updatedCart.items);
        setCartSubtotal(updatedCart.totalBeforeVat || 0);
      }
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      // Optimistic update could go here, but with complex response, safer to just rely on server or simple retry
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    if (qty <= 0) {
      return removeItem(productId);
    }

    try {
      const updatedCart = await cartService.updateItem(sessionKey, {
        productId: Number(productId),
        quantity: qty,
      });

      if (updatedCart.items) {
        setItems(updatedCart.items);
        setCartSubtotal(updatedCart.totalBeforeVat || 0);
      }
    } catch (err) {
      console.error("Failed to update cart item:", err);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const cartItemId = Number(productId);
      await cartService.removeItem(sessionKey, cartItemId);
      // For remove, we might need to refresh or just filter locally if we don't get full cart back
      // cartService.removeItem returns void in current def.
      // We should probably refresh cart or filter locally to update UI immediately
      setItems((prev) => prev.filter((i) => i.productId !== Number(productId)));
      // Note: Subtotal won't update accurately with local filter unless we calc it. 
      // Ideally API returns updated cart on delete too, but service says void.
      // Let's re-fetch or calc locally.
      refreshCart(); 
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    }
  };

  const clear = () => {
    setItems([]);
    setCartSubtotal(0);
    cartService.clearSessionKey();
  };

  // lines is just items now, ensuring compatibility 
  const lines = items;

  const totalItems = useMemo(
    () => items.reduce((acc, line) => acc + line.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    updateQty,
    removeItem,
    clear,
    lines,
    subtotal: cartSubtotal,
    totalItems,
    isLoading,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
