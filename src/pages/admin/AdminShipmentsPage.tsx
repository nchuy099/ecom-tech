import React, { useState, useEffect } from 'react';
import { Truck, UserCheck, CheckCircle2, Clock, MapPin, Package } from 'lucide-react';
import { mockService } from '../../services/mockService';
import { ShipmentResponse, ShipmentStatus } from '../../types';
import { formatDistance, formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminShipmentsPage: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentResponse | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [shipperName, setShipperName] = useState('Trần Văn Tốc Độ (0912 345 678)');
  const { addToast } = useToast();

  useEffect(() => {
    mockService.getShipments().then(setShipments);
  }, []);

  const handleOpenAssign = (shp: ShipmentResponse) => {
    setSelectedShipment(shp);
    setIsAssignModalOpen(true);
  };

  const handleAssignShipper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    setShipments(prev =>
      prev.map(s =>
        s.id === selectedShipment.id
          ? {
              ...s,
              shipperName,
              status: 'READY_FOR_PICKUP' as ShipmentStatus,
            }
          : s
      )
    );

    setIsAssignModalOpen(false);
    addToast('success', 'Gán tài xế thành công!', `Đã chỉ định: ${shipperName}`);
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
        <table className="w-full text-left text-xs">
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
            {shipments.map(s => (
              <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {s.trackingNumber}
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{s.warehouseName}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{s.recipientName}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{s.deliveryAddress}</p>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                  {formatDistance(s.distanceKm)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'DELIVERED' ? 'brand' : 'warning'} size="sm">
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                  {s.shipperName ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {s.shipperName}
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Chưa phân công</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenAssign(s)}
                  >
                    Gán Shipper
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Shipper Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Phân Công Shipper Giao Hàng"
        description="Mô phỏng POST /api/v1/admin/shipments/{id}/assign-shipper"
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
                value={shipperName}
                onChange={e => setShipperName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Trần Văn Tốc Độ (0912 345 678)">
                  Trần Văn Tốc Độ (Khu vực Cầu Giấy / Từ Liêm)
                </option>
                <option value="Nguyễn Văn Giao Nhanh (0933 222 111)">
                  Nguyễn Văn Giao Nhanh (Khu vực Đống Đa / Ba Đình)
                </option>
                <option value="Lê Văn Hỏa Tốc (0977 888 999)">
                  Lê Văn Hỏa Tốc (Khu vực Hoàn Kiếm / Long Biên)
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button size="sm" type="submit">
                Xác Nhận Phân Công
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
