import React from 'react';
import { Check, Clock, PackageCheck, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="text-xs font-bold">Đơn hàng đã hủy</p>
          <p className="text-[11px] text-rose-500/80">
            Tồn kho khả dụng đã được tự động hoàn trả.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'RETURN_REQUESTED' || status === 'PARTIALLY_RETURNED' || status === 'RETURNED') {
    const labels = {
      RETURN_REQUESTED: ['Yêu cầu trả hàng đang được xử lý', 'Theo dõi lộ trình lấy hàng trong mục yêu cầu trả hàng.'],
      PARTIALLY_RETURNED: ['Đã trả một phần đơn hàng', 'Một phần sản phẩm đã được kiểm nhận và hoàn tiền.'],
      RETURNED: ['Đơn hàng đã được trả', 'Toàn bộ sản phẩm đã được kiểm nhận và hoàn tiền.'],
    } as const;
    const [title, description] = labels[status];
    return <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"><PackageCheck className="h-5 w-5 shrink-0" /><div><p className="text-xs font-bold">{title}</p><p className="text-[11px] text-amber-600/80 dark:text-amber-300/80">{description}</p></div></div>;
  }

  const steps = [
    { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán', icon: <Clock className="w-4 h-4" /> },
    { key: 'CONFIRMED', label: 'Đã xác nhận & giữ hàng', icon: <PackageCheck className="w-4 h-4" /> },
    { key: 'SHIPPED', label: 'Đang vận chuyển', icon: <Truck className="w-4 h-4" /> },
    { key: 'COMPLETED', label: 'Hoàn thành', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 1,
    PARTIALLY_SHIPPED: 2,
    SHIPPED: 2,
    COMPLETED: 3,
    RETURN_REQUESTED: 3,
    PARTIALLY_RETURNED: 3,
    RETURNED: 3,
    CANCELLED: -1,
  };

  const currentIndex = statusOrder[status];

  return (
    <div className="w-full py-2">
      <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 z-0 hidden h-1 -translate-y-1/2 bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <div
          className="absolute top-1/2 left-0 z-0 hidden h-1 -translate-y-1/2 bg-brand-500 transition-all duration-500 sm:block"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex items-center gap-3 sm:flex-col sm:gap-0 group">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                    : isCurrent
                    ? 'bg-white dark:bg-zinc-900 border-2 border-brand-500 text-brand-600 dark:text-brand-400 ring-4 ring-brand-500/10'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span
                className={`text-[11px] font-semibold text-start sm:mt-2 sm:text-center ${
                  isDone || isCurrent
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
