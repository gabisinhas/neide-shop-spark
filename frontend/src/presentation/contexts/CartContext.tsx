import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../../domain/entities/Product";
import { CartItem } from "../../domain/entities/CartItem";
import { appDependencies, type CartDependencies } from "../../infrastructure/composition/appDependencies";
import { getEffectiveProductPrice } from "../../shared/utils/productPricing";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  dependencies?: CartDependencies;
}

export const CartProvider = ({ children, dependencies = appDependencies.cart }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = async () => {
    const data = await dependencies.repository.getCart();
    setItems([...data]);
  };

  useEffect(() => {
    void fetchCart();
  }, [dependencies]);

  const addItem = async (product: Product) => {
    await dependencies.addToCart.execute(product);
    await fetchCart();
    setIsOpen(true);
  };

  const removeItem = async (productId: string) => {
    await dependencies.removeFromCart.execute(productId);
    await fetchCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    await dependencies.updateCartQuantity.execute(productId, quantity);
    await fetchCart();
  };

  const clearCart = async () => {
    await dependencies.clearCart.execute();
    await fetchCart();
  };

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce(
    (acc, i) => acc + getEffectiveProductPrice(i.product) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
