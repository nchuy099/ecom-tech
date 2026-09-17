import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItemResponse, ProductSummaryResponse, ProductVariantDetailResponse } from '../types';
import { useToast } from './ToastContext';

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
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemResponse[]>(() => {
    const saved = localStorage.getItem('ecom_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Default initial cart item for a great immediate demo experience
    return [
      {
        id: 'cart-item-demo-01',
        variantId: 'var-02-desert',
        productId: 'prod-02',
        productName: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên',
        variantName: 'Titan Sa Mạc / 256GB',
        sku: 'IP16PM-256-DESERT',
        price: 34490000,
        quantity: 1,
        lineTotal: 34490000,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        availableQuantity: 35,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (
    product: ProductSummaryResponse | { id: string; name: string },
    variant: ProductVariantDetailResponse | { variantId: string; variantName: string; sku: string; price: number; imageUrl?: string; availableQuantity: number },
    quantity = 1
  ) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.variantId === variant.variantId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + quantity;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          lineTotal: newQty * current.price,
        };
        return updated;
      } else {
        const newItem: CartItemResponse = {
          id: `cart-${Date.now()}`,
          variantId: variant.variantId,
          productId: product.id,
          productName: product.name,
          variantName: variant.variantName,
          sku: variant.sku,
          price: variant.price,
          quantity,
          lineTotal: variant.price * quantity,
          imageUrl: variant.imageUrl || ('imageUrl' in product ? product.imageUrl : undefined),
          availableQuantity: variant.availableQuantity,
        };
        return [...prev, newItem];
      }
    });

    addToast(
      'success',
      'Đã thêm vào giỏ hàng!',
      `${product.name} (${variant.variantName}) x${quantity}`
    );
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              lineTotal: item.price * quantity,
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    if (item) {
      addToast('info', 'Đã xóa sản phẩm', item.productName);
    }
  };

  const clearCart = () => {
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
