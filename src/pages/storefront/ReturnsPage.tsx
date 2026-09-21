import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { ReturnResponse } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

const statusLabel: Record<ReturnResponse['status'], string> = {
  REQUESTED: 'Đang chờ duyệt',
  APPROVED: 'Đã duyệt, chờ lấy hàng',
  REJECTED: 'Đã từ chối',
  RECEIVED: 'Đã về kho',
  RESTOCKED: 'Đã kiểm hàng',
  REFUNDED: 'Đã hoàn tiền',
};

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnResponse[]>([]);

  useEffect(() => {
    ecommerceService.getReturns().then(setReturns);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-7 sm:px-6 sm:py-10">
      <Link to="/orders" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <ArrowLeft className="h-4 w-4" /> Đơn hàng
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Yêu cầu trả hàng</h1>
          <p className="mt-1 text-xs text-zinc-500">Theo dõi việc lấy hàng, kiểm nhận và hoàn tiền.</p>
        </div>
        <Link to="/orders" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          <RotateCcw className="h-4 w-4" /> Tạo từ đơn hàng
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <PackageCheck className="mx-auto h-8 w-8 text-zinc-400" />
          <p className="mt-3 text-sm font-bold">Chưa có yêu cầu trả hàng</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map(value => (
            <article key={value.id} className="border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">Đơn #{value.orderId.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-zinc-500">Gửi {value.createdAt ? formatDate(value.createdAt) : 'gần đây'} · {value.items.length} sản phẩm</p>
                </div>
                <Badge variant={value.status === 'REJECTED' ? 'danger' : value.status === 'REFUNDED' ? 'brand' : 'warning'} size="sm">{statusLabel[value.status]}</Badge>
              </div>
              <p className="mt-3 break-words text-xs text-zinc-700 dark:text-zinc-300">{value.reason}</p>
              {value.decisionNote && <p className="mt-2 border-l-2 border-zinc-300 pl-2 text-xs text-zinc-500 dark:border-zinc-600">{value.decisionNote}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                {value.shipments.map(shipment => <span key={shipment.id} className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 dark:bg-zinc-800"><Truck className="h-3 w-3" /> {shipment.trackingNumber}: {shipment.status}</span>)}
                {value.refundableAmount ? <span className="rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Hoàn {formatCurrency(value.refundableAmount)}</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
