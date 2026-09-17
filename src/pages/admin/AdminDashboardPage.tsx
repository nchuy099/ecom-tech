import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  Truck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { mockService } from '../../services/mockService';
import { OrderResponse, InventoryResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);

  useEffect(() => {
    mockService.getOrders().then(setOrders);
    mockService.getInventory().then(setInventory);
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAvailableStock = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const totalReservedStock = inventory.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const lowStockItems = inventory.filter(i => i.availableQuantity <= 15);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Tổng Quan Hoạt Động (Dashboard)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Báo cáo thời gian thực doanh thu, trạng thái các cụm tổng kho và kiểm soát đơn hàng.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% so với tháng trước</span>
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Tổng Số Đơn Hàng
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{orders.length}</p>
            <p className="text-[11px] text-zinc-400 mt-1">Giao dịch được ghi nhận</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Tồn Kho Khả Dụng
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalAvailableStock}{' '}
              <span className="text-xs font-normal text-zinc-400 font-mono">units</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Đang sẵn sàng xuất kho</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Tồn Kho Tạm Giữ
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {totalReservedStock}{' '}
              <span className="text-xs font-normal text-zinc-400 font-mono">reserved</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Khóa bảo vệ bởi Pessimistic Lock</p>
          </div>
        </div>
      </div>

      {/* Grid: Recent orders & Low stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Đơn Hàng Gần Đây
            </h3>
            <Link
              to="/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    #{o.orderNumber}
                  </p>
                  <p className="text-[11px] text-zinc-400">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(o.totalAmount)}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Cảnh Báo Tồn Kho Thấp
            </h3>
          </div>

          <div className="space-y-3">
            {lowStockItems.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1"
              >
                <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {item.productName}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">SKU: {item.sku}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-zinc-400">{item.warehouseName}</span>
                  <Badge variant="warning" size="sm">
                    Còn {item.availableQuantity} sp
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/warehouses"
              className="block w-full py-2 text-center text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Điều Chỉnh Kho Ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
