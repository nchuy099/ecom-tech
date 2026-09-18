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
    CANCELLED: -1,
  };

  const currentIndex = statusOrder[status];

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
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
                className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
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
