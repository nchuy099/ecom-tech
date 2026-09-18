import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItemResponse, ProductSummaryResponse, ProductVariantDetailResponse } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { ecommerceService } from '../services/ecommerceService';

interface CartContextType {
  items: CartItemResponse[];
  itemCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    product: ProductSummaryResponse | { id: string; name: string },
    variant: ProductVariantDetailResponse | { variantId: string; variantName: string; sku: string; price: number; imageUrl?: string; availableQuantity: number },
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemResponse[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      setItems([]);
      return;
    }

    ecommerceService
      .getCart()
      .then(cart => setItems(cart.items))
      .catch(() => setItems([]));
  }, [isAuthenticated, role]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = async (
    product: ProductSummaryResponse | { id: string; name: string },
    variant: ProductVariantDetailResponse | { variantId: string; variantName: string; sku: string; price: number; imageUrl?: string; availableQuantity: number },
    quantity = 1
  ) => {
    const cart = await ecommerceService.addCartItem(variant.variantId, quantity);
    setItems(cart.items);

    addToast(
      'success',
      'Đã thêm vào giỏ hàng!',
      `${product.name} (${variant.variantName}) x${quantity}`
    );
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const cart = await ecommerceService.updateCartItem(itemId, quantity);
    setItems(cart.items);
  };

  const removeItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    await ecommerceService.removeCartItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    if (item) {
      addToast('info', 'Đã xóa sản phẩm', item.productName);
    }
  };

  const clearCart = async () => {
    await ecommerceService.clearCart().catch(() => undefined);
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
