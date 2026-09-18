import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { OrderResponse, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    ecommerceService.getOrders().then(setOrders);
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="brand" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Hoàn thành
          </Badge>
        );
      case 'PARTIALLY_SHIPPED':
        return (
          <Badge variant="info" size="sm">
            <Truck className="w-3 h-3 mr-1 inline" /> Giao một phần
          </Badge>
        );
      case 'SHIPPED':
        return (
          <Badge variant="info" size="sm">
            <Truck className="w-3 h-3 mr-1 inline" /> Đang vận chuyển
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1 inline" /> Đã duyệt & Khóa kho
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3 h-3 mr-1 inline" /> Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            Chờ xử lý
          </Badge>
        );
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Theo dõi trạng thái đơn hàng, tiến độ vận đơn đa kho và xem chi tiết giao nhận.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 sm:gap-6 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'CONFIRMED', label: 'Đã xác nhận' },
          { key: 'SHIPPED', label: 'Đang giao hàng' },
          { key: 'COMPLETED', label: 'Hoàn thành' },
          { key: 'CANCELLED', label: 'Đã hủy' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Package className="w-10 h-10 text-zinc-400 mx-auto" />
            <p className="text-sm font-bold">Không có đơn hàng nào</p>
            <p className="text-xs text-zinc-500">Chưa có đơn hàng trong trạng thái này.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-[11px] text-zinc-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-zinc-400">{item.variantName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-[10px] text-zinc-400">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Giao đến: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.city}</span>
                </span>
                <div>
                  <span className="text-zinc-500 mr-2">Tổng thanh toán:</span>
                  <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
