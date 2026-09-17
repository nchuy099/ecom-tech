import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Plus, Edit2, Boxes, ShieldCheck, Check } from 'lucide-react';
import { mockService } from '../../services/mockService';
import { WarehouseResponse, InventoryResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminWarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryResponse | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const { addToast } = useToast();

  useEffect(() => {
    mockService.getWarehouses().then(setWarehouses);
    mockService.getInventory().then(setInventory);
  }, []);

  const handleOpenAdjust = (item: InventoryResponse) => {
    setSelectedItem(item);
    setAdjustAmount(10);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    await mockService.adjustInventory(selectedItem.warehouseId, selectedItem.variantId, adjustAmount);
    setInventory(prev =>
      prev.map(item =>
        item.id === selectedItem.id
          ? { ...item, availableQuantity: Math.max(0, item.availableQuantity + adjustAmount) }
          : item
      )
    );

    setIsAdjustModalOpen(false);
    addToast(
      'success',
      'Đã cập nhật tồn kho!',
      `${selectedItem.productName} (${adjustAmount > 0 ? `+${adjustAmount}` : adjustAmount})`
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Mạng Lưới Tổng Kho & Quản Trị Tồn Kho
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Kiểm soát tọa độ địa lý phục vụ thuật toán Haversine và điều chỉnh số lượng tồn kho từng điểm xuất hàng.
        </p>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {warehouses.map(wh => (
          <div
            key={wh.id}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{wh.name}</h3>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{wh.code}</span>
                </div>
              </div>
              <Badge variant="brand" size="sm">
                <Check className="w-3 h-3 mr-1" /> Đang hoạt động
              </Badge>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{wh.addressLine}</p>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>[{wh.latitude}, {wh.longitude}]</span>
              </span>
              <span className="text-brand-600 font-semibold">Ready to Dispatch</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Bảng Phân Bổ Tồn Kho Chi Tiết (Inventory Levels)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Endpoint: /api/v1/admin/inventory
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 uppercase font-mono tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Vị Trí Kho</th>
                <th className="py-3 px-4">Tồn Khả Dụng</th>
                <th className="py-3 px-4">Tồn Tạm Giữ (Lock)</th>
                <th className="py-3 px-4 text-right">Điều Chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {item.productName}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">{item.warehouseName}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.availableQuantity} sp
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {item.reservedQuantity} sp
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenAdjust(item)}
                    >
                      Chỉnh Kho
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Inventory Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Điều Chỉnh Số Lượng Tồn Kho"
        description="Mô phỏng POST /api/v1/admin/inventory/adjust"
      >
        {selectedItem && (
          <form onSubmit={handleAdjustInventory} className="space-y-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedItem.productName}</p>
              <p className="text-zinc-500 font-mono">SKU: {selectedItem.sku}</p>
              <p className="text-zinc-500">Kho: {selectedItem.warehouseName}</p>
              <p className="text-brand-600 font-semibold pt-1">
                Tồn khả dụng hiện tại: {selectedItem.availableQuantity} sp
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Số lượng thay đổi (+ để nhập thêm, - để giảm):
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={e => setAdjustAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-brand-500"
                required
              />
              <p className="text-[11px] text-zinc-400">
                Tồn kho mới sau khi điều chỉnh:{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.max(0, selectedItem.availableQuantity + adjustAmount)} sp
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAdjustModalOpen(false)}>
                Hủy
              </Button>
              <Button size="sm" type="submit">
                Xác Nhận Điều Chỉnh
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
