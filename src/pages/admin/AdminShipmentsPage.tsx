import React, { useState, useEffect } from 'react';
import { Truck, UserCheck, CheckCircle2, Clock, MapPin, Package } from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { ShipmentResponse, UserProfile } from '../../types';
import { formatDistance, formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const ASSIGNABLE_SHIPMENT_STATUSES = new Set(['PENDING_PACKING', 'READY_FOR_PICKUP']);

export const AdminShipmentsPage: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [shippers, setShippers] = useState<UserProfile[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentResponse | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [shipperId, setShipperId] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    ecommerceService.getShipments().then(setShipments);
    ecommerceService.getShippers().then(data => {
      setShippers(data);
      setShipperId(current => current || data[0]?.id || '');
    });
  }, []);

  const handleOpenAssign = (shp: ShipmentResponse) => {
    if (!ASSIGNABLE_SHIPMENT_STATUSES.has(shp.status)) {
      return;
    }

    setSelectedShipment(shp);
    setShipperId(shp.shipperId || shippers[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignShipper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !shipperId) return;

    const updated = await ecommerceService.assignShipper(selectedShipment.id, shipperId);

    setShipments(prev => prev.map(s => (s.id === updated.id ? updated : s)));

    setIsAssignModalOpen(false);
    addToast('success', 'Gán tài xế thành công!', updated.shipperName || 'Đã phân công shipper');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Điều Phối Vận Chuyển & Giao Hàng (Shipments)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Quản lý luồng xuất xưởng, bàn giao kiện hàng cho đơn vị vận chuyển và gán shipper.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <table className="responsive-table w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 uppercase font-mono tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Mã Vận Đơn</th>
              <th className="py-3 px-4">Kho Xuất Hàng</th>
              <th className="py-3 px-4">Người Nhận & Địa Chỉ</th>
              <th className="py-3 px-4">Cự Ly</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4">Shipper Phụ Trách</th>
              <th className="py-3 px-4 text-right">Điều Phối</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {shipments.map(s => {
              const canAssignShipper = ASSIGNABLE_SHIPMENT_STATUSES.has(s.status);
              const assignButtonLabel = s.shipperName ? 'Gán Lại' : 'Gán Shipper';

              return (
                <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td data-label="Mã vận đơn" className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {s.trackingNumber}
                  </td>
                  <td data-label="Kho xuất hàng" className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{s.warehouseName}</td>
                  <td data-label="Người nhận" className="py-3 px-4">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{s.recipientName}</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{s.deliveryAddress}</p>
                  </td>
                  <td data-label="Cự ly" className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {formatDistance(s.distanceKm)}
                  </td>
                  <td data-label="Trạng thái" className="py-3 px-4">
                    <Badge variant={s.status === 'DELIVERED' ? 'brand' : 'warning'} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                  <td data-label="Shipper" className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {s.shipperName ? (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {s.shipperName}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">Chưa phân công</span>
                    )}
                  </td>
                  <td data-label="Điều phối" className="py-3 px-4 text-right">
                    {canAssignShipper && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenAssign(s)}
                      >
                        {assignButtonLabel}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Assign Shipper Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Phân Công Shipper Giao Hàng"
        description="Chọn tài xế phụ trách xử lý vận đơn này"
      >
        {selectedShipment && (
          <form onSubmit={handleAssignShipper} className="space-y-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                Vận đơn: {selectedShipment.trackingNumber}
              </p>
              <p className="text-zinc-500">Kho xuất: {selectedShipment.warehouseName}</p>
              <p className="text-zinc-500">
                Giao đến: {selectedShipment.recipientName} ({selectedShipment.deliveryAddress})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Chọn tài xế khả dụng:
              </label>
              <select
                value={shipperId}
                onChange={e => setShipperId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                {shippers.map(shipper => (
                  <option key={shipper.id} value={shipper.id}>
                    {shipper.displayName} ({shipper.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" variant="outline" size="sm" type="button" onClick={() => setIsAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit">
                Xác Nhận Phân Công
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
