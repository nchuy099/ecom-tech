import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';

export const CartPage: React.FC = () => {
  const { items, itemCount, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const finalTotal = Math.max(0, totalAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Hãy dạo quanh cửa hàng và chọn các sản phẩm công nghệ tuyệt vời bạn yêu thích nhé!
        </p>
        <Button onClick={() => navigate('/catalog')}>Khám phá sản phẩm</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Giỏ Hàng Mua Sắm ({itemCount})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Kiểm tra các sản phẩm đã chọn trước khi tiến hành thanh toán và phân bổ kho hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map(item => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-600 transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.variantName}</p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-2 sm:mt-0">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                        {formatCurrency(item.lineTotal)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {formatCurrency(item.price)} / sp
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-zinc-500 text-xs">
                Xóa toàn bộ giỏ hàng
              </Button>
              <Link to="/catalog" className="text-xs font-bold text-brand-600 hover:underline">
                Tiếp tục mua hàng →
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Tóm Tắt Đơn Hàng
            </h3>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tạm tính</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Vận chuyển đa kho</span>
                <span className="text-brand-600 font-semibold">Miễn phí toàn quốc</span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-900 dark:text-zinc-100 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span>Tổng tiền cần trả</span>
                <span className="text-lg text-brand-600 dark:text-brand-400">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full font-bold"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/checkout')}
            >
              Tiến Hành Đặt Hàng
            </Button>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-[11px] text-zinc-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Thông tin đặt hàng và thanh toán của bạn luôn được bảo vệ.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
