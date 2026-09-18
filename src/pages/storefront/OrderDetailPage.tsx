import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Download,
  QrCode,
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { OrderResponse, ShipmentResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { OrderStatusStepper } from '../../components/storefront/OrderStatusStepper';
import { TrackingTimeline } from '../../components/storefront/TrackingTimeline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { downloadDataUrl, generateQrDataUrl, shipmentQrPayload } from '../../utils/qr';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
  const [shipmentQrDataUrl, setShipmentQrDataUrl] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (id) {
      ecommerceService.getOrderDetail(id).then(ord => {
        if (ord) {
          setOrder(ord);
          ecommerceService.getShipmentByOrder(ord.id).then(shp => {
            if (shp) setShipment(shp);
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (!shipment?.trackingNumber) {
      setShipmentQrDataUrl('');
      return;
    }

    let cancelled = false;

    generateQrDataUrl(shipmentQrPayload(shipment.trackingNumber)).then(dataUrl => {
      if (!cancelled) {
        setShipmentQrDataUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shipment?.trackingNumber]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-bold">Không tìm thấy đơn hàng</p>
        <Link to="/orders" className="text-xs font-semibold text-brand-600 hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    try {
      await ecommerceService.cancelOrder(order.id);
      setOrder(prev => (prev ? { ...prev, status: 'CANCELLED' } : null));
      setIsCancelModalOpen(false);
      addToast(
        'success',
        'Đã hủy đơn hàng thành công!',
        'Số lượng đã giữ cho đơn hàng được hoàn trả vào tồn kho khả dụng.'
      );
    } catch (err: any) {
      addToast('error', 'Không thể hủy đơn', err.message);
    }
  };

  const handleCreateReturn = async () => {
    if (!returnReason.trim()) {
      addToast('error', 'Chưa nhập lý do', 'Vui lòng cung cấp lý do yêu cầu đổi trả.');
      return;
    }

    try {
      await ecommerceService.createReturn(order.id, returnReason.trim());
      setIsReturnModalOpen(false);
      addToast(
        'success',
        'Đã gửi yêu cầu đổi trả',
        'Bộ phận hậu cần sẽ liên hệ xác nhận trong 24 giờ làm việc.'
      );
    } catch (err: any) {
      addToast('error', 'Không thể tạo yêu cầu đổi trả', err.message || 'Lỗi hệ thống');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách đơn hàng</span>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              #{order.orderNumber}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày đặt: {formatDate(order.createdAt)}</span>
          </p>
        </div>

        {/* Order Actions */}
        <div className="flex items-center gap-2">
          {order.status === 'PENDING_PAYMENT' && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Hủy Đơn Hàng
            </Button>
          )}
          {order.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsReturnModalOpen(true)}
            >
              Yêu Cầu Đổi Trả
            </Button>
          )}
        </div>
      </div>

      {/* Stepper Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <OrderStatusStepper status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items and Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Kiện hàng sản phẩm ({order.items.length})
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map(item => (
                <div key={item.id} className="py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{item.productName}</p>
                      <p className="text-zinc-500 mt-0.5">{item.variantName}</p>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-[11px] text-zinc-400">Số lượng: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Tổng thanh toán:</span>
              <span className="text-base font-black text-brand-600 dark:text-brand-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Tracking Timeline */}
          {shipment && shipment.timeline && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Nhật Ký Vận Đơn (Timeline)
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  Vận đơn: {shipment.trackingNumber}
                </span>
              </div>
              <TrackingTimeline events={shipment.timeline} />
            </div>
          )}
        </div>

        {/* Right: Address & Multi-warehouse info */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Địa Chỉ Nhận Hàng</span>
            </div>

            <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                {order.recipientName || 'Khách Hàng'}
              </p>
              <p>{order.phone || 'Chưa có số điện thoại'}</p>
              <p>{order.addressLine || order.city}</p>
            </div>
          </div>

          {shipment && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Package className="w-4 h-4 text-purple-600" />
                <span>Kho Hàng Phân Bổ</span>
              </div>

              <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {shipment.warehouseName}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Khoảng cách giao: {shipment.distanceKm} km
                </p>
                {shipment.shipperName && (
                  <p className="text-emerald-600 font-semibold pt-1">
                    Shipper: {shipment.shipperName}
                  </p>
                )}
              </div>
            </div>
          )}

          {shipment && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Mã QR Vận Đơn</span>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 text-center space-y-3">
                {shipmentQrDataUrl ? (
                  <img
                    src={shipmentQrDataUrl}
                    alt={`QR vận đơn ${shipment.trackingNumber}`}
                    className="mx-auto h-44 w-44 rounded-xl bg-white p-2"
                  />
                ) : (
                  <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl bg-white text-xs text-zinc-400">
                    Đang tạo QR...
                  </div>
                )}

                <div>
                  <p className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-100">
                    {shipment.trackingNumber}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Shipper có thể tải ảnh này lên để mở nhanh vận đơn.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={!shipmentQrDataUrl}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() =>
                    downloadDataUrl(
                      shipmentQrDataUrl,
                      `shipment-${shipment.trackingNumber}.png`
                    )
                  }
                >
                  Tải QR xuống
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Xác Nhận Hủy Đơn Hàng"
        description="Sau khi hủy, số lượng đã giữ sẽ được hoàn trả vào tồn kho."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Khi hủy đơn hàng, số lượng đang giữ sẽ được mở lại để khách khác có thể mua.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Giữ lại đơn
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelOrder}>
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Yêu Cầu Đổi Trả Sản Phẩm"
        description="Gửi yêu cầu đổi trả để bộ phận hậu cần kiểm tra và liên hệ lại"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Lý do đổi trả:
            </label>
            <textarea
              rows={3}
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              placeholder="Sản phẩm không đúng mô tả, lỗi kỹ thuật do nhà sản xuất..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsReturnModalOpen(false)}>
              Đóng
            </Button>
            <Button size="sm" onClick={handleCreateReturn}>
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
