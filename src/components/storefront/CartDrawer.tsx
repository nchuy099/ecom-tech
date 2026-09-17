import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, itemCount, totalAmount, updateQuantity, removeItem } =
    useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-slide-left">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-50 dark:bg-brand-950/60 rounded-xl text-brand-600 dark:text-brand-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Giỏ Hàng Của Bạn
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {itemCount > 0 ? `${itemCount} sản phẩm sẵn sàng giao` : 'Giỏ hàng đang trống'}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Chưa có món hàng nào
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Hãy khám phá bộ sưu tập công nghệ mới nhất và thêm sản phẩm vào giỏ nhé!
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    closeCart();
                    navigate('/catalog');
                  }}
                >
                  Khám phá ngay
                </Button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                >
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.variantName}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(item.price)}
                      </span>

                      {/* Quantity modifier */}
                      <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-zinc-900">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-1.5 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Vận chuyển đa kho</span>
                  <span className="text-brand-600 dark:text-brand-400 font-semibold">
                    Tự động tối ưu
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Tổng thanh toán</span>
                  <span className="text-base text-brand-600 dark:text-brand-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                >
                  Thanh Toán Ngay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    closeCart();
                    navigate('/cart');
                  }}
                >
                  Xem Chi Tiết Giỏ Hàng
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
