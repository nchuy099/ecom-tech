import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Navigation,
} from 'lucide-react';
import { mockService } from '../../services/mockService';
import { ShipmentResponse, ShipmentStatus } from '../../types';
import { formatDistance, formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const ShipperDashboardPage: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    mockService.getShipments().then(setShipments);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ShipmentStatus, label: string) => {
    await mockService.updateShipmentStatus(id, newStatus);
    setShipments(prev =>
      prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
    );
    addToast('success', 'Đã cập nhật vận đơn!', `Trạng thái mới: ${label}`);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 pb-20 text-zinc-900 dark:text-zinc-100">
      {/* Shipper Header */}
      <header className="sticky top-0 z-30 bg-emerald-700 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold leading-none">Cổng Tài Xế (Shipper)</h1>
            <p className="text-[11px] text-emerald-200 mt-0.5">Trần Văn Tốc Độ • Ca Sáng</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-800/80 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
          <Truck className="w-3.5 h-3.5" />
          <span>{shipments.length} đơn</span>
        </div>
      </header>

      {/* Main tasks container */}
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
          <span className="font-bold uppercase tracking-wider">Danh sách kiện hàng cần giao</span>
          <span>Hôm nay</span>
        </div>

        {shipments.map(s => {
          const isDelivered = s.status === 'DELIVERED';
          const isOutForDelivery = s.status === 'OUT_FOR_DELIVERY';

          return (
            <div
              key={s.id}
              className={`p-5 rounded-3xl border shadow-sm space-y-4 transition-all ${
                isDelivered
                  ? 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 opacity-80'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Task Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {s.trackingNumber}
                  </span>
                </div>
                <Badge
                  variant={
                    s.status === 'DELIVERED'
                      ? 'brand'
                      : s.status === 'OUT_FOR_DELIVERY'
                      ? 'info'
                      : 'warning'
                  }
                  size="sm"
                >
                  {s.status}
                </Badge>
              </div>

              {/* Recipient details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {s.recipientName}
                    </h3>
                    <p className="text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <a href={`tel:${s.recipientPhone}`} className="text-brand-600 font-mono font-bold">
                        {s.recipientPhone}
                      </a>
                    </p>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(s.deliveryAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-brand-600 dark:text-brand-400 flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Dẫn đường</span>
                  </a>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                  <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{s.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                    <span>Kho xuất: {s.warehouseName}</span>
                    <span className="text-brand-600 font-bold">{formatDistance(s.distanceKm)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {!isDelivered ? (
                  <>
                    <Button
                      variant={isOutForDelivery ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(s.id, 'OUT_FOR_DELIVERY', 'Đang giao hàng')
                      }
                      disabled={isOutForDelivery}
                    >
                      {isOutForDelivery ? 'Đang trên đường giao' : 'Bắt Đầu Giao'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() =>
                        handleUpdateStatus(s.id, 'DELIVERED', 'Giao thành công')
                      }
                    >
                      Giao Thành Công
                    </Button>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã hoàn tất phát hàng thành công</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
